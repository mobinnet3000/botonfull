from rest_framework import viewsets
from django.contrib.auth.models import User

from api.serializers import AdminUserSerializer
from api.permissions import IsAdmin
from api.views.base import ScopedModelViewSet


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']

    def get_queryset(self):
        return User.objects.select_related('profile').order_by('-date_joined')
