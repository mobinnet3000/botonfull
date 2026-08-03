from rest_framework import viewsets

from api.models import LabRequest
from api.serializers import LabRequestSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, ENGINEER, RECEPTION
from api.filters import LabRequestFilter
from api.views.base import ScopedModelViewSet


class LabRequestViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, ENGINEER, RECEPTION)
    serializer_class = LabRequestSerializer
    filterset_class = LabRequestFilter
    search_fields = ['request_number', 'project__project_name', 'comments']

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            LabRequest.objects.select_related('project', 'requested_by', 'approved_by'),
            'project',
        ).prefetch_related('requested_tests')
