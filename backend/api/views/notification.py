from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Notification
from api.serializers import NotificationSerializer
from api.roles import ADMIN, get_role
from api.views.base import ScopedModelViewSet


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    filterset_fields = ['is_read', 'ntype']

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        if get_role(self.request.user) == ADMIN:
            qs = Notification.objects.all()
        return qs

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'detail': 'خوانده شد.'})

    @action(detail=False, methods=['post'])
    def read_all(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'detail': 'همه خوانده شد.'})
