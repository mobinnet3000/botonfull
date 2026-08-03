from django.db import transaction
from api.models import Mold


class MoldService:

    @staticmethod
    @transaction.atomic
    def update_mold(mold: Mold, validated_data: dict) -> Mold:
        mold.mass = validated_data.get('mass', mold.mass)
        mold.breaking_load = validated_data.get('breaking_load', mold.breaking_load)
        mold.completed_at = validated_data.get('completed_at', mold.completed_at)
        if 'pre_break_image' in validated_data:
            mold.pre_break_image = validated_data['pre_break_image']
        if 'post_break_image' in validated_data:
            mold.post_break_image = validated_data['post_break_image']
        mold.save()
        return mold
