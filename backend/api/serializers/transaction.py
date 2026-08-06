from rest_framework import serializers
from api.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'project', 'type', 'type_display',
            'description', 'amount', 'date',
            'category', 'category_display', 'method', 'method_display',
            'is_settled', 'notes',
        ]
        read_only_fields = ['id']