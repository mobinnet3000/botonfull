from rest_framework import viewsets

from api.models import Factory
from api.serializers import FactorySerializer
from api.permissions import FactoryAccess
from api.roles import ADMIN, LAB_MANAGER, FACTORY_MANAGER, READONLY, get_role
from api.views.base import ScopedModelViewSet


class FactoryViewSet(ScopedModelViewSet):
    queryset = Factory.objects.all()
    serializer_class = FactorySerializer
    write_roles = (ADMIN, FACTORY_MANAGER)
    search_fields = ['name', 'phone_number', 'address']

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        return [IsAuthenticated(), FactoryAccess()]

    def get_queryset(self):
        role = get_role(self.request.user)
        if role in (ADMIN, READONLY, LAB_MANAGER):
            return Factory.objects.all()
        if role == FACTORY_MANAGER:
            return Factory.objects.filter(manager=self.request.user)
        return Factory.objects.none()
