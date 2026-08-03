from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import TestExecution
from api.serializers import TestExecutionSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN, QUALITY_MANAGER
from api.views.base import ScopedModelViewSet
from api.services.report_service import ReportService
from api.permissions import ReportApprovalPermission
from api.audit import log_activity


class TestExecutionViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN, QUALITY_MANAGER)
    serializer_class = TestExecutionSerializer
    filterset_fields = ['test_type', 'status', 'result_status', 'machine']
    search_fields = ['sample__code', 'test_type__name']

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            TestExecution.objects.select_related(
                'sample', 'test_type', 'machine', 'operator', 'lab_request',
            ),
            'sample__project',
        )

    @action(detail=True, methods=['post'], permission_classes=[ReportApprovalPermission])
    def approve(self, request, pk=None):
        test = self.get_object()
        if test.result_status == 'approved':
            return Response({'detail': 'نتیجه قبلاً تأیید شده است.'}, status=400)
        test = ReportService.approve_test(test, request.user)
        log_activity('approval', test, new={'result_status': 'approved'})
        return Response(TestExecutionSerializer(test, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[ReportApprovalPermission])
    def reject(self, request, pk=None):
        test = self.get_object()
        test.result_status = 'rejected'
        test.save(update_fields=['result_status'])
        log_activity('approval', test, new={'result_status': 'rejected'})
        return Response(TestExecutionSerializer(test, context={'request': request}).data)
