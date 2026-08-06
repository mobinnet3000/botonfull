from rest_framework import serializers

from api.models import ProjectSettings
from api.services.project_service import ProjectService


class ProjectSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSettings
        fields = [
            'id', 'project',
            'default_mold_ages', 'default_mold_count',
            'pour_name_prefix', 'member_name_prefix',
            'use_auto_numbering', 'next_pour_number', 'next_member_number',
            'custom_age_labels', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        return ProjectService.update_settings(instance.project, validated_data)