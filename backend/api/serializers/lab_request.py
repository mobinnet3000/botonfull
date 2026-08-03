from rest_framework import serializers

from api.models import LabRequest
from api.access import can_write_lab_resource
from api.serializers.catalog import TestTypeSerializer


class LabRequestSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    requested_tests_detail = TestTypeSerializer(source='requested_tests', many=True, read_only=True)

    class Meta:
        model = LabRequest
        fields = [
            'id', 'request_number', 'project', 'project_name',
            'priority', 'priority_display', 'requested_tests', 'requested_tests_detail',
            'due_date', 'requested_by', 'requested_by_username',
            'approved_by', 'status', 'status_display', 'comments',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'request_number', 'project_name', 'requested_by',
            'requested_by_username', 'approved_by', 'created_at', 'updated_at',
        ]

    def validate_project(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, value):
            raise serializers.ValidationError('شما به این پروژه دسترسی نوشتن ندارید.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['requested_by'] = request.user
        return super().create(validated_data)
