from django.db import transaction

from api.models import ProjectSettings, Project


class ProjectSettingsService:

    @staticmethod
    @transaction.atomic
    def create_or_update_settings(project: Project, validated_data: dict) -> ProjectSettings:
        """Create or update project settings."""
        settings, created = ProjectSettings.objects.get_or_create(project=project)
        
        for field, value in validated_data.items():
            setattr(settings, field, value)
        
        settings.save()
        return settings

    @staticmethod
    def get_settings(project_id: int) -> ProjectSettings | None:
        """Get project settings by project ID."""
        try:
            return ProjectSettings.objects.get(project_id=project_id)
        except ProjectSettings.DoesNotExist:
            return None

    @staticmethod
    def get_or_create_default_settings(project: Project) -> ProjectSettings:
        """Get existing settings or create with defaults."""
        settings, created = ProjectSettings.objects.get_or_create(
            project=project,
            defaults={
                'default_mold_ages': [7, 14, 28],
                'default_mold_count': 1,
                'pour_name_prefix': 'Truck',
                'member_name_prefix': 'Member',
                'use_auto_numbering': True,
                'next_pour_number': 1,
                'next_member_number': 1,
                'custom_age_labels': {},
            }
        )
        return settings

    @staticmethod
    @transaction.atomic
    def update_settings(settings: ProjectSettings, validated_data: dict) -> ProjectSettings:
        """Update existing project settings."""
        for field, value in validated_data.items():
            setattr(settings, field, value)
        
        settings.save()
        return settings

    @staticmethod
    @transaction.atomic
    def delete_settings(settings: ProjectSettings) -> None:
        """Delete project settings."""
        settings.delete()
