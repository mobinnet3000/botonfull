from rest_framework import serializers

from api.models import Report, ReportRevision
from api.access import can_write_lab_resource
from api.services.report_service import ReportService


class ReportRevisionSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = ReportRevision
        fields = ['id', 'report', 'version', 'content', 'changed_by', 'changed_by_username', 'notes', 'created_at']
        read_only_fields = ['id', 'version', 'changed_by', 'created_at']


class ReportSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    sample_code = serializers.CharField(source='sample.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)
    revisions = ReportRevisionSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'report_number', 'project', 'project_name',
            'sample', 'sample_code', 'title', 'description',
            'status', 'status_display', 'version', 'content',
            'qr_verify_token', 'digital_signature',
            'created_by', 'created_by_username',
            'reviewed_by', 'approved_by', 'approved_by_username',
            'reviewed_at', 'approved_at', 'created_at', 'updated_at',
            'revisions',
        ]
        read_only_fields = [
            'id', 'report_number', 'project_name', 'sample_code',
            'status', 'version', 'qr_verify_token', 'created_by', 'created_by_username',
            'reviewed_by', 'approved_by', 'approved_by_username',
            'reviewed_at', 'approved_at', 'created_at', 'updated_at', 'revisions',
        ]

    def validate_project(self, value):
        user = self.context['request'].user
        if not can_write_lab_resource(user, value):
            raise serializers.ValidationError('شما به این پروژه دسترسی نوشتن ندارید.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else instance.created_by
        return ReportService.update_report(instance, validated_data, user)
