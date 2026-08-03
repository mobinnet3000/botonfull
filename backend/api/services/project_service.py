from django.db import transaction

from api.models import Project
from api.services.sample_service import SampleService


class ProjectService:

    @staticmethod
    @transaction.atomic
    def create_project(validated_data: dict, owner, created_by=None) -> Project:
        project = Project.objects.create(owner=owner, created_by=created_by, **validated_data)
        SampleService.create_project_samples(project)
        return project
