from django.db import models
from django.conf import settings


class CuringTank(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='کد مخزن')
    name = models.CharField(max_length=200, verbose_name='نام مخزن')
    capacity = models.FloatField(null=True, blank=True, verbose_name='ظرفیت')
    water_temperature = models.FloatField(null=True, blank=True, verbose_name='دمای آب (°C)')
    location = models.CharField(max_length=200, blank=True, verbose_name='موقعیت')
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'مخزن عمل‌آوری'
        verbose_name_plural = 'مخزن‌های عمل‌آوری'
        ordering = ['name']

    @property
    def current_sample_count(self) -> int:
        return self.records.filter(exit_date__isnull=True).count()

    def __str__(self) -> str:
        return self.name


class CuringRecord(models.Model):
    tank = models.ForeignKey(
        CuringTank, on_delete=models.CASCADE, related_name='records',
        verbose_name='مخزن', db_index=True,
    )
    sample = models.ForeignKey(
        'Sample', on_delete=models.CASCADE, related_name='curing_records',
        verbose_name='نمونه', db_index=True,
    )
    entry_date = models.DateTimeField(verbose_name='تاریخ ورود')
    exit_date = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ خروج')
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='curing_records', verbose_name='اپراتور',
    )
    notes = models.TextField(blank=True, verbose_name='یادداشت')

    class Meta:
        verbose_name = 'رکورد عمل‌آوری'
        verbose_name_plural = 'رکوردهای عمل‌آوری'
        ordering = ['-entry_date']

    def __str__(self) -> str:
        return f'{self.sample.code} در {self.tank.name}'
