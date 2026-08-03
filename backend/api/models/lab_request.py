import secrets

from django.db import models

LAB_REQUEST_STATUS_CHOICES = [
    ('draft', 'پیش‌نویس'),
    ('submitted', 'ارسال شده'),
    ('approved', 'تأیید شده'),
    ('rejected', 'رد شده'),
    ('in_progress', 'در حال انجام'),
    ('completed', 'تکمیل شده'),
    ('cancelled', 'لغو شده'),
]

LAB_REQUEST_PRIORITY_CHOICES = [
    ('low', 'کم'),
    ('medium', 'متوسط'),
    ('high', 'زیاد'),
    ('urgent', 'فوری'),
]


class LabRequest(models.Model):
    request_number = models.CharField(
        max_length=50, unique=True, blank=True, verbose_name='شماره درخواست',
    )
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='lab_requests',
        verbose_name='پروژه', db_index=True,
    )
    priority = models.CharField(
        max_length=20, choices=LAB_REQUEST_PRIORITY_CHOICES,
        default='medium', verbose_name='اولویت',
    )
    requested_tests = models.ManyToManyField(
        'TestType', related_name='lab_requests', verbose_name='آزمون‌های درخواستی',
    )
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='مهلت')
    requested_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='requested_lab_requests', verbose_name='درخواست‌دهنده',
    )
    approved_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_lab_requests', verbose_name='تأییدکننده',
    )
    status = models.CharField(
        max_length=20, choices=LAB_REQUEST_STATUS_CHOICES,
        default='draft', verbose_name='وضعیت', db_index=True,
    )
    comments = models.TextField(blank=True, verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'درخواست آزمایشگاهی'
        verbose_name_plural = 'درخواست‌های آزمایشگاهی'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['due_date']),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.request_number:
            self.request_number = f'REQ-{secrets.token_hex(3).upper()}'
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.request_number} - {self.project.project_name}'
