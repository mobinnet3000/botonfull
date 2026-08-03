from rest_framework import serializers
from api.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'project', 'type', 'description', 'amount', 'date']
