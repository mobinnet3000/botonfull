from rest_framework import serializers

from api.models import PourSeries
from api.services.pour_series_service import PourSeriesService
from api.serializers.mold import MoldSerializer


class PourSeriesWriteSerializer(serializers.ModelSerializer):
    mold_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
        help_text='List of mold ages to create (e.g., [7, 14, 28])',
    )
    mold_count = serializers.IntegerField(
        min_value=1,
        write_only=True,
        required=False,
        default=1,
        help_text='Number of molds to create for each age',
    )

    class Meta:
        model = PourSeries
        fields = [
            'id', 'structural_member', 'name', 'pour_date',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image',
            'axis', 'has_additive', 'truck_number', 'batch_number',
            'sample', 'notes',
            'mold_ages', 'mold_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_structural_member(self, value):
        user = self.context['request'].user
        from api.access import can_write_lab_resource
        if not can_write_lab_resource(user, value.project):
            raise serializers.ValidationError('You do not have permission to create pours for this project.')
        return value

    def create(self, validated_data):
        return PourSeriesService.create_pour_series(validated_data)


class PourSeriesReadSerializer(PourSeriesWriteSerializer):
    structural_member_name = serializers.CharField(source='structural_member.name', read_only=True)
    structural_member_type = serializers.CharField(source='structural_member.get_member_type_display', read_only=True)
    project_id = serializers.IntegerField(source='structural_member.project.id', read_only=True)
    project_name = serializers.CharField(source='structural_member.project.project_name', read_only=True)
    molds = MoldSerializer(many=True, read_only=True)
    
    # Summary fields
    total_molds = serializers.SerializerMethodField()
    completed_molds = serializers.SerializerMethodField()
    overdue_molds = serializers.SerializerMethodField()
    due_today_molds = serializers.SerializerMethodField()
    next_due_date = serializers.SerializerMethodField()

    class Meta(PourSeriesWriteSerializer.Meta):
        fields = PourSeriesWriteSerializer.Meta.fields + [
            'structural_member_name', 'structural_member_type',
            'project_id', 'project_name',
            'molds',
            'total_molds', 'completed_molds', 'overdue_molds', 'due_today_molds', 'next_due_date',
        ]

    @staticmethod
    def get_total_molds(obj: PourSeries) -> int:
        return obj.molds.count()

    @staticmethod
    def get_completed_molds(obj: PourSeries) -> int:
        return obj.molds.filter(is_done=True).count()

    @staticmethod
    def get_overdue_molds(obj: PourSeries) -> int:
        from django.utils import timezone
        return obj.molds.filter(deadline__lt=timezone.now(), is_done=False).count()

    @staticmethod
    def get_due_today_molds(obj: PourSeries) -> int:
        from django.utils import timezone
        return obj.molds.filter(deadline__date=timezone.now().date(), is_done=False).count()

    @staticmethod
    def get_next_due_date(obj: PourSeries) -> str | None:
        from django.utils import timezone
        next_mold = obj.molds.filter(is_done=False).order_by('deadline').first()
        if next_mold:
            return next_mold.deadline.isoformat()
        return None
