from rest_framework import viewsets

from api.models import CuringTank, CuringRecord
from api.serializers import CuringTankSerializer, CuringRecordSerializer
from api.access import scope_lab_catalog, scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class CuringTankViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = CuringTankSerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']

    def get_queryset(self):
        return scope_lab_catalog(self.request.user, CuringTank.objects.all())


class CuringRecordViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = CuringRecordSerializer
    filterset_fields = ['tank', 'sample']
    search_fields = ['sample__code', 'tank__name']

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            CuringRecord.objects.select_related('tank', 'sample', 'operator'),
            'sample__project',
        )
