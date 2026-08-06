from rest_framework import viewsets, permissions, parsers
from api.models import StructuralMember
from api.serializers import StructuralMemberReadSerializer, StructuralMemberWriteSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class StructuralMemberViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    filterset_class = None  # will be added if needed
    search_fields = ['name', 'member_type']

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                StructuralMember.objects.select_related('project').prefetch_related('pour_series'),
                'project',
            )
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return StructuralMemberReadSerializer
        return StructuralMemberWriteSerializer