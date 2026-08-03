from rest_framework import serializers

from api.models import TestExecution
from api.access import can_write_lab_resource, project_of
from api.services.equipment_service import EquipmentService


class TestExecutionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    result_status_display = serializers.CharField(source='get_result_status_display', read_only=True)
    sample_code = serializers.CharField(source='sample.code', read_only=True)
    test_type_name = serializers.CharField(source='test_type.name', read_only=True)
    machine_name = serializers.CharField(source='machine.name', read_only=True)
    operator_username = serializers.CharField(source='operator.username', read_only=True)

    class Meta:
        model = TestExecution
        fields = [
            'id', 'sample', 'sample_code', 'test_type', 'test_type_name',
            'lab_request', 'operator', 'operator_username', 'machine', 'machine_name',
            'start_time', 'finish_time', 'temperature', 'humidity',
            'measured_values', 'calculated_values', 'result',
            'result_status', 'result_status_display', 'status', 'status_display',
            'notes', 'approved_by', 'approved_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'sample_code', 'test_type_name', 'machine_name',
            'operator_username', 'result_status', 'approved_by', 'approved_at',
            'created_at', 'updated_at',
        ]

    def validate_sample(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, project_of(value)):
            raise serializers.ValidationError('دسترسی به این نمونه ندارید.')
        return value

    def validate_machine(self, value):
        if value is not None:
            EquipmentService.validate_usable(value)
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('operator', request.user)
        return super().create(validated_data)
