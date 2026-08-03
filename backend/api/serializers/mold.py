from rest_framework import serializers
from api.models import Mold
from api.services.mold_service import MoldService


class MoldSerializer(serializers.ModelSerializer):
    is_done = serializers.BooleanField(read_only=True)

    class Meta:
        model = Mold
        fields = [
            'id', 'series', 'age_in_days', 'mass', 'breaking_load',
            'created_at', 'completed_at', 'deadline', 'sample_identifier',
            'extra_data', 'pre_break_image', 'post_break_image', 'is_done',
        ]
        read_only_fields = [
            'id', 'created_at', 'deadline', 'series', 'age_in_days', 'is_done',
        ]

    def update(self, instance: Mold, validated_data: dict) -> Mold:
        return MoldService.update_mold(instance, validated_data)
