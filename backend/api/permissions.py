from rest_framework.permissions import BasePermission, SAFE_METHODS

from api.roles import ADMIN, READONLY, REPORT_APPROVAL_ROLES, get_role


def role_of(user):
    return get_role(user) if user and user.is_authenticated else None


class RoleWritePermission(BasePermission):
    """اجازه دسترسی مبتنی بر نقش.

    - خواندن: هر کاربر احراز هویت شده (محدوده کوئری اعمال می‌شود).
    - نوشتن: فقط نقش‌های مشخص‌شده در `write_roles`.
    """

    def __init__(self, write_roles=(ADMIN,)):
        self.write_roles = write_roles

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return role_of(user) in self.write_roles

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return role_of(user) in self.write_roles


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return role_of(request.user) == ADMIN


class IsAdminOrLabManager(BasePermission):
    def has_permission(self, request, view):
        return role_of(request.user) in (ADMIN, 'lab_manager')


class ReportApprovalPermission(BasePermission):
    """تأیید/بازبینی گزارش فقط برای نقش‌های دارای صلاحیت تأیید."""

    def has_permission(self, request, view):
        return role_of(request.user) in (ADMIN, *REPORT_APPROVAL_ROLES)


class FactoryAccess(BasePermission):
    """دسترسی کارخانه: مدیر کارخانه فقط کارخانه خودش؛ مدیریت فقط خواندن."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        role = role_of(user)
        if role not in (ADMIN, 'lab_manager', 'factory_manager', READONLY):
            return False
        if request.method in ('POST', 'DELETE') and role != ADMIN:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        role = role_of(request.user)
        if role == ADMIN:
            return True
        if role == 'factory_manager':
            return obj.manager_id == request.user.id
        if role in ('lab_manager', 'readonly'):
            return request.method in SAFE_METHODS
        return False


class OwnResourcePermission(BasePermission):
    """دسترسی به منابع شخصی (تیکت، اعلان و...)؛ ادمین همه."""

    owner_field = 'user'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if role_of(request.user) == ADMIN:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner is not None and owner.id == request.user.id
