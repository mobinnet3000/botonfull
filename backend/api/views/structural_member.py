from rest_framework import permissions

from api.models import StructuralMember
from api.serializers import StructuralMemberReadSerializer, StructuralMemberWriteSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER
from api.views.base import ScopedModelViewSet
from api.filters import StructuralMemberFilter


class StructuralMemberViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    filterset_class = StructuralMemberFilter
    search_fields = ['name', 'member_type']
    ordering_fields = ['name', 'member_type', 'created_at']

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                StructuralMember.objects.select_related('project'),
                'project',
            )
            .prefetch_related('pour_series', 'pour_series__molds')
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return StructuralMemberReadSerializer
        return StructuralMemberWriteSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]
