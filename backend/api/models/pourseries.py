from django.db import models
from api.validators import validate_image_file


class PourSeries(models.Model):
    structural_member = models.ForeignKey(
        'StructuralMember', on_delete=models.CASCADE, related_name='pour_series',
        verbose_name='عضو سازه‌ای', db_index=True,
    )
    sample = models.ForeignKey(
        'Sample', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='pour_series', verbose_name='نمونه',
    )
    name = models.CharField(max_length=200, verbose_name='نام ریز بتن')
    pour_date = models.DateTimeField(verbose_name='تاریخ ریز')
    concrete_temperature = models.FloatField(default=0.0, verbose_name='دمای بتن')
    concrete_temperature_image = models.ImageField(
        upload_to='pours/concrete_temperature/', blank=True, null=True,
        validators=[validate_image_file], verbose_name='عکس دمای بتن',
    )
    slump = models.FloatField(default=0.0, verbose_name='اسلامپ')
    slump_image = models.ImageField(
        upload_to='pours/slump/', blank=True, null=True,
        validators=[validate_image_file], verbose_name='عکس اسلامپ',
    )
    axis = models.CharField(max_length=100, blank=True, verbose_name='محور')
    has_additive = models.BooleanField(default=False, verbose_name='داشتن افزودنی')
    truck_number = models.CharField(max_length=100, blank=True, verbose_name='شماره کامیون')
    batch_number = models.CharField(max_length=100, blank=True, verbose_name='شماره بچ')
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'ریز بتن'
        verbose_name_plural = 'ریزهای بتن'
        ordering = ['-pour_date']
        indexes = [
            models.Index(fields=['structural_member', 'pour_date']),
        ]

    def __str__(self) -> str:
        return f'{self.name} — {self.structural_member.name}'