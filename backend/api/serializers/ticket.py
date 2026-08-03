from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Ticket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'user', 'username', 'message', 'created_at']
        read_only_fields = ('user', 'created_at', 'username')


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'user', 'username', 'status', 'status_display',
            'priority', 'priority_display', 'created_at', 'updated_at', 'messages',
        ]
        read_only_fields = ('user', 'created_at', 'updated_at', 'username',
                            'status_display', 'priority_display')
