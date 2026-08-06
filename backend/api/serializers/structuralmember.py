from rest_framework import serializers
from api.models import StructuralMember
from api.serializers.pourseries import PourSeriesReadSerializer


class StructuralMemberWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructuralMember
        fields = [
            'id', 'project', 'name', 'member_type', 'description',
        ]
        read_only_fields = ['id']

    def validate_project(self, value):
        from api.access import can_write_lab_resource
        user = self.context['request'].user
        if not can_write_lab_resource(user, value):
            raise serializers.ValidationError('شما به این پروژه دسترسی نوشتن ندارید.')
        return value


class StructuralMemberReadSerializer(StructuralMemberWriteSerializer):
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    pour_count = serializers.SerializerMethodField()
    mold_count = serializers.SerializerMethodField()

    class Meta(StructuralMemberWriteSerializer.Meta):
        fields = StructuralMemberWriteSerializer.Meta.fields + [
            'project_name', 'pour_count', 'mold_count', 'created_at', 'updated_at',
        ]

    def get_pour_count(self, obj):
        return obj.pour_series.count()

    def get_mold_count(self, obj):
        return sum(ps.molds.count() for ps in obj.pour_series.all())