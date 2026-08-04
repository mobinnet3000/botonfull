from rest_framework import parsers

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
    search_fields = ['sample_identifier']

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            Mold.objects.select_related('series__sample__project'),
            'series__sample__project',
        )
