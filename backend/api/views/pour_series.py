from rest_framework import permissions, parsers

from api.models import PourSeries
from api.serializers import PourSeriesReadSerializer, PourSeriesWriteSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet
from api.filters import PourSeriesFilter


class PourSeriesViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = PourSeriesReadSerializer
    filterset_class = PourSeriesFilter
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    search_fields = ['name', 'truck_number', 'batch_number']
    ordering_fields = ['pour_date', 'name', 'created_at']

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                PourSeries.objects.select_related('structural_member', 'structural_member__project'),
                'structural_member__project',
            )
            .prefetch_related('molds')
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return PourSeriesReadSerializer
        return PourSeriesWriteSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]
