import secrets

from django.conf import settings
from django.db import models

from api.constants import TEST_TYPE_CHOICES, DEFAULT_PROJECT_TEST_TYPE

PROJECT_STATUS_CHOICES = [
    ('active', 'فعال'),
    ('on_hold', 'متوقف'),
    ('completed', 'تکمیل شده'),
    ('cancelled', 'لغو شده'),
]

PROJECT_PRIORITY_CHOICES = [
    ('low', 'کم'),
    ('medium', 'متوسط'),
    ('high', 'زیاد'),
    ('urgent', 'فوری'),
]


class Project(models.Model):
    owner = models.ForeignKey(
        'LabProfile', on_delete=models.CASCADE, related_name='projects',
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ساخت پروژه')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    code = models.CharField(
        max_length=50, unique=True, blank=True, verbose_name='کد پروژه',
        help_text='کد خودکار یکتا',
    )
    file_number = models.CharField(max_length=100, verbose_name='شماره پرونده', db_index=True)
    project_name = models.CharField(max_length=255, verbose_name='نام پروژه')

    client_name = models.CharField(max_length=200, verbose_name='نام کارفرما')
    client_phone_number = models.CharField(max_length=20, verbose_name='شماره تماس کارفرما')

    supervisor_name = models.CharField(max_length=200, verbose_name='نام ناظر')
    supervisor_phone_number = models.CharField(max_length=20, verbose_name='شماره تماس ناظر')

    requester_name = models.CharField(max_length=200, verbose_name='نام درخواست دهنده')
    requester_phone_number = models.CharField(max_length=20, verbose_name='شماره تماس درخواست دهنده')

    municipality_zone = models.CharField(max_length=100, verbose_name='منطقه شهرداری')
    address = models.TextField(verbose_name='آدرس')

    project_usage_type = models.CharField(max_length=100, verbose_name='کاربری پروژه')
    floor_count = models.IntegerField(verbose_name='طبقات')

    test_type = models.CharField(
        max_length=20,
        choices=TEST_TYPE_CHOICES,
        default=DEFAULT_PROJECT_TEST_TYPE,
        verbose_name='نوع آزمون',
    )

    occupied_area = models.FloatField(verbose_name='سطح زیربنا اشغال شده (مترمربع)')
    contract_price = models.DecimalField(
        max_digits=20, decimal_places=2, default=0.0,
        verbose_name='مبلغ کل قرارداد',
    )

    client = models.ForeignKey(
        'Client', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='projects', verbose_name='مشتری',
    )
    contractor_name = models.CharField(max_length=255, blank=True, verbose_name='پیمانکار')
    consultant_name = models.CharField(max_length=255, blank=True, verbose_name='مشاور')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    contract_number = models.CharField(max_length=100, blank=True, verbose_name='شماره قرارداد')
    start_date = models.DateField(null=True, blank=True, verbose_name='تاریخ شروع')
    end_date = models.DateField(null=True, blank=True, verbose_name='تاریخ پایان')
    status = models.CharField(
        max_length=20, choices=PROJECT_STATUS_CHOICES,
        default='active', verbose_name='وضعیت',
    )
    priority = models.CharField(
        max_length=20, choices=PROJECT_PRIORITY_CHOICES,
        default='medium', verbose_name='اولویت',
    )
    responsible_engineer = models.CharField(max_length=200, blank=True, verbose_name='مهندس مسئول')
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    created_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_projects', verbose_name='ایجادکننده',
    )

    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='client_projects', verbose_name='کاربر کارفرما',
    )
    supervisor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='supervised_projects', verbose_name='کاربر ناظر',
    )
    factory = models.ForeignKey(
        'Factory', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='projects', verbose_name='کارخانه تامین بتن',
    )

    class Meta:
        verbose_name = 'پروژه'
        verbose_name_plural = 'پروژه‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['client']),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self.code:
            self.code = f'PRJ-{secrets.token_hex(3).upper()}'
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.project_name
