from rest_framework import serializers

from api.models import Equipment, MaintenanceRecord


class EquipmentSerializer(serializers.ModelSerializer):
    is_usable = serializers.BooleanField(read_only=True)
    is_calibration_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'code', 'name', 'manufacturer', 'model', 'serial_number',
            'calibration_date', 'next_calibration_date', 'status', 'notes',
            'is_usable', 'is_calibration_expired', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    technician_username = serializers.CharField(source='technician.username', read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'equipment', 'maintenance_type', 'date',
            'technician', 'technician_username', 'next_due_date', 'notes',
        ]
        read_only_fields = ['id', 'technician_username']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('technician', request.user)
        return super().create(validated_data)
