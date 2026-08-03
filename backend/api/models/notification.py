from django.db import models
from django.conf import settings

NOTIFICATION_TYPE_CHOICES = [
    ('sample_ready', 'آمادگی نمونه'),
    ('late_test', 'تأخیر آزمون'),
    ('equipment_calibration', 'کالیبراسیون دستگاه'),
    ('report_approved', 'تأیید گزارش'),
    ('report_reviewed', 'بازبینی گزارش'),
    ('project_update', 'بروزرسانی پروژه'),
    ('general', 'عمومی'),
]


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications', verbose_name='کاربر', db_index=True,
    )
    ntype = models.CharField(
        max_length=30, choices=NOTIFICATION_TYPE_CHOICES,
        default='general', verbose_name='نوع',
    )
    title = models.CharField(max_length=255, verbose_name='عنوان')
    message = models.TextField(blank=True, verbose_name='متن')
    link = models.CharField(max_length=500, blank=True, verbose_name='لینک')
    is_read = models.BooleanField(default=False, verbose_name='خوانده شده')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ')

    class Meta:
        verbose_name = 'اعلان'
        verbose_name_plural = 'اعلان‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self) -> str:
        return self.title
