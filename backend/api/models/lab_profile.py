import secrets

from django.db import models
from django.contrib.auth.models import User


class LabProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lab_profile')
    lab_name = models.CharField(max_length=200, verbose_name='نام آزمایشگاه')
    lab_phone_number = models.CharField(max_length=20, verbose_name='شماره آزمایشگاه', blank=True)
    lab_mobile_number = models.CharField(max_length=20, verbose_name='موبایل آزمایشگاه')
    lab_address = models.TextField(verbose_name='آدرس آزمایشگاه')
    province = models.CharField(max_length=100, verbose_name='استان')
    city = models.CharField(max_length=100, verbose_name='شهر')
    telegram_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='آیدی تلگرام')
    lab_code = models.CharField(
        max_length=16, unique=True, blank=True, verbose_name='کد عضویت آزمایشگاه',
        help_text='کد اختصاصی برای پیوستن اپراتور/تکنسین‌ها به آزمایشگاه',
    )

    class Meta:
        verbose_name = 'پروفایل آزمایشگاه'
        verbose_name_plural = 'پروفایل‌های آزمایشگاه'

    def save(self, *args, **kwargs) -> None:
        if not self.lab_code:
            self.lab_code = secrets.token_hex(4).upper()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.lab_name
