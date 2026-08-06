from rest_framework import serializers
from django.utils import timezone
from api.models import Mold


class MoldReadSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source='pour_series.structural_member.project.project_name', read_only=True,
    )
    project_id = serializers.IntegerField(
        source='pour_series.structural_member.project_id', read_only=True, default=None,
    )
    member_id = serializers.IntegerField(
        source='pour_series.structural_member_id', read_only=True, default=None,
    )
    member_name = serializers.CharField(
        source='pour_series.structural_member.name', read_only=True,
    )
    member_type = serializers.CharField(
        source='pour_series.structural_member.member_type', read_only=True,
    )
    pour_name = serializers.CharField(source='pour_series.name', read_only=True)
    pour_date = serializers.CharField(source='pour_series.pour_date', read_only=True)
    technician_username = serializers.CharField(source='technician.username', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    remaining_days = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Mold
        fields = [
            'id', 'pour_series', 'age_in_days', 'sample_identifier',
            'mass', 'breaking_load', 'failure_type', 'test_notes',
            'extra_data', 'status', 'status_display', 'priority',
            'priority_display', 'technician', 'technician_username',
            'created_at', 'completed_at', 'deadline',
            'pre_break_image', 'post_break_image',
            'project_name', 'project_id', 'member_id', 'member_name', 'member_type',
            'pour_name', 'pour_date', 'is_done', 'remaining_days', 'is_overdue',
        ]
        read_only_fields = [
            'id', 'created_at', 'is_done', 'remaining_days', 'is_overdue',
        ]

    def get_remaining_days(self, obj):
        if obj.is_done or not obj.deadline:
            return 0
        return (obj.deadline.date() - timezone.now().date()).days

    def get_is_overdue(self, obj):
        return not obj.is_done and bool(obj.deadline) and obj.deadline.date() < timezone.now().date()


class MoldSerializer(MoldReadSerializer):
    class Meta(MoldReadSerializer.Meta):
        read_only_fields = [
            'id', 'created_at', 'pour_series', 'age_in_days',
            'sample_identifier', 'is_done',
        ]