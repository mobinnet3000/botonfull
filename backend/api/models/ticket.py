from django.db import models
from django.contrib.auth.models import User
from api.constants import TICKET_STATUS_CHOICES, TICKET_PRIORITY_CHOICES


class Ticket(models.Model):
    title = models.CharField(max_length=255, verbose_name='عنوان')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='tickets',
        verbose_name='کاربر', db_index=True,
    )
    status = models.CharField(
        max_length=20, choices=TICKET_STATUS_CHOICES,
        default='open', verbose_name='وضعیت',
    )
    priority = models.CharField(
        max_length=20, choices=TICKET_PRIORITY_CHOICES,
        default='medium', verbose_name='اولویت',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='بروزرسانی')

    class Meta:
        verbose_name = 'تیکت'
        verbose_name_plural = 'تیکت‌ها'
        ordering = ['-updated_at', '-created_at']

    def __str__(self) -> str:
        return f'تیکت: {self.title} ({self.user.username})'


class TicketMessage(models.Model):
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='messages',
        verbose_name='تیکت', db_index=True,
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='کاربر')
    message = models.TextField(verbose_name='متن پیام')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='ایجاد')

    class Meta:
        verbose_name = 'پیام تیکت'
        verbose_name_plural = 'پیام‌های تیکت'
        ordering = ['created_at']

    def __str__(self) -> str:
        return f'پیام از {self.user.username} برای تیکت {self.ticket_id}'
