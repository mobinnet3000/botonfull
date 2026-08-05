from django.db import transaction

from api.models import Project
from api.services.sample_service import SampleService
from api.services.project_settings_service import ProjectSettingsService
from api.services.structural_member_service import StructuralMemberService


class ProjectService:

    @staticmethod
    @transaction.atomic
    def create_project(validated_data: dict, owner, created_by=None) -> Project:
        """Create a new project with default settings and structural members."""
        project = Project.objects.create(owner=owner, created_by=created_by, **validated_data)
        
        # Create default project settings
        ProjectSettingsService.get_or_create_default_settings(project)
        
        # Create default structural members based on floor count
        floor_count = validated_data.get('floor_count', 0)
        if floor_count > 0:
            from utils.naming import generate_sample_names
            member_names = generate_sample_names(floor_count)
            for name in member_names:
                StructuralMemberService.create_structural_member({
                    'project': project,
                    'name': name,
                    'member_type': 'other',
                })
        
        # Create project samples for backward compatibility
        SampleService.create_project_samples(project)
        
        return project

    @staticmethod
    @transaction.atomic
    def update_project(project: Project, validated_data: dict) -> Project:
        """Update an existing project."""
        for field, value in validated_data.items():
            setattr(project, field, value)
        project.save()
        return project

    @staticmethod
    def get_project_with_related(project_id: int):
        """Get a project with all related data."""
        return Project.objects.filter(id=project_id).select_related(
            'owner', 'client', 'factory', 'settings'
        ).prefetch_related(
            'structural_members',
            'structural_members__pour_series',
            'structural_members__pour_series__molds',
            'samples',
            'samples__series',
            'samples__series__molds',
            'transactions',
        ).first()
