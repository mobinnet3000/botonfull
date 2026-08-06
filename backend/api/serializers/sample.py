from rest_framework import serializers
from django.core.exceptions import ValidationError

from api.models import Sample, SamplingSeries
from api.validators import validate_specimen_type
from api.access import can_write_lab_resource, project_of
from api.services.sample_service import SampleService
from api.serializers.sampling_series import SamplingSeriesReadSerializer
from api.serializers.pourseries import PourSeriesReadSerializer
from api.constants import (
    DEFAULT_CONCRETE_TEMPERATURE, DEFAULT_SLUMP,
    SERIES_VOLUME_DIVISOR,
)
from utils.naming import generate_series_name


class SampleWriteSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Sample
        fields = [
            'id', 'project', 'code', 'barcode', 'qr_token', 'date',
            'casting_date', 'sampling_date', 'receiving_date',
            'status', 'status_display', 'current_location',
            'sampling_volume', 'cement_grade', 'cement_type',
            'category', 'weather_condition', 'ambient_temperature',
            'concrete_factory', 'specimen_type', 'specimen_size',
            'sampling_location', 'concrete_production_method',
            'sample_type', 'weight', 'dimensions', 'description',
            'technician', 'responsible_engineer', 'received_by',
        ]
        read_only_fields = ['id', 'code', 'barcode', 'qr_token', 'status_display']

    def validate_project(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, value):
            raise serializers.ValidationError('شما به این پروژه دسترسی نوشتن ندارید.')
        return value

    def validate(self, attrs: dict) -> dict:
        specimen_type = attrs.get('specimen_type')
        specimen_size = attrs.get('specimen_size')
        if specimen_type and specimen_size:
            try:
                validate_specimen_type(specimen_type, specimen_size)
            except ValidationError as e:
                raise serializers.ValidationError(str(e))
        return attrs

    def create(self, validated_data: dict) -> Sample:
        request = self.context.get('request')
        actor = request.user if request and request.user.is_authenticated else None
        return SampleService.create_sample_with_series(validated_data, actor=actor)


class SampleReadSerializer(SampleWriteSerializer):
    age_in_days = serializers.IntegerField(read_only=True)
    series = SamplingSeriesReadSerializer(many=True, read_only=True)
    sample_type_name = serializers.CharField(source='sample_type.name', read_only=True, default=None)
    project_name = serializers.CharField(source='project.project_name', read_only=True, default=None)
    pour_series = PourSeriesReadSerializer(many=True, read_only=True)

    class Meta(SampleWriteSerializer.Meta):
        fields = SampleWriteSerializer.Meta.fields + [
            'age_in_days', 'sample_type_name', 'project_name', 'pour_series', 'series',
        ]
