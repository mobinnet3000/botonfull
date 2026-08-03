from django.db import models
from django.contrib.auth.models import User

from api.roles import DEFAULT_ROLE, ROLE_CHOICES, ROLE_LABELS


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=DEFAULT_ROLE, verbose_name='نقش')
    phone_number = models.CharField(max_length=20, blank=True, default='', verbose_name='شماره تماس')
    lab = models.ForeignKey(
        'LabProfile', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='members', verbose_name='آزمایشگاه',
    )
    factory = models.ForeignKey(
        'Factory', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='profiles', verbose_name='کارخانه',
    )

    class Meta:
        verbose_name = 'پروفایل کاربر'
        verbose_name_plural = 'پروفایل‌های کاربران'

    def __str__(self) -> str:
        return f'{self.user.username} ({ROLE_LABELS.get(self.role, self.role)})'
