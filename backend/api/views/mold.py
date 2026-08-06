from rest_framework import viewsets, permissions, parsers
from api.models import Mold
from api.serializers import MoldSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet
from api.filters import MoldFilter


class MoldViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = MoldSerializer
    filterset_class = MoldFilter
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    search_fields = ['sample_identifier', 'test_notes']
    ordering_fields = ['deadline', 'age_in_days', 'created_at', 'status', 'priority']

    def get_queryset(self):
        qs = scope_by_project(
            self.request.user,
            Mold.objects.select_related(
                'pour_series__structural_member__project',
                'technician',
            ),
            'pour_series__structural_member__project',
        )
        
        if self.action == 'list':
            qs = qs.prefetch_related('pour_series__structural_member')
        
        return qs
