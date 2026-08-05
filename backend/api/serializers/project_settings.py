from rest_framework import serializers

from api.models import ProjectSettings
from api.services.project_settings_service import ProjectSettingsService


class ProjectSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSettings
        fields = [
            'id', 'project', 'default_mold_ages', 'default_mold_count',
            'pour_name_prefix', 'member_name_prefix',
            'use_auto_numbering', 'next_pour_number', 'next_member_number',
            'custom_age_labels',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        project = validated_data.pop('project')
        return ProjectSettingsService.create_or_update_settings(project, validated_data)

    def update(self, instance: ProjectSettings, validated_data: dict) -> ProjectSettings:
        return ProjectSettingsService.update_settings(instance, validated_data)
