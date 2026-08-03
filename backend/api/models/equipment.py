from django.db import models

EQUIPMENT_STATUS_CHOICES = [
    ('active', 'فعال'),
    ('maintenance', 'در تعمیر'),
    ('out_of_service', 'از کار افتاده'),
    ('retired', 'بازنشسته'),
]


class Equipment(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='کد دستگاه')
    name = models.CharField(max_length=200, verbose_name='نام دستگاه')
    manufacturer = models.CharField(max_length=200, blank=True, verbose_name='سازنده')
    model = models.CharField(max_length=200, blank=True, verbose_name='مدل')
    serial_number = models.CharField(max_length=200, blank=True, verbose_name='شماره سریال')
    calibration_date = models.DateField(null=True, blank=True, verbose_name='تاریخ کالیبراسیون')
    next_calibration_date = models.DateField(null=True, blank=True, verbose_name='کالیبراسیون بعدی')
    status = models.CharField(
        max_length=20, choices=EQUIPMENT_STATUS_CHOICES,
        default='active', verbose_name='وضعیت', db_index=True,
    )
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    class Meta:
        verbose_name = 'دستگاه آزمایشگاهی'
        verbose_name_plural = 'دستگاه‌های آزمایشگاهی'
        ordering = ['name']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['next_calibration_date']),
        ]

    @property
    def is_calibration_expired(self) -> bool:
        from django.utils import timezone
        if not self.next_calibration_date:
            return False
        return self.next_calibration_date < timezone.now().date()

    @property
    def is_usable(self) -> bool:
        return self.status == 'active' and not self.is_calibration_expired

    def __str__(self) -> str:
        return self.name


MAINTENANCE_TYPE_CHOICES = [
    ('calibration', 'کالیبراسیون'),
    ('maintenance', 'نگهداری'),
    ('repair', 'تعمیر'),
]


class MaintenanceRecord(models.Model):
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='maintenance_records',
        verbose_name='دستگاه', db_index=True,
    )
    maintenance_type = models.CharField(
        max_length=20, choices=MAINTENANCE_TYPE_CHOICES,
        default='maintenance', verbose_name='نوع',
    )
    date = models.DateField(verbose_name='تاریخ')
    technician = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='maintenance_records', verbose_name='تکنسین',
    )
    next_due_date = models.DateField(null=True, blank=True, verbose_name='نوبت بعدی')
    notes = models.TextField(blank=True, verbose_name='توضیحات')

    class Meta:
        verbose_name = 'رکورد نگهداری'
        verbose_name_plural = 'رکوردهای نگهداری'
        ordering = ['-date']

    def __str__(self) -> str:
        return f'{self.equipment.name} - {self.get_maintenance_type_display()}'
