from io import BytesIO

from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdf_canvas

from api.models import Report, ReportRevision
from api.serializers import ReportSerializer, ReportRevisionSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER, ENGINEER, QUALITY_MANAGER
from api.views.base import ScopedModelViewSet
from api.filters import ReportFilter
from api.services.report_service import ReportService
from api.permissions import ReportApprovalPermission
from api.audit import log_activity


class ReportViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER, ENGINEER, QUALITY_MANAGER)
    serializer_class = ReportSerializer
    filterset_class = ReportFilter
    search_fields = ['report_number', 'title', 'project__project_name']
    ordering_fields = ['created_at', 'version']

    def get_queryset(self):
        return (
            scope_by_project(self.request.user, Report.objects.select_related('project', 'sample', 'created_by'), 'project')
            .prefetch_related('revisions')
        )

    @action(detail=True, methods=['post'], permission_classes=[ReportApprovalPermission])
    def review(self, request, pk=None):
        return self._set_status(request, pk, 'reviewed')

    @action(detail=True, methods=['post'], permission_classes=[ReportApprovalPermission])
    def approve(self, request, pk=None):
        return self._set_status(request, pk, 'approved')

    @action(detail=True, methods=['post'], permission_classes=[ReportApprovalPermission])
    def reject(self, request, pk=None):
        return self._set_status(request, pk, 'rejected')

    def _set_status(self, request, pk, status_value):
        report = self.get_object()
        report = ReportService.update_report(report, {'status': status_value}, request.user)
        log_activity('approval', report, new={'status': status_value})
        return Response(ReportSerializer(report, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def revisions(self, request, pk=None):
        report = self.get_object()
        qs = report.revisions.select_related('changed_by')
        return Response(ReportRevisionSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        report = self.get_object()
        buf = BytesIO()
        c = pdf_canvas.Canvas(buf, pagesize=A4)
        font_name = _register_persian_font(c)
        width, height = A4
        c.setFont(font_name, 10)
        y = height - 20 * mm
        c.drawCentredString(width / 2, y, 'گزارش آزمایشگاهی')
        y -= 8 * mm
        lines = [
            f'شماره گزارش: {report.report_number}',
            f'عنوان: {report.title}',
            f'پروژه: {report.project.project_name}',
            f'نمونه: {report.sample.code if report.sample else "-"}',
            f'وضعیت: {report.get_status_display()}',
            f'نسخه: {report.version}',
            f'توکن تائید: {report.qr_verify_token}',
        ]
        for line in lines:
            c.drawString(20 * mm, y, line)
            y -= 6 * mm
        c.save()
        buf.seek(0)
        response = HttpResponse(buf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{report.report_number}.pdf"'
        return response


def _register_persian_font(c) -> str:
    """ثبت فونت فارسی برای گزارش PDF؛ در نبود فونت از Helvetica استفاده می‌کند."""
    from pathlib import Path
    font_path = Path(__file__).resolve().parent.parent.parent / 'utils' / 'fonts' / 'Vazirmatn-Regular.ttf'
    if font_path.exists():
        if 'Vazirmatn' not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont('Vazirmatn', str(font_path)))
        return 'Vazirmatn'
    return 'Helvetica'
