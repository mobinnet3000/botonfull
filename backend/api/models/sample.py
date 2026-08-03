import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone

from api.constants import (
    SPECIMEN_TYPE_CHOICES, SPECIMEN_SIZE_CHOICES,
    PRODUCTION_METHOD_CHOICES, DEFAULT_SPECIMEN_TYPE,
    DEFAULT_SPECIMEN_SIZE, DEFAULT_SAMPLE_CEMENT_GRADE,
    DEFAULT_AMBIENT_TEMPERATURE,
)

SAMPLE_STATUS_CHOICES = [
    ('created', 'ایجاد شده'),
    ('received', 'دریافت شده'),
    ('waiting', 'در انتظار'),
    ('stored', 'نگهداری'),
    ('curing', 'عمل‌آوری'),
    ('ready_for_test', 'آماده آزمون'),
    ('testing', 'در حال آزمون'),
    ('completed', 'تکمیل شده'),
    ('reported', 'گزارش شده'),
    ('archived', 'بایگانی'),
    ('cancelled', 'لغو شده'),
]

DEFAULT_SAMPLE_STATUS = 'created'


class Sample(models.Model):
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='samples',
        db_index=True,
    )

    code = models.CharField(
        max_length=50, unique=True, blank=True, verbose_name='کد نمونه',
        help_text='کد یکتای خودکار',
    )
    barcode = models.CharField(max_length=50, blank=True, verbose_name='بارکد')
    qr_token = models.CharField(max_length=64, unique=True, blank=True, verbose_name='توکن QR')

    date = models.DateTimeField(verbose_name='تاریخ')
    casting_date = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ بتن‌ریزی')
    sampling_date = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ نمونه‌برداری')
    receiving_date = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ دریافت در آزمایشگاه')

    status = models.CharField(
        max_length=20, choices=SAMPLE_STATUS_CHOICES,
        default=DEFAULT_SAMPLE_STATUS, verbose_name='وضعیت', db_index=True,
    )
    current_location = models.CharField(max_length=200, blank=True, verbose_name='محل فعلی')

    sampling_volume = models.FloatField(verbose_name='حجم بتن‌ریزی (متر مکعب)')

    cement_grade = models.CharField(max_length=50, verbose_name='عیار سیمان')

    cement_type = models.CharField(
        max_length=100,
        verbose_name='تیپ سیمان',
        default='',
        blank=True,
    )

    category = models.CharField(max_length=100, verbose_name='رده')
    weather_condition = models.CharField(max_length=100, verbose_name='وضعیت جوی')

    ambient_temperature = models.FloatField(
        verbose_name='دمای محیط',
        default=DEFAULT_AMBIENT_TEMPERATURE,
    )

    concrete_factory = models.CharField(max_length=200, verbose_name='کارخانه بتن')

    specimen_type = models.CharField(
        max_length=10,
        choices=SPECIMEN_TYPE_CHOICES,
        default=DEFAULT_SPECIMEN_TYPE,
        verbose_name='نوع نمونه',
    )

    specimen_size = models.CharField(
        max_length=20,
        choices=SPECIMEN_SIZE_CHOICES,
        default=DEFAULT_SPECIMEN_SIZE,
        verbose_name='سایز نمونه',
    )

    sampling_location = models.CharField(
        max_length=200,
        verbose_name='محل نمونه‌برداری',
        default='',
    )

    concrete_production_method = models.CharField(
        max_length=20,
        choices=PRODUCTION_METHOD_CHOICES,
        default='factory_batching',
        verbose_name='روش ساخت بتن',
    )

    sample_type = models.ForeignKey(
        'SampleType', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='samples', verbose_name='نوع نمونه (دسته‌بندی)',
    )
    weight = models.FloatField(null=True, blank=True, verbose_name='وزن (kg)')
    dimensions = models.JSONField(default=dict, blank=True, verbose_name='ابعاد')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sampled_samples', verbose_name='تکنسین نمونه‌بردار',
    )
    responsible_engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='engineer_samples', verbose_name='مهندس مسئول',
    )
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='received_samples', verbose_name='دریافت‌کننده',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_samples', verbose_name='ایجادکننده',
    )

    class Meta:
        verbose_name = 'نمونه'
        verbose_name_plural = 'نمونه‌ها'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['project', 'date']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.code:
            self.code = f'SMP-{secrets.token_hex(4).upper()}'
        if not self.barcode:
            self.barcode = self.code
        if not self.qr_token:
            self.qr_token = secrets.token_urlsafe(24)
        if self.casting_date is None:
            self.casting_date = self.date
        super().save(*args, **kwargs)

    @property
    def age_in_days(self) -> int | None:
        base = self.casting_date or self.date
        if base is None:
            return None
        return (timezone.now() - base).days

    def __str__(self) -> str:
        return f'{self.code} - {self.project.project_name}'
