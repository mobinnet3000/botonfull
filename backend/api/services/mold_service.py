from django.db import transaction
from django.utils import timezone

from api.models import Mold


class MoldService:

    @staticmethod
    @transaction.atomic
    def update_mold(mold: Mold, validated_data: dict) -> Mold:
        """Update mold with test results and other data."""
        fields_to_update = [
            'mass', 'breaking_load', 'completed_at',
            'status', 'priority', 'technician',
            'failure_type', 'test_notes',
            'pre_break_image', 'post_break_image',
        ]
        
        for field in fields_to_update:
            if field in validated_data:
                setattr(mold, field, validated_data[field])
        
        # If breaking_load is set and was previously not set, update status and completed_at
        if 'breaking_load' in validated_data:
            if validated_data['breaking_load'] and validated_data['breaking_load'] > 0:
                mold.completed_at = timezone.now()
                if mold.status != 'completed':
                    mold.status = 'completed'
        
        mold.save()
        return mold

    @staticmethod
    @transaction.atomic
    def bulk_update_molds(molds: list[Mold], validated_data: dict) -> list[Mold]:
        """Bulk update multiple molds."""
        updated_molds = []
        for mold in molds:
            updated_mold = MoldService.update_mold(mold, validated_data)
            updated_molds.append(updated_mold)
        return updated_molds

    @staticmethod
    def get_molds_by_pour(pour_id: int) -> list[Mold]:
        """Get all molds for a specific pour series."""
        return list(Mold.objects.filter(pour_series_id=pour_id).select_related('pour_series'))

    @staticmethod
    def get_molds_by_status(status: str) -> list[Mold]:
        """Get all molds with a specific status."""
        return list(Mold.objects.filter(status=status))

    @staticmethod
    def get_overdue_molds() -> list[Mold]:
        """Get all overdue molds."""
        now = timezone.now()
        return list(Mold.objects.filter(deadline__lt=now, status__in=['pending', 'in_progress']))

    @staticmethod
    def get_molds_due_today() -> list[Mold]:
        """Get all molds due today."""
        now = timezone.now()
        return list(Mold.objects.filter(
            deadline__date=now.date(),
            status__in=['pending', 'in_progress']
        ))

    @staticmethod
    def get_molds_due_tomorrow() -> list[Mold]:
        """Get all molds due tomorrow."""
        tomorrow = timezone.now() + timezone.timedelta(days=1)
        return list(Mold.objects.filter(
            deadline__date=tomorrow.date(),
            status__in=['pending', 'in_progress']
        ))
