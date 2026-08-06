from rest_framework import viewsets, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone

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
    search_fields = ['sample_identifier', 'test_notes', 'pour_series__name',
                     'pour_series__structural_member__name',
                     'pour_series__structural_member__project__project_name']
    ordering_fields = ['deadline', 'age_in_days', 'created_at', 'status', 'priority']

    def get_queryset(self):
        qs = scope_by_project(
            self.request.user,
            Mold.objects.select_related(
                'pour_series__structural_member__project',
                'technician',
            ),
            'pour_series__structural_member__project',
        )

        if self.action == 'list':
            qs = qs.prefetch_related('pour_series__structural_member')

        return qs

    @action(detail=True, methods=['post', 'patch'])
    def register_result(self, request, pk=None):
        """ثبت مستقیم نتیجه آزمایش قالب توسط تکنسین."""
        mold = self.get_object()
        data = dict(request.data)
        status = data.get('status', mold.status)
        breaking_load = data.get('breaking_load', mold.breaking_load)

        if status not in ('completed', 'rejected') and breaking_load not in (None, '', 0):
            status = 'completed'
        if status in ('completed', 'rejected') and not data.get('completed_at'):
            data['completed_at'] = timezone.now().isoformat()
        data['status'] = status

        serializer = self.get_serializer(mold, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """به‌روزرسانی گروهی وضعیت/اولویت/تکنسین قالب‌ها."""
        ids = request.data.get('ids') or []
        if not ids:
            return Response({'detail': 'قالبی انتخاب نشده است.'}, status=400)

        allowed = scope_by_project(
            request.user,
            Mold.objects.all(),
            'pour_series__structural_member__project',
        ).filter(id__in=ids)

        updates = {}
        for field in ('status', 'priority', 'technician', 'deadline'):
            if field in request.data and request.data[field] not in (None, ''):
                updates[field] = request.data[field]

        if not updates:
            return Response({'detail': 'مقداری برای به‌روزرسانی ارسال نشده است.'}, status=400)

        with transaction.atomic():
            if 'status' in updates and updates['status'] in ('completed', 'rejected'):
                updates['completed_at'] = timezone.now()
            count = allowed.update(**updates)

        return Response({'updated': count})

    @action(detail=False, methods=['post'])
    def assign(self, request):
        """انتساب سریع تکنسین به چند قالب."""
        ids = request.data.get('ids') or []
        technician = request.data.get('technician')
        if not ids or not technician:
            return Response({'detail': 'شناسه قالب‌ها و تکنسین الزامی است.'}, status=400)

        allowed = scope_by_project(
            request.user,
            Mold.objects.all(),
            'pour_series__structural_member__project',
        ).filter(id__in=ids)

        with transaction.atomic():
            count = allowed.update(technician_id=technician)

        return Response({'updated': count})