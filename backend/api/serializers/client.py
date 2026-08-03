from rest_framework import serializers

from api.models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id', 'client_type', 'name', 'contact_person', 'phone_number',
            'email', 'address', 'tax_id', 'notes', 'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user if request and request.user.is_authenticated else None
        return super().create(validated_data)
