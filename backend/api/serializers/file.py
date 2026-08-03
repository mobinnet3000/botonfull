from rest_framework import serializers

from api.models import AppFile, ActivityLog
from api.audit import log_activity


class AppFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = AppFile
        fields = [
            'id', 'content_type', 'object_id', 'file', 'url',
            'file_type', 'original_name', 'uploaded_by', 'created_at',
        ]
        read_only_fields = ['id', 'url', 'file_type', 'uploaded_by', 'created_at']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    @staticmethod
    def get_file_type(obj):
        return obj.file.name.split('.')[-1].lower()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['uploaded_by'] = request.user
        instance = super().create(validated_data)
        log_activity('file_upload', instance)
        return instance


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'username', 'action', 'content_type',
            'object_id', 'object_repr', 'old_value', 'new_value', 'ip', 'created_at',
        ]
