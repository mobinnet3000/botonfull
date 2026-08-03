from rest_framework import serializers

from api.models import Factory


class FactorySerializer(serializers.ModelSerializer):
    manager_username = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Factory
        fields = [
            'id', 'name', 'manager', 'manager_username',
            'phone_number', 'address', 'created_at',
        ]
        read_only_fields = ['id', 'manager', 'manager_username', 'created_at']
