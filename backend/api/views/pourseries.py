from rest_framework import viewsets, permissions, parsers
from api.models import PourSeries
from api.serializers import PourSeriesReadSerializer, PourSeriesWriteSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class PourSeriesViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    search_fields = ['name', 'truck_number', 'batch_number']

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                PourSeries.objects.select_related(
                    'structural_member', 'structural_member__project', 'sample'
                ).prefetch_related('molds'),
                'structural_member__project',
            )
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return PourSeriesReadSerializer
        return PourSeriesWriteSerializer