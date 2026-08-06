from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from api.models import PourSeries, Mold, ProjectSettings
from utils.naming import generate_mold_identifier


class PourSeriesService:

    @staticmethod
    @transaction.atomic
    def create_pour_with_molds(validated_data: dict) -> PourSeries:
        mold_ages = validated_data.pop('mold_ages', [])
        mold_count = validated_data.pop('mold_count', 1)
        structural_member = validated_data['structural_member']
        project = structural_member.project
        project_settings = getattr(project, 'settings', None)

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
        now = timezone.now()
        molds_to_create: list[Mold] = []
        age_list = list(set(a for a in ages if a > 0))

        for age in age_list:
            label = settings.get_age_label(age) if settings else f'{age} روزه'
            for i in range(count_per_age):
                molds_to_create.append(
                    Mold(
                        pour_series=pour,
                        age_in_days=age,
                        mass=0.0,
                        breaking_load=0.0,
                        deadline=now + timedelta(days=age),
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