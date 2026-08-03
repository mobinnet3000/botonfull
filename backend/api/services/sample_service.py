import math

from django.db import transaction
from django.utils import timezone

from api.models import Sample, SamplingSeries
from api.constants import (
    DEFAULT_SAMPLING_VOLUME, DEFAULT_CEMENT_GRADE, DEFAULT_CEMENT_TYPE,
    DEFAULT_AMBIENT_TEMPERATURE, DEFAULT_WEATHER, DEFAULT_CONCRETE_FACTORY,
    DEFAULT_SPECIMEN_TYPE, DEFAULT_SPECIMEN_SIZE, DEFAULT_SAMPLING_LOCATION,
    DEFAULT_PRODUCTION_METHOD, DEFAULT_CONCRETE_TEMPERATURE, DEFAULT_SLUMP,
    SERIES_VOLUME_DIVISOR,
)
from utils.naming import generate_sample_names, generate_series_name


class SampleService:

    @staticmethod
    def calculate_series_count(sampling_volume: float) -> int:
        if sampling_volume <= 0:
            return 0
        return math.ceil(sampling_volume / SERIES_VOLUME_DIVISOR)

    @staticmethod
    def _create_series_for_sample(sample: Sample) -> list[SamplingSeries]:
        series_count = SampleService.calculate_series_count(sample.sampling_volume)
        series_list: list[SamplingSeries] = []
        for i in range(series_count):
            series = SamplingSeries.objects.create(
                sample=sample,
                name=generate_series_name(sample.category, i),
                concrete_temperature=DEFAULT_CONCRETE_TEMPERATURE,
                slump=DEFAULT_SLUMP,
                axis='',
                has_additive=False,
            )
            series_list.append(series)
        return series_list

    @staticmethod
    @transaction.atomic
    def create_sample_with_series(validated_data: dict, actor=None) -> Sample:
        if actor is not None:
            validated_data.setdefault('created_by', actor)
            validated_data.setdefault('technician', actor)
        sample = Sample.objects.create(**validated_data)
        SampleService._create_series_for_sample(sample)
        return sample

    @staticmethod
    @transaction.atomic
    def create_project_samples(project) -> list[Sample]:
        sample_names = generate_sample_names(project.floor_count)
        created_samples: list[Sample] = []
        for name in sample_names:
            sample = Sample.objects.create(
                project=project,
                date=timezone.now(),
                sampling_volume=DEFAULT_SAMPLING_VOLUME,
                cement_grade=DEFAULT_CEMENT_GRADE,
                cement_type=DEFAULT_CEMENT_TYPE,
                category=name,
                weather_condition=DEFAULT_WEATHER,
                ambient_temperature=DEFAULT_AMBIENT_TEMPERATURE,
                concrete_factory=DEFAULT_CONCRETE_FACTORY,
                specimen_type=DEFAULT_SPECIMEN_TYPE,
                specimen_size=DEFAULT_SPECIMEN_SIZE,
                sampling_location=DEFAULT_SAMPLING_LOCATION,
                concrete_production_method=DEFAULT_PRODUCTION_METHOD,
            )
            SampleService._create_series_for_sample(sample)
            created_samples.append(sample)
        return created_samples
