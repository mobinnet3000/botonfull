from rest_framework import serializers
from api.models import SamplingSeries, SamplingSeriesPhoto
from api.access import can_write_lab_resource, project_of
from api.services.sampling_series_service import SamplingSeriesService


class SamplingSeriesPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SamplingSeriesPhoto
        fields = ['id', 'series', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class SamplingSeriesWriteSerializer(serializers.ModelSerializer):
    mold_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
        help_text='پذیرفته برای سازگاری عقب‌مانده؛ قالب‌ها از مسیر ریز بتن ساخته می‌شوند.',
    )

    class Meta:
        model = SamplingSeries
        fields = [
            'id', 'sample', 'name',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image',
            'axis', 'has_additive',
            'mold_ages',
        ]

    def validate_sample(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, project_of(value)):
            raise serializers.ValidationError('شما به این نمونه دسترسی نوشتن ندارید.')
        return value

    def create(self, validated_data: dict) -> SamplingSeries:
        return SamplingSeriesService.create_series_with_molds(validated_data)


class SamplingSeriesReadSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    photos = SamplingSeriesPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = SamplingSeries
        fields = [
            'id', 'sample', 'name',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image',
            'axis', 'has_additive',
            'photos',
        ]

    @staticmethod
    def get_name(obj: SamplingSeries) -> str:
        if obj.name:
            return obj.name
        if not obj.sample:
            return 'سری نمونه نامشخص'
        all_series = obj.sample.series.order_by('id').all()
        try:
            series_list = list(all_series)
            index = series_list.index(obj)
            return f'{obj.sample.category}-{index + 1}'
        except ValueError:
            return f'{obj.sample.category}-?'
