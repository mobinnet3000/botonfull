from django.db import models
from api.validators import validate_image_file


class SamplingSeries(models.Model):
    sample = models.ForeignKey(
        'Sample', on_delete=models.CASCADE, related_name='series',
        db_index=True,
    )

    name = models.CharField(max_length=200, verbose_name='نام سری', blank=True)
    concrete_temperature = models.FloatField(verbose_name='دمای بتن')
    concrete_temperature_image = models.ImageField(
        upload_to='series/concrete_temperature/', blank=True, null=True,
        validators=[validate_image_file],
    )

    slump = models.FloatField(verbose_name='اسلامپ')
    slump_image = models.ImageField(
        upload_to='series/slump/', blank=True, null=True,
        validators=[validate_image_file],
    )

    axis = models.CharField(max_length=100, verbose_name='محور', blank=True)
    has_additive = models.BooleanField(default=False, verbose_name='داشتن افزودنی')

    class Meta:
        verbose_name = 'سری نمونه'
        verbose_name_plural = 'سری‌های نمونه'
        ordering = ['id']

    def __str__(self) -> str:
        return f'سری {self.name or self.id} برای نمونه {self.sample_id}'


class SamplingSeriesPhoto(models.Model):
    series = models.ForeignKey(
        SamplingSeries, on_delete=models.CASCADE, related_name='photos',
        verbose_name='سری نمونه', db_index=True,
    )
    image = models.ImageField(
        upload_to='series/specimens/', verbose_name='عکس نمونه‌ها',
        validators=[validate_image_file],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'عکس سری نمونه'
        verbose_name_plural = 'عکس‌های سری نمونه'
        ordering = ['created_at']

    def __str__(self) -> str:
        return f'عکس سری {self.series_id}'
