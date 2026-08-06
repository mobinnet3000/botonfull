from django.db import transaction
from django.utils import timezone

from api.models import Project, StructuralMember, ProjectSettings
from api.services.sample_service import SampleService

DEFAULT_MOLD_AGES = [7, 14, 28]


class ProjectService:

    @staticmethod
    @transaction.atomic
    def create_project(validated_data: dict, owner, created_by=None) -> Project:
        project = Project.objects.create(owner=owner, created_by=created_by, **validated_data)

        StructuralMember.objects.create(
            project=project,
            name='General',
            member_type='other',
            description='عضو سازه‌ای پیش‌فرض پروژه',
        )

        ProjectSettings.objects.get_or_create(
            project=project,
            defaults={
                'default_mold_ages': DEFAULT_MOLD_AGES,
                'default_mold_count': 1,
                'pour_name_prefix': 'Truck',
                'member_name_prefix': 'Member',
            },
        )

        SampleService.create_project_samples(project)

        return project

    @staticmethod
    @transaction.atomic
    def update_settings(project: Project, validated_data: dict) -> ProjectSettings:
        settings, _ = ProjectSettings.objects.get_or_create(project=project)
        for field, value in validated_data.items():
            setattr(settings, field, value)
        settings.save()
        return settings