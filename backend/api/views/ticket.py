from rest_framework import viewsets

from api.models import Ticket, TicketMessage
from api.serializers import TicketSerializer, TicketMessageSerializer
from api.permissions import OwnResourcePermission
from api.roles import ADMIN, get_role
from api.views.base import ScopedModelViewSet


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [OwnResourcePermission]
    filterset_fields = ['status', 'priority']
    search_fields = ['title']

    def get_queryset(self):
        qs = Ticket.objects.select_related('user').prefetch_related('messages')
        if get_role(self.request.user) == ADMIN:
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TicketMessageViewSet(viewsets.ModelViewSet):
    serializer_class = TicketMessageSerializer
    permission_classes = [OwnResourcePermission]

    def get_queryset(self):
        qs = TicketMessage.objects.select_related('ticket', 'user')
        if get_role(self.request.user) == ADMIN:
            return qs
        return qs.filter(ticket__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
