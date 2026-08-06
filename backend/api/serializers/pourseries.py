from rest_framework import serializers
from api.models import PourSeries, Mold


class MoldMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mold
        fields = [
            'id', 'age_in_days', 'sample_identifier', 'status', 'priority',
            'breaking_load', 'deadline', 'completed_at', 'is_done',
        ]


class PourSeriesWriteSerializer(serializers.ModelSerializer):
    mold_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
        help_text='لیست سن قالب‌ها؛ در صورت نبود از تنظیمات پیش‌فرض پروژه استفاده می‌شود.',
    )
    mold_count = serializers.IntegerField(
        write_only=True, required=False,
        help_text='تعداد قالب برای هر سن؛ پیش‌فرض از تنظیمات پروژه.',
    )
    pour_date = serializers.DateTimeField(required=False)

    class Meta:
        model = PourSeries
        fields = [
            'id', 'structural_member', 'sample', 'name', 'pour_date',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image', 'axis', 'has_additive',
            'truck_number', 'batch_number', 'notes',
            'mold_ages', 'mold_count',
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'structural_member': {
                'error_messages': {'required': 'انتخاب عضو سازه‌ای برای ریز بتن الزامی است.'},
            },
        }

    def validate_structural_member(self, value):
        from api.access import can_write_lab_resource
        user = self.context['request'].user
        if not can_write_lab_resource(user, value.project):
            raise serializers.ValidationError('شما به این پروژه دسترسی نوشتن ندارید.')
        return value

    def create(self, validated_data):
        from api.services.pourseries_service import PourSeriesService
        return PourSeriesService.create_pour_with_molds(validated_data)


class PourSeriesReadSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='structural_member.project.project_name', read_only=True)
    member_name = serializers.CharField(source='structural_member.name', read_only=True)
    member_type = serializers.CharField(source='structural_member.member_type', read_only=True)
    molds = MoldMiniSerializer(many=True, read_only=True)

    class Meta:
        model = PourSeries
        fields = [
            'id', 'structural_member', 'sample', 'name', 'pour_date',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image', 'axis', 'has_additive',
            'truck_number', 'batch_number', 'notes',
            'project_name', 'member_name', 'member_type',
            'molds', 'created_at', 'updated_at',
        ]