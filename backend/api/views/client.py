from rest_framework import viewsets, permissions

from api.models import Client
from api.serializers import ClientSerializer
from api.roles import LAB_ROLES, ADMIN, READONLY, CLIENT, get_role
from api.views.base import ScopedModelViewSet


class ClientViewSet(ScopedModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    write_roles = (ADMIN, 'lab_manager', 'reception')
    filterset_fields = ['client_type']
    search_fields = ['name', 'contact_person', 'phone_number', 'email']

    def get_queryset(self):
        qs = Client.objects.all()
        role = get_role(self.request.user)
        if role in (ADMIN, READONLY) or role in LAB_ROLES:
            return qs
        if role == CLIENT:
            return qs.filter(projects__client_user=self.request.user)
        return qs.none()
