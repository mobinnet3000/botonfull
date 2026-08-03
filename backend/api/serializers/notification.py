from rest_framework import serializers

from api.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    ntype_display = serializers.CharField(source='get_ntype_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'ntype', 'ntype_display', 'title',
            'message', 'link', 'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']
