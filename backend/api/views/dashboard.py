from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiTypes

from api.selectors.dashboard_selector import DashboardSelector
from api.services.qc_service import QcService
from api.access import scope_by_project, can_access_project, project_of
from api.models import Sample, AcceptanceCriteria


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        return Response(DashboardSelector.stats(request.user))


class QcAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        sample_id = request.query_params.get('sample')
        test_type_id = request.query_params.get('test_type')
        if not sample_id:
            raise ValidationError({'sample': 'شناسه نمونه الزامی است.'})

        sample = scope_by_project(
            request.user, Sample.objects.all(), 'project',
        ).filter(pk=sample_id).first()
        if sample is None:
            raise ValidationError({'sample': 'نمونه یافت نشد یا دسترسی ندارید.'})

        test_type = None
        if test_type_id:
            from api.models import TestType
            test_type = TestType.objects.filter(pk=test_type_id).first()

        values = QcService.values_of(sample, test_type)
        criteria = AcceptanceCriteria.objects.filter(
            test_type=test_type, is_active=True,
        ).first() if test_type else None

        return Response({
            'sample': sample.id,
            'sample_code': sample.code,
            'test_type': test_type.id if test_type else None,
            'values': values,
            'statistics': QcService.analyze(values),
            'criteria': {
                'id': criteria.id,
                'name': criteria.name,
            } if criteria else None,
            'compliance': QcService.check_criteria(values, criteria),
        })
