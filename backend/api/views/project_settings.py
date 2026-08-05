from rest_framework import permissions

from api.models import ProjectSettings
from api.serializers import ProjectSettingsSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER
from api.views.base import ScopedModelViewSet


class ProjectSettingsViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    serializer_class = ProjectSettingsSerializer
    lookup_field = 'project__id'
    lookup_url_kwarg = 'project_id'

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                ProjectSettings.objects.select_related('project'),
                'project',
            )
        )

    def get_object(self):
        """Get or create project settings for a project."""
        project_id = self.kwargs.get('project_id')
        try:
            return ProjectSettings.objects.get(project_id=project_id)
        except ProjectSettings.DoesNotExist:
            from api.models import Project
            project = Project.objects.get(id=project_id)
            return ProjectSettings.objects.create(project=project)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        from api.models import Project
        project = Project.objects.get(id=project_id)
        serializer.save(project=project)

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]
