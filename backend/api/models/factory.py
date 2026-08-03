from django.db import models
from django.contrib.auth.models import User


class Factory(models.Model):
    name = models.CharField(max_length=200, verbose_name='نام کارخانه')
    manager = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='factory', verbose_name='مدیر کارخانه',
    )
    phone_number = models.CharField(max_length=20, blank=True, verbose_name='تلفن کارخانه')
    address = models.TextField(blank=True, verbose_name='آدرس کارخانه')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    class Meta:
        verbose_name = 'کارخانه بتن'
        verbose_name_plural = 'کارخانه‌های بتن'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
