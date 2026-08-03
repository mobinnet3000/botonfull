from rest_framework import viewsets, permissions, parsers

from api.models import LabProfile
from api.serializers import LabProfileSerializer
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN, get_role
from api.access import user_lab_ids


class LabProfileAccess(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        role = get_role(user)
        if role not in (ADMIN, LAB_MANAGER, TECHNICIAN):
            return False
        if request.method == 'POST' and role != ADMIN:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        if request.method in permissions.SAFE_METHODS:
            return True
        if role == ADMIN:
            return True
        if role == LAB_MANAGER:
            return obj.user_id == request.user.id
        return False


class LabProfileViewSet(viewsets.ModelViewSet):
    serializer_class = LabProfileSerializer
    permission_classes = [LabProfileAccess]

    def get_queryset(self):
        role = get_role(self.request.user)
        if role == ADMIN:
            return LabProfile.objects.all()
        if role in (LAB_MANAGER, TECHNICIAN):
            return LabProfile.objects.filter(id__in=user_lab_ids(self.request.user))
        return LabProfile.objects.none()
