from rest_framework import serializers

from api.models import SampleType


class SampleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleType
        fields = ['id', 'code', 'name', 'description', 'is_active']
        read_only_fields = ['id']
