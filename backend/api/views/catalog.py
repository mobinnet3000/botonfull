from rest_framework import viewsets

from api.models import SampleType, TestType, AcceptanceCriteria
from api.serializers import (
    SampleTypeSerializer, TestTypeSerializer, AcceptanceCriteriaSerializer,
)
from api.access import scope_lab_catalog
from api.roles import ADMIN, LAB_MANAGER, QUALITY_MANAGER
from api.views.base import ScopedModelViewSet


class SampleTypeViewSet(ScopedModelViewSet):
    """کاتالوگ انواع نمونه؛ خواندن برای همه، نوشتن برای مدیریت."""

    queryset = SampleType.objects.all()
    serializer_class = SampleTypeSerializer
    write_roles = (ADMIN, LAB_MANAGER, QUALITY_MANAGER)
    search_fields = ['name', 'code']


class TestTypeViewSet(ScopedModelViewSet):
    """کاتالوگ انواع آزمون؛ خواندن برای همه، نوشتن برای مدیریت."""

    queryset = TestType.objects.all()
    serializer_class = TestTypeSerializer
    write_roles = (ADMIN, LAB_MANAGER, QUALITY_MANAGER)
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'code', 'method_reference']


class AcceptanceCriteriaViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, QUALITY_MANAGER)
    serializer_class = AcceptanceCriteriaSerializer
    filterset_fields = ['test_type', 'is_active']
    search_fields = ['name', 'standard_name']

    def get_queryset(self):
        return scope_lab_catalog(self.request.user, AcceptanceCriteria.objects.select_related('test_type'))
