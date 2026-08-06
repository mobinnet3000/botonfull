from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from api.models import PourSeries, Mold, ProjectSettings
from utils.naming import generate_mold_identifier


class PourSeriesService:

    @staticmethod
    @transaction.atomic
    def create_pour_with_molds(validated_data: dict) -> PourSeries:
        mold_ages = validated_data.pop('mold_ages', [])
        mold_count = validated_data.pop('mold_count', None)

        structural_member = validated_data.get('structural_member')
        if structural_member is None:
            raise ValidationError('ریز بتن باید به یک عضو سازه‌ای تعلق داشته باشد.')

        if validated_data.get('pour_date') is None:
            validated_data['pour_date'] = timezone.now()

        project = structural_member.project
        project_settings = getattr(project, 'settings', None) or ProjectSettings.objects.filter(project=project).first()

        if not mold_ages:
            mold_ages = (project_settings.default_mold_ages if project_settings else []) or []
        if mold_count is None:
            mold_count = project_settings.default_mold_count if project_settings else 1

        pour = PourSeries.objects.create(**validated_data)

        if mold_ages:
            PourSeriesService._bulk_create_molds(pour, mold_ages, mold_count, project_settings)

        return pour

    @staticmethod
    def _bulk_create_molds(
        pour: PourSeries,
        ages: list[int],
        count_per_age: int,
        settings: ProjectSettings | None,
    ) -> list[Mold]:
        if count_per_age < 1:
            count_per_age = 1
        molds_to_create: list[Mold] = []
        age_list = sorted({a for a in ages if a > 0})

        for age in age_list:
            label = settings.get_age_label(age) if settings else f'{age} روزه'
            for i in range(count_per_age):
                molds_to_create.append(
                    Mold(
                        pour_series=pour,
                        age_in_days=age,
                        mass=0.0,
                        breaking_load=0.0,
                        deadline=pour.pour_date + timedelta(days=age),
                        sample_identifier=generate_mold_identifier(
                            pour.structural_member.name, age,
                            pour.name or str(pour.id),
                        ),
                        status='pending',
                        priority='medium',
                        test_notes='',
                    )
                )
        return Mold.objects.bulk_create(molds_to_create)