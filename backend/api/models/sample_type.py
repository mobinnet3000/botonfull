from django.db import models


class SampleType(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='کد')
    name = models.CharField(max_length=200, verbose_name='نام')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'نوع نمونه'
        verbose_name_plural = 'انواع نمونه'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
