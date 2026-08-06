from django.db import models
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
        qs = (
            scope_projects(self.request.user)
            .with_financials()
            .select_related('owner', 'client', 'factory')
            .prefetch_related(
                'structural_members__pour_series__molds',
                'transactions', 'lab_requests',
            )
        )
        
        if self.action == 'list':
            qs = qs.annotate(
                member_count=models.Count('structural_members', distinct=True),
                pour_count=models.Count('structural_members__pour_series', distinct=True),
                mold_count=models.Count('structural_members__pour_series__molds', distinct=True),
                tested_mold_count=models.Count(
                    'structural_members__pour_series__molds',
                    filter=models.Q(structural_members__pour_series__molds__status__in=['completed', 'rejected']),
                    distinct=True,
                ),
            )
        
        return qs

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProjectReadSerializer
        return ProjectWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.lab_profile)

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]