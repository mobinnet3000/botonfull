from rest_framework import viewsets, permissions, parsers

from api.models import SamplingSeries, SamplingSeriesPhoto
from api.serializers import (
    SamplingSeriesReadSerializer, SamplingSeriesWriteSerializer,
    SamplingSeriesPhotoSerializer,
)
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN
from api.views.base import ScopedModelViewSet


class SamplingSeriesViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    search_fields = ['name', 'sample__code']

    def get_queryset(self):
        return (
            scope_by_project(
                self.request.user,
                SamplingSeries.objects.select_related('sample__project'),
                'sample__project',
            )
            .prefetch_related('molds', 'photos')
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SamplingSeriesReadSerializer
        return SamplingSeriesWriteSerializer


class SamplingSeriesPhotoViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, TECHNICIAN)
    serializer_class = SamplingSeriesPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            SamplingSeriesPhoto.objects.select_related('series__sample__project'),
            'series__sample__project',
        )
