# api/views.py

from rest_framework import viewsets, permissions, generics, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import (
    LabProfile, Project, Sample, SamplingSeries, Mold, Transaction, Ticket, TicketMessage, SamplingSeriesPhoto
)
from .serializers import (
    TransactionSerializer, UserRegistrationSerializer, LabProfileSerializer,
    ProjectReadSerializer, ProjectWriteSerializer,
    SampleReadSerializer, SampleWriteSerializer,
    SamplingSeriesReadSerializer, SamplingSeriesWriteSerializer,
    SamplingSeriesPhotoSerializer,
    MoldSerializer, FullUserDataSerializer,
    TicketSerializer, TicketMessageSerializer
)


# ----------------------
# ثبت نام
# ----------------------
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


# ----------------------
# Full data
# ----------------------
# api/views.py

class FullUserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        # فقط ستون‌های موجود را انتخاب می‌کنیم تا اگر مدل اشتباهاً فیلدی مثل test_type دارد، DB لازم نباشد آن را برگرداند
        projects_qs = (
            Project.objects
            .filter(owner__user=request.user)
            .select_related('owner')
            .prefetch_related(
                'samples',
                'samples__series',
                'samples__series__molds',
                'transactions',
            )
            .only(
                'id', 'owner', 'created_at', 'file_number', 'project_name',
                'client_name', 'client_phone_number',
                'supervisor_name', 'supervisor_phone_number',
                'requester_name', 'requester_phone_number',
                'municipality_zone', 'address', 'project_usage_type',
                'floor_count', 'occupied_area',
                'contract_price',
            )
        )

        data = {
            'user': request.user,
            'projects': projects_qs,
        }
        serializer = FullUserDataSerializer(data)
        return Response(serializer.data)

# ----------------------
# Lab Profile
# ----------------------
class LabProfileViewSet(viewsets.ModelViewSet):
    serializer_class = LabProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LabProfile.objects.filter(user=self.request.user)


# ----------------------
# Project
# ----------------------
class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProjectReadSerializer
        return ProjectWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.lab_profile)


# ----------------------
# Sample
# ----------------------
class SampleViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Sample.objects.filter(project__owner__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SampleReadSerializer
        return SampleWriteSerializer


# ----------------------
# Sampling Series
# ----------------------
class SamplingSeriesViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        return SamplingSeries.objects.filter(sample__project__owner__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SamplingSeriesReadSerializer
        return SamplingSeriesWriteSerializer


# ----------------------
# Sampling Series Photos
# ----------------------
class SamplingSeriesPhotoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SamplingSeriesPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        return SamplingSeriesPhoto.objects.filter(series__sample__project__owner__user=self.request.user)


# ----------------------
# Mold
# ----------------------
class MoldViewSet(viewsets.ModelViewSet):
    serializer_class = MoldSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        return Mold.objects.filter(series__sample__project__owner__user=self.request.user)


# ----------------------
# Transaction
# ----------------------
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(project__owner__user=self.request.user)


# ----------------------
# Ticketing
# ----------------------
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TicketMessageViewSet(viewsets.ModelViewSet):
    serializer_class = TicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TicketMessage.objects.filter(ticket__user=self.request.user).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
