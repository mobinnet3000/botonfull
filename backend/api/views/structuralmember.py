from django.db import models
from rest_framework import viewsets, permissions, parsers
from api.models import StructuralMember
from api.serializers import StructuralMemberReadSerializer, StructuralMemberWriteSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class StructuralMemberViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    search_fields = ['name', 'member_type']

    def get_queryset(self):
        qs = scope_by_project(
            self.request.user,
            StructuralMember.objects.select_related('project'),
            'project',
        )
        if self.action == 'list':
            qs = qs.annotate(
                pour_count=models.Count('pour_series', distinct=True),
                mold_count=models.Count('pour_series__molds', distinct=True),
            )
        return qs

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return StructuralMemberReadSerializer
        return StructuralMemberWriteSerializer