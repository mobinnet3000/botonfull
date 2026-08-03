import threading

from django.db import transaction

from api.models import ActivityLog

_local = threading.local()


class AuditMiddleware:
    """ذخیره کاربر و IP جاری درخواست برای ثبت لاگ‌های فعالیت."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _local.user = request.user if request.user.is_authenticated else None
        _local.ip = request.META.get('REMOTE_ADDR', '')
        try:
            return self.get_response(request)
        finally:
            _local.user = None
            _local.ip = ''


def current_actor():
    return getattr(_local, 'user', None), getattr(_local, 'ip', '')


def log_activity(action, obj, old=None, new=None, user=None, ip=''):
    """ثبت لاگ فعالیت برای یک شیء.

    نوشتن در یک بلوک atomic جداگانه انجام می‌شود تا خطای احتمالی ثبت لاگ،
    تراکنش اصلی (ذخیره مدل) را از کار نیندازد.
    """
    if obj is None:
        return
    user = user or current_actor()[0]
    ip = ip or current_actor()[1]
    try:
        with transaction.atomic():
            ActivityLog.objects.create(
                user=user,
                action=action,
                content_type=obj._meta.label,
                object_id=getattr(obj, 'pk', None),
                object_repr=str(obj)[:255],
                old_value=old,
                new_value=new,
                ip=ip or None,
            )
    except Exception:
        # لاگ نباید جریان اصلی را مختل کند
        pass
