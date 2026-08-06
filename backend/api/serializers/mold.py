from rest_framework import serializers
from api.models import Mold
from api.serializers.pourseries import PourSeriesReadSerializer


class MoldReadSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source='pour_series.structural_member.project.project_name', read_only=True,
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

    class Meta:
        model = Mold
        fields = [
            'id', 'pour_series', 'age_in_days', 'sample_identifier',
            'mass', 'breaking_load', 'failure_type', 'test_notes',
            'extra_data', 'status', 'status_display', 'priority',
            'priority_display', 'technician', 'technician_username',
            'created_at', 'completed_at', 'deadline',
            'pre_break_image', 'post_break_image',
            'project_name', 'member_name', 'member_type', 'pour_name',
            'pour_date', 'is_done',
        ]
        read_only_fields = [
            'id', 'created_at', 'is_done',
        ]


class MoldSerializer(MoldReadSerializer):
    class Meta(MoldReadSerializer.Meta):
        read_only_fields = [
            'id', 'created_at', 'pour_series', 'age_in_days',
            'sample_identifier', 'is_done',
        ]