from rest_framework import serializers
from api.models import LabProfile


class LabProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = LabProfile
        fields = [
            'id', 'lab_name', 'lab_phone_number', 'lab_mobile_number',
            'lab_address', 'province', 'city', 'telegram_id',
            'first_name', 'last_name', 'email', 'user',
        ]
        read_only_fields = ('user',)

    def update(self, instance: LabProfile, validated_data: dict) -> LabProfile:
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            user.save()
        return super().update(instance, validated_data)
