from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from api.models import SamplingSeries, Mold
from utils.naming import generate_mold_identifier


class SamplingSeriesService:

    @staticmethod
    @transaction.atomic
    def create_series_with_molds(validated_data: dict) -> SamplingSeries:
        mold_ages = validated_data.pop('mold_ages', [])
        series = SamplingSeries.objects.create(**validated_data)

        if mold_ages:
            SamplingSeriesService._bulk_create_molds(series, mold_ages)

        return series

    @staticmethod
    def _bulk_create_molds(series: SamplingSeries, mold_ages: list[int]) -> list[Mold]:
        now = timezone.now()
        molds_to_create: list[Mold] = []
        for age in mold_ages:
            molds_to_create.append(
                Mold(
                    series=series,
                    age_in_days=age,
                    mass=0.0,
                    breaking_load=0.0,
                    deadline=now + timedelta(days=age),
                    sample_identifier=generate_mold_identifier(
                        series.sample.category, age,
                        series.name or str(series.id),
                    ),
                )
            )
        return Mold.objects.bulk_create(molds_to_create)
