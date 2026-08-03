from django.db import models
from django.conf import settings
from api.validators import validate_file_size, validate_file_extension

FILE_CONTENT_TYPE_CHOICES = [
    ('project', 'پروژه'),
    ('sample', 'نمونه'),
    ('report', 'گزارش'),
    ('testexecution', 'اجرای آزمون'),
    ('labrequest', 'درخواست آزمایشگاهی'),
    ('equipment', 'دستگاه'),
]


class AppFile(models.Model):
    content_type = models.CharField(
        max_length=30, choices=FILE_CONTENT_TYPE_CHOICES, verbose_name='نوع پیوند',
    )
    object_id = models.PositiveIntegerField(verbose_name='شناسه شیء', db_index=True)
    file = models.FileField(
        upload_to='files/%Y/%m/', validators=[validate_file_extension, validate_file_size],
        verbose_name='فایل',
    )
    original_name = models.CharField(max_length=255, blank=True, verbose_name='نام اصلی')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='uploaded_files', verbose_name='بارگذاری‌کننده',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ')

    class Meta:
        verbose_name = 'فایل'
        verbose_name_plural = 'فایل‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self) -> str:
        return self.original_name or self.file.name
