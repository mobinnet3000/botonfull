from rest_framework import viewsets, parsers
from rest_framework.exceptions import ValidationError

from api.models import AppFile, ActivityLog, Project, Sample, Report, TestExecution, LabRequest, Equipment
from api.access import can_access_project, scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN, RECEPTION, ENGINEER, READONLY, get_role
from api.views.base import ScopedModelViewSet
from api.serializers import AppFileSerializer, ActivityLogSerializer

FILE_TARGET_MODELS = {
    'project': Project,
    'sample': Sample,
    'report': Report,
    'testexecution': TestExecution,
    'labrequest': LabRequest,
    'equipment': Equipment,
}


class AppFileViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN, RECEPTION, ENGINEER)
    serializer_class = AppFileSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    filterset_fields = ['content_type', 'object_id']

    def get_queryset(self):
        qs = AppFile.objects.all()
        if get_role(self.request.user) in (ADMIN, READONLY):
            return qs
        return qs.filter(uploaded_by=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        content_type = serializer.validated_data.get('content_type')
        object_id = serializer.validated_data.get('object_id')
        model = FILE_TARGET_MODELS.get(content_type)
        if model is None:
            raise ValidationError({'content_type': 'نوع محتوای نامعتبر است.'})
        target = model.objects.filter(pk=object_id).first()
        if target is None:
            raise ValidationError({'object_id': 'شیء موردنظر یافت نشد.'})
        if get_role(user) != ADMIN and content_type != 'equipment':
            project = target if isinstance(target, Project) else getattr(target, 'project', None)
            if project is None:
                project = getattr(getattr(target, 'sample', None), 'project', None)
            if not can_access_project(user, project):
                raise ValidationError({'object_id': 'دسترسی به این شیء ندارید.'})
        serializer.save(uploaded_by=user)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    filterset_fields = ['action', 'content_type', 'user']
    search_fields = ['object_repr']

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        from api.permissions import IsAdmin
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return ActivityLog.objects.select_related('user')
