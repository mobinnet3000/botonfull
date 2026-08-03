from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver

from api.models import Profile, Sample, Project, Client, Report, Equipment, TestExecution
from api.roles import ADMIN, CLIENT
from api.audit import log_activity


@receiver(post_save, sender=User)
def ensure_profile(sender, instance, created, **kwargs):
    if not created:
        return
    role = ADMIN if instance.is_superuser else CLIENT
    Profile.objects.get_or_create(user=instance, defaults={'role': role})


@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    log_activity('login', user, new={'username': user.username})


# ---------------------------------------------------------------------------
# لاگ‌های ایجاد / بروزرسانی / تغییر وضعیت مدل‌های کلیدی
# ---------------------------------------------------------------------------

AUDITED_MODELS = {
    Project: {},
    Sample: {'status': 'status_change'},
    Client: {},
    Report: {'status': 'approval'},
    Equipment: {},
    TestExecution: {'status': 'status_change', 'result_status': 'approval'},
}

_pre_values = {}


def _json_safe(value):
    from datetime import date, datetime, time
    from decimal import Decimal
    from uuid import UUID
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, UUID):
        return str(value)
    return value


def _pick(instance) -> dict:
    """فقط مقادیر فیلدهای مدل را با قابلیت سریال‌سازی JSON برمی‌گرداند."""
    data = {}
    for field in instance._meta.fields:
        try:
            value = getattr(instance, field.attname)
            if field.get_internal_type() in ('FileField', 'ImageField'):
                value = value.name if value else None
            data[field.name] = _json_safe(value)
        except Exception:
            pass
    return data


@receiver(pre_save)
def capture_old(sender, instance, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    if not instance.pk:
        return
    try:
        _pre_values[instance.pk] = _pick(sender.objects.get(pk=instance.pk))
    except sender.DoesNotExist:
        pass


@receiver(post_save)
def audit_save(sender, instance, created, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    fields = AUDITED_MODELS[sender]
    if created:
        log_activity('create', instance, new=_pick(instance))
        return
    old = _pre_values.pop(instance.pk, {})
    new = _pick(instance)
    if old and old != new:
        for field, action in fields.items():
            if old.get(field) != new.get(field):
                log_activity(action, instance, old={field: old.get(field)}, new={field: new.get(field)})
                break
        else:
            log_activity('update', instance, old=old, new=new)


@receiver(post_delete)
def audit_delete(sender, instance, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    log_activity('delete', instance, old=_pick(instance))
