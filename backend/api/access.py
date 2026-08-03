"""دسترسی و محدوده‌سازی کوئری‌ها بر اساس نقش کاربر."""

from api.roles import (
    ADMIN, READONLY, FACTORY_MANAGER, SUPERVISOR, LAB_ROLES,
    get_role,
)

LAB_MEMBER_ROLES = LAB_ROLES


def user_lab_ids(user) -> set[int]:
    """شناسه‌های آزمایشگاه‌هایی که کاربر عضو آن‌هاست."""
    role = get_role(user)
    if role not in LAB_MEMBER_ROLES:
        return set()
    profile = getattr(user, 'profile', None)
    if profile is not None and profile.lab_id:
        return {profile.lab_id}
    if role == 'lab_manager':
        lab = getattr(user, 'lab_profile', None)
        return {lab.id} if lab else set()
    return set()


def is_admin_or_readonly(user) -> bool:
    return get_role(user) in (ADMIN, READONLY)


def scope_projects(user, qs=None):
    from api.models import Project
    qs = qs if qs is not None else Project.objects.all()
    role = get_role(user)
    if role in (ADMIN, READONLY):
        return qs
    if role in LAB_MEMBER_ROLES:
        lab_ids = user_lab_ids(user)
        return qs.filter(owner_id__in=lab_ids) if lab_ids else qs.none()
    if role == FACTORY_MANAGER:
        return qs.filter(factory__manager=user)
    if role == SUPERVISOR:
        return qs.filter(supervisor_user=user)
    return qs.filter(client_user=user)


def scope_by_project(user, qs, project_lookup='project'):
    """محدودسازی کوئری هر مدل وابسته به پروژه (نمونه، سری، قالب و...)."""
    if is_admin_or_readonly(user):
        return qs
    projects = scope_projects(user)
    return qs.filter(**{f'{project_lookup}__in': projects})


def scope_lab_catalog(user, qs):
    """محدودسازی منابع سراسری آزمایشگاه (دستگاه، مخزن، معیار پذیرش و...)."""
    role = get_role(user)
    if role in (ADMIN, READONLY) or role in LAB_MEMBER_ROLES:
        return qs
    return qs.none()


def project_of(obj):
    """پروژه متناظر هر شیء وابسته به پروژه."""
    if obj is None:
        return None
    from api.models import Project
    if isinstance(obj, Project):
        return obj
    project = getattr(obj, 'project', None)
    if project is not None:
        return project
    sample = getattr(obj, 'sample', None)
    if sample is not None:
        return sample.project
    series = getattr(obj, 'series', None)
    if series is not None:
        return series.sample.project
    return None


def can_access_project(user, project) -> bool:
    if project is None or user is None or not user.is_authenticated:
        return False
    role = get_role(user)
    if role in (ADMIN, READONLY):
        return True
    if role in LAB_MEMBER_ROLES:
        return project.owner_id in user_lab_ids(user)
    if role == FACTORY_MANAGER:
        return bool(project.factory_id and project.factory.manager_id == user.id)
    if role == SUPERVISOR:
        return project.supervisor_user_id == user.id
    return project.client_user_id == user.id


def can_write_lab_resource(user, project) -> bool:
    """قابلیت نوشتن روی منابع وابسته به آزمایشگاه (نمونه، سری، آزمون و...)."""
    role = get_role(user)
    if role == ADMIN:
        return True
    if role in LAB_MEMBER_ROLES:
        return project is not None and project.owner_id in user_lab_ids(user)
    return False
