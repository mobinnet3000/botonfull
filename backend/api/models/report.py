import secrets

from django.db import models
from django.conf import settings

REPORT_STATUS_CHOICES = [
    ('draft', 'پیش‌نویس'),
    ('reviewed', 'بازبینی شده'),
    ('approved', 'تأیید شده'),
    ('rejected', 'رد شده'),
]


class Report(models.Model):
    report_number = models.CharField(
        max_length=50, unique=True, blank=True, verbose_name='شماره گزارش',
    )
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='reports',
        verbose_name='پروژه', db_index=True,
    )
    sample = models.ForeignKey(
        'Sample', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reports', verbose_name='نمونه',
    )
    title = models.CharField(max_length=255, verbose_name='عنوان')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    status = models.CharField(
        max_length=20, choices=REPORT_STATUS_CHOICES,
        default='draft', verbose_name='وضعیت', db_index=True,
    )
    version = models.PositiveIntegerField(default=1, verbose_name='نسخه')
    content = models.JSONField(default=dict, blank=True, verbose_name='محتوای گزارش')
    qr_verify_token = models.CharField(
        max_length=64, unique=True, blank=True, verbose_name='توکن تائید QR',
    )
    digital_signature = models.JSONField(default=dict, blank=True, verbose_name='امضای دیجیتال')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_reports', verbose_name='ایجادکننده',
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_reports', verbose_name='بازبین',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_reports', verbose_name='تأییدکننده',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='زمان بازبینی')
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='زمان تأیید')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'گزارش'
        verbose_name_plural = 'گزارش‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.report_number:
            self.report_number = f'REP-{secrets.token_hex(3).upper()}'
        if not self.qr_verify_token:
            self.qr_verify_token = secrets.token_urlsafe(24)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.report_number} - {self.title}'


class ReportRevision(models.Model):
    report = models.ForeignKey(
        Report, on_delete=models.CASCADE, related_name='revisions',
        verbose_name='گزارش', db_index=True,
    )
    version = models.PositiveIntegerField(verbose_name='نسخه')
    content = models.JSONField(default=dict, blank=True, verbose_name='محتوای نسخه')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='report_revisions', verbose_name='تغییردهنده',
    )
    notes = models.CharField(max_length=500, blank=True, verbose_name='توضیح تغییر')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ')

    class Meta:
        verbose_name = 'نسخه گزارش'
        verbose_name_plural = 'نسخه‌های گزارش'
        ordering = ['-version']

    def __str__(self) -> str:
        return f'{self.report.report_number} نسخه {self.version}'
