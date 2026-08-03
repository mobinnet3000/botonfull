from rest_framework import serializers

from api.models import SampleType, TestType, AcceptanceCriteria


class SampleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleType
        fields = ['id', 'code', 'name', 'description', 'is_active']
        read_only_fields = ['id']


class TestTypeSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = TestType
        fields = [
            'id', 'code', 'name', 'category', 'category_display',
            'unit', 'method_reference', 'params_schema', 'is_active',
        ]
        read_only_fields = ['id']


class AcceptanceCriteriaSerializer(serializers.ModelSerializer):
    test_type_name = serializers.CharField(source='test_type.name', read_only=True)

    class Meta:
        model = AcceptanceCriteria
        fields = ['id', 'name', 'test_type', 'test_type_name', 'standard_name', 'params', 'is_active']
        read_only_fields = ['id']
