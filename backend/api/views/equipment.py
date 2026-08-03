from rest_framework import viewsets

from api.models import Equipment, MaintenanceRecord
from api.serializers import EquipmentSerializer, MaintenanceRecordSerializer
from api.access import scope_lab_catalog
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class EquipmentViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    serializer_class = EquipmentSerializer
    filterset_fields = ['status']
    search_fields = ['name', 'code', 'manufacturer', 'model', 'serial_number']
    ordering_fields = ['name', 'next_calibration_date']

    def get_queryset(self):
        return scope_lab_catalog(self.request.user, Equipment.objects.all())


class MaintenanceRecordViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = MaintenanceRecordSerializer
    filterset_fields = ['equipment', 'maintenance_type']
    search_fields = ['equipment__name', 'notes']

    def get_queryset(self):
        return scope_lab_catalog(
            self.request.user, MaintenanceRecord.objects.select_related('equipment', 'technician'),
        )
