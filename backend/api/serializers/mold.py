from rest_framework import serializers
from api.models import Mold
from api.services.mold_service import MoldService


class MoldSerializer(serializers.ModelSerializer):
    is_done = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_due_today = serializers.BooleanField(read_only=True)
    is_due_tomorrow = serializers.BooleanField(read_only=True)
    
    # Related fields
    pour_series_id = serializers.IntegerField(source='pour_series.id', read_only=True)
    pour_series_name = serializers.CharField(source='pour_series.name', read_only=True)
    structural_member_id = serializers.IntegerField(source='pour_series.structural_member.id', read_only=True)
    structural_member_name = serializers.CharField(source='pour_series.structural_member.name', read_only=True)
    project_id = serializers.IntegerField(source='pour_series.structural_member.project.id', read_only=True)
    project_name = serializers.CharField(source='pour_series.structural_member.project.project_name', read_only=True)
    
    # Status and priority displays
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    technician_name = serializers.SerializerMethodField()

    class Meta:
        model = Mold
        fields = [
            'id', 'pour_series', 'age_in_days', 'mass', 'breaking_load',
            'created_at', 'completed_at', 'deadline', 'sample_identifier',
            'extra_data', 'pre_break_image', 'post_break_image',
            'status', 'priority', 'technician',
            'failure_type', 'test_notes',
            'is_done', 'is_overdue', 'is_due_today', 'is_due_tomorrow',
            'pour_series_id', 'pour_series_name',
            'structural_member_id', 'structural_member_name',
            'project_id', 'project_name',
            'status_display', 'priority_display', 'technician_name',
        ]
        read_only_fields = [
            'id', 'created_at', 'deadline',
            'is_done', 'is_overdue', 'is_due_today', 'is_due_tomorrow',
            'pour_series_id', 'pour_series_name',
            'structural_member_id', 'structural_member_name',
            'project_id', 'project_name',
            'status_display', 'priority_display', 'technician_name',
        ]

    def update(self, instance: Mold, validated_data: dict) -> Mold:
        return MoldService.update_mold(instance, validated_data)

    @staticmethod
    def get_technician_name(obj: Mold) -> str | None:
        if obj.technician:
            return f"{obj.technician.get_full_name() or obj.technician.username}"
        return None
