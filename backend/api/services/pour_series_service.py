from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from api.models import PourSeries, Mold, ProjectSettings
from api.services.mold_service import MoldService
from utils.naming import generate_mold_identifier


class PourSeriesService:

    @staticmethod
    def _get_default_mold_ages(project_id: int) -> list[int]:
        """Get default mold ages from project settings or use defaults."""
        try:
            settings = ProjectSettings.objects.get(project_id=project_id)
            return settings.get_default_mold_ages()
        except ProjectSettings.DoesNotExist:
            return [7, 14, 28]

    @staticmethod
    def _get_default_mold_count(project_id: int) -> int:
        """Get default mold count from project settings or use default."""
        try:
            settings = ProjectSettings.objects.get(project_id=project_id)
            return settings.default_mold_count or 1
        except ProjectSettings.DoesNotExist:
            return 1

    @staticmethod
    @transaction.atomic
    def create_pour_series(validated_data: dict) -> PourSeries:
        """Create a new pour series with automatic mold creation."""
        structural_member = validated_data.get('structural_member')
        
        # Create the pour series
        pour = PourSeries.objects.create(**validated_data)
        
        # Get mold ages from data or project settings
        mold_ages = validated_data.get('mold_ages')
        if not mold_ages:
            if structural_member and structural_member.project:
                mold_ages = PourSeriesService._get_default_mold_ages(structural_member.project.id)
            else:
                mold_ages = [7, 14, 28]
        
        # Get mold count from data or project settings
        mold_count = validated_data.get('mold_count', 1)
        if not mold_count:
            if structural_member and structural_member.project:
                mold_count = PourSeriesService._get_default_mold_count(structural_member.project.id)
            else:
                mold_count = 1
        
        # Create molds for each age
        now = timezone.now()
        for age in mold_ages:
            for i in range(mold_count):
                Mold.objects.create(
                    pour_series=pour,
                    age_in_days=age,
                    mass=0.0,
                    breaking_load=0.0,
                    deadline=now + timedelta(days=age),
                    sample_identifier=generate_mold_identifier(
                        structural_member.name if structural_member else 'Unknown',
                        age,
                        pour.name or str(pour.id),
                    ),
                    status='pending',
                    priority='medium',
                )
        
        return pour

    @staticmethod
    @transaction.atomic
    def update_pour_series(pour: PourSeries, validated_data: dict) -> PourSeries:
        """Update an existing pour series."""
        for field, value in validated_data.items():
            if field != 'molds':  # Don't update molds directly here
                setattr(pour, field, value)
        pour.save()
        return pour

    @staticmethod
    def get_pour_series_by_member(member_id: int) -> list[PourSeries]:
        """Get all pour series for a specific structural member."""
        return list(PourSeries.objects.filter(structural_member_id=member_id).select_related('structural_member'))

    @staticmethod
    @transaction.atomic
    def delete_pour_series(pour: PourSeries) -> None:
        """Delete a pour series and all its related molds."""
        # Delete all molds first
        pour.molds.all().delete()
        pour.delete()

    @staticmethod
    @transaction.atomic
    def add_molds_to_pour(pour: PourSeries, mold_ages: list[int], mold_count: int = 1) -> list[Mold]:
        """Add additional molds to an existing pour series."""
        now = timezone.now()
        molds = []
        for age in mold_ages:
            for i in range(mold_count):
                mold = Mold.objects.create(
                    pour_series=pour,
                    age_in_days=age,
                    mass=0.0,
                    breaking_load=0.0,
                    deadline=now + timedelta(days=age),
                    sample_identifier=generate_mold_identifier(
                        pour.structural_member.name if pour.structural_member else 'Unknown',
                        age,
                        f"{pour.name}-extra",
                    ),
                    status='pending',
                    priority='medium',
                )
                molds.append(mold)
        return molds
