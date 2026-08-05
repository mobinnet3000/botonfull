from django.db import models
from api.validators import validate_image_file


class SamplingSeries(models.Model):
    sample = models.ForeignKey(
        'Sample', on_delete=models.CASCADE, related_name='series',
        db_index=True,
        verbose_name='\u0646\u0645\u0648\u0646\u0647',
    )
    pour_series = models.ForeignKey(
        'PourSeries', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sampling_series', db_index=True,
        verbose_name='\u0631\u06cc\u0632 \u0628\u062a\u0646',
    )

    name = models.CharField(max_length=200, verbose_name='\u0646\u0627\u0645 \u0633\u0631\u06cc', blank=True)
    concrete_temperature = models.FloatField(verbose_name='\u062f\u0645\u0627\u06cc \u0628\u062a\u0646')
    concrete_temperature_image = models.ImageField(
        upload_to='series/concrete_temperature/', blank=True, null=True,
        validators=[validate_image_file],
        verbose_name='\u0639\u06a9\u0633 \u062f\u0645\u0627\u06cc \u0628\u062a\u0646',
    )

    slump = models.FloatField(verbose_name='\u0627\u0633\u0644\u0627\u0645\u067e')
    slump_image = models.ImageField(
        upload_to='series/slump/', blank=True, null=True,
        validators=[validate_image_file],
        verbose_name='\u0639\u06a9\u0633 \u0627\u0633\u0644\u0627\u0645\u067e',
    )

    axis = models.CharField(max_length=100, verbose_name='\u0645\u062d\u0648\u0631', blank=True)
    has_additive = models.BooleanField(default=False, verbose_name='\u062f\u0627\u0634\u062a\u0646 \u0627\u0641\u0632\u0648\u062f\u0646\u06cc')

    class Meta:
        verbose_name = '\u0633\u0631\u06cc \u0646\u0645\u0648\u0646\u0647'
        verbose_name_plural = '\u0633\u0631\u06cc\u200c\u0647\u0627\u06cc \u0646\u0645\u0648\u0646\u0647'
        ordering = ['id']
        indexes = [
            models.Index(fields=['sample', 'pour_series']),
        ]

    def __str__(self) -> str:
        return f'\u0633\u0631\u06cc {self.name or self.id} \u0628\u0631\u0627\u06cc \u0646\u0645\u0648\u0646\u0647 {self.sample_id}'


class SamplingSeriesPhoto(models.Model):
    series = models.ForeignKey(
        SamplingSeries, on_delete=models.CASCADE, related_name='photos',
        verbose_name='\u0633\u0631\u06cc \u0646\u0645\u0648\u0646\u0647', db_index=True,
    )
    image = models.ImageField(
        upload_to='series/specimens/', verbose_name='\u0639\u06a9\u0633 \u0633\u0631\u06cc \u0646\u0645\u0648\u0646\u0647\u200c\u0647\u0627',
        validators=[validate_image_file],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '\u0639\u06a9\u0633 \u0633\u0631\u06cc \u0646\u0645\u0648\u0646\u0647'
        verbose_name_plural = '\u0639\u06a9\u0633\u200c\u0647\u0627\u06cc \u0633\u0631\u06cc \u0646\u0645\u0648\u0646\u0647'
        ordering = ['created_at']

    def __str__(self) -> str:
        return f'\u0639\u06a9\u0633 \u0633\u0631\u06cc {self.series_id}'
