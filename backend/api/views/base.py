from rest_framework import viewsets, permissions

from api.permissions import RoleWritePermission
from api.roles import ADMIN


class ScopedModelViewSet(viewsets.ModelViewSet):
    """ModelViewSet با محدوده کوئری بر اساس نقش و کنترل نوشتن مبتنی بر نقش.

    اگر اکشن خاصی `permission_classes` داشته باشد (مثلا تأیید گزارش)،
    همان کلاس‌ها استفاده می‌شوند؛ در غیر این صورت اجازه نوشتن بر اساس
    `write_roles` و اجازه خواندن برای هر کاربر احراز هویت شده صادر می‌شود.
    """

    permission_classes = ()
    write_roles = (ADMIN,)

    def get_permissions(self):
        if self.permission_classes:
            return [permission() for permission in self.permission_classes]
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]


class ScopedReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    def get_permissions(self):
        return [permissions.IsAuthenticated()]
