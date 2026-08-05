from rest_framework import serializers

from api.models import StructuralMember
from api.services.structural_member_service import StructuralMemberService


class StructuralMemberWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructuralMember
        fields = [
            'id', 'project', 'name', 'member_type', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        return StructuralMemberService.create_structural_member(validated_data)


class StructuralMemberReadSerializer(StructuralMemberWriteSerializer):
    member_type_display = serializers.CharField(source='get_member_type_display', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    pour_count = serializers.SerializerMethodField()
    mold_count = serializers.SerializerMethodField()

    class Meta(StructuralMemberWriteSerializer.Meta):
        fields = StructuralMemberWriteSerializer.Meta.fields + [
            'member_type_display', 'project_name', 'pour_count', 'mold_count',
        ]

    @staticmethod
    def get_pour_count(obj: StructuralMember) -> int:
        return obj.pour_series.count()

    @staticmethod
    def get_mold_count(obj: StructuralMember) -> int:
        return sum(ps.molds.count() for ps in obj.pour_series.all())
