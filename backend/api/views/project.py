from rest_framework import permissions

from api.models import Project
from api.serializers import ProjectReadSerializer, ProjectWriteSerializer
from api.access import scope_projects
from api.roles import ADMIN, LAB_MANAGER
from api.filters import ProjectFilter
from api.views.base import ScopedModelViewSet


class ProjectViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    filterset_class = ProjectFilter
    search_fields = ['project_name', 'file_number', 'client_name', 'address', 'code']
    ordering_fields = ['created_at', 'project_name', 'status', 'priority', 'contract_price']

    def get_queryset(self):
        return (
            scope_projects(self.request.user)
            .with_financials()
            .select_related('owner', 'client', 'factory')
            .prefetch_related(
                'samples__series__molds', 'samples__series__photos',
                'transactions', 'lab_requests',
            )
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProjectReadSerializer
        return ProjectWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.lab_profile)

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]
