from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema

from api.serializers import (
    UserRegistrationSerializer, FullUserDataSerializer,
)
from api.selectors import FullDataSelector


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class FullUserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=FullUserDataSerializer)
    def get(self, request, *args, **kwargs):
        data = FullDataSelector.get_full_user_data(request.user)
        serializer = FullUserDataSerializer(data)
        return Response(serializer.data)
