from django.db import models
from django.conf import settings

TEST_RESULT_STATUS_CHOICES = [
    ('pending', 'در انتظار تأیید'),
    ('approved', 'تأیید شده'),
    ('rejected', 'رد شده'),
]

TEST_EXECUTION_STATUS_CHOICES = [
    ('planned', 'برنامه‌ریزی شده'),
    ('in_progress', 'در حال اجرا'),
    ('completed', 'تکمیل شده'),
]


class TestExecution(models.Model):
    sample = models.ForeignKey(
        'Sample', on_delete=models.CASCADE, related_name='test_executions',
        verbose_name='نمونه', db_index=True,
    )
    test_type = models.ForeignKey(
        'TestType', on_delete=models.PROTECT, related_name='test_executions',
        verbose_name='نوع آزمون',
    )
    lab_request = models.ForeignKey(
        'LabRequest', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='test_executions', verbose_name='درخواست',
    )
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='test_executions', verbose_name='اپراتور',
    )
    machine = models.ForeignKey(
        'Equipment', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='test_executions', verbose_name='دستگاه',
    )
    start_time = models.DateTimeField(verbose_name='زمان شروع')
    finish_time = models.DateTimeField(null=True, blank=True, verbose_name='زمان پایان')
    temperature = models.FloatField(null=True, blank=True, verbose_name='دمای محیط (°C)')
    humidity = models.FloatField(null=True, blank=True, verbose_name='رطوبت (%)')
    measured_values = models.JSONField(default=dict, blank=True, verbose_name='مقادیر اندازه‌گیری')
    calculated_values = models.JSONField(default=dict, blank=True, verbose_name='مقادیر محاسباتی')
    result = models.FloatField(null=True, blank=True, verbose_name='نتیجه نهایی')
    result_status = models.CharField(
        max_length=20, choices=TEST_RESULT_STATUS_CHOICES,
        default='pending', verbose_name='وضعیت نتیجه', db_index=True,
    )
    status = models.CharField(
        max_length=20, choices=TEST_EXECUTION_STATUS_CHOICES,
        default='planned', verbose_name='وضعیت', db_index=True,
    )
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_tests', verbose_name='تأییدکننده نتیجه',
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='زمان تأیید')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'اجرای آزمون'
        verbose_name_plural = 'اجرای آزمون‌ها'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['sample', 'test_type']),
            models.Index(fields=['status']),
            models.Index(fields=['result_status']),
        ]

    def __str__(self) -> str:
        return f'{self.sample.code} - {self.test_type.name}'
