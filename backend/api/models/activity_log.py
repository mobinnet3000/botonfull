from django.db import models
from django.conf import settings

ACTIVITY_ACTION_CHOICES = [
    ('create', 'ایجاد'),
    ('update', 'بروزرسانی'),
    ('delete', 'حذف'),
    ('login', 'ورود'),
    ('logout', 'خروج'),
    ('approval', 'تأیید'),
    ('file_upload', 'بارگذاری فایل'),
    ('status_change', 'تغییر وضعیت'),
]


class ActivityLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='activity_logs', verbose_name='کاربر',
    )
    action = models.CharField(
        max_length=30, choices=ACTIVITY_ACTION_CHOICES, verbose_name='عملیات',
    )
    content_type = models.CharField(max_length=100, verbose_name='نوع مدل')
    object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name='شناسه')
    object_repr = models.CharField(max_length=255, blank=True, verbose_name='نمایش')
    old_value = models.JSONField(null=True, blank=True, verbose_name='مقدار قبلی')
    new_value = models.JSONField(null=True, blank=True, verbose_name='مقدار جدید')
    ip = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ', db_index=True)

    class Meta:
        verbose_name = 'لاگ فعالیت'
        verbose_name_plural = 'لاگ‌های فعالیت'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['action']),
        ]

    def __str__(self) -> str:
        return f'{self.action} {self.content_type} #{self.object_id}'
