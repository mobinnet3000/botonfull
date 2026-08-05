from django.db import transaction

from api.models import StructuralMember


class StructuralMemberService:

    @staticmethod
    @transaction.atomic
    def create_structural_member(validated_data: dict) -> StructuralMember:
        """Create a new structural member for a project."""
        member = StructuralMember.objects.create(**validated_data)
        return member

    @staticmethod
    @transaction.atomic
    def update_structural_member(member: StructuralMember, validated_data: dict) -> StructuralMember:
        """Update an existing structural member."""
        for field, value in validated_data.items():
            setattr(member, field, value)
        member.save()
        return member

    @staticmethod
    def get_structural_members_by_project(project_id: int) -> list[StructuralMember]:
        """Get all structural members for a specific project."""
        return list(StructuralMember.objects.filter(project_id=project_id).select_related('project'))

    @staticmethod
    @transaction.atomic
    def delete_structural_member(member: StructuralMember) -> None:
        """Delete a structural member and all its related data."""
        member.delete()
