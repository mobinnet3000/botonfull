from rest_framework import viewsets, permissions, parsers
from api.models import Sample
from api.serializers import SampleReadSerializer, SampleWriteSerializer, ActivityLogSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN, RECEPTION
from api.views.base import ScopedModelViewSet
from api.audit import log_activity
from api.filters import SampleFilter


class SampleViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN, RECEPTION)
    filterset_class = SampleFilter
    search_fields = ['code', 'barcode', 'category', 'concrete_factory', 'cement_grade']
    ordering_fields = ['date', 'status', 'age_in_days']

    def get_queryset(self):
        qs = scope_by_project(
            self.request.user, Sample.objects.select_related('project'), 'project',
        )
        return qs.prefetch_related('series__molds', 'series__photos', 'test_executions')

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SampleReadSerializer
        return SampleWriteSerializer

    def update(self, request, *args, **kwargs):
        from rest_framework.response import Response
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        if 'status' in request.data and request.data['status'] != instance.status:
            from api.services.notification_service import NotificationService
            if request.data['status'] == 'ready_for_test':
                NotificationService.notify_sample_ready(instance)
            log_activity('status_change', instance, old={'status': instance.status}, new={'status': request.data['status']})
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        log_activity('delete', instance)
        instance.delete()

    def history(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from api.models import ActivityLog
        instance = self.get_object()
        logs = ActivityLog.objects.filter(
            content_type='api.sample', object_id=instance.id,
        ).select_related('user')[:100]
        return Response(ActivityLogSerializer(logs, many=True, context={'request': request}).data)
