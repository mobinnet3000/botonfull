from rest_framework import serializers

from api.models import CuringTank, CuringRecord
from api.access import can_write_lab_resource, project_of


class CuringTankSerializer(serializers.ModelSerializer):
    current_sample_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = CuringTank
        fields = [
            'id', 'code', 'name', 'capacity', 'water_temperature',
            'location', 'notes', 'is_active', 'current_sample_count',
        ]
        read_only_fields = ['id', 'current_sample_count']


class CuringRecordSerializer(serializers.ModelSerializer):
    sample_code = serializers.CharField(source='sample.code', read_only=True)
    tank_name = serializers.CharField(source='tank.name', read_only=True)

    class Meta:
        model = CuringRecord
        fields = [
            'id', 'tank', 'tank_name', 'sample', 'sample_code',
            'entry_date', 'exit_date', 'operator', 'notes',
        ]
        read_only_fields = ['id', 'operator']

    def validate_sample(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, project_of(value)):
            raise serializers.ValidationError('دسترسی به این نمونه ندارید.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('operator', request.user)
        return super().create(validated_data)
