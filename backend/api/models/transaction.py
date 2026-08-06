from django.db import models
from api.constants import TRANSACTION_TYPE_CHOICES, TRANSACTION_CATEGORY_CHOICES, TRANSACTION_METHOD_CHOICES


class Transaction(models.Model):
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='transactions',
        verbose_name='پروژه', db_index=True,
    )
    type = models.CharField(max_length=7, choices=TRANSACTION_TYPE_CHOICES, verbose_name='نوع تراکنش')
    description = models.TextField(verbose_name='توضیحات')
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='مبلغ')
    date = models.DateTimeField(verbose_name='تاریخ تراکنش')

    category = models.CharField(
        max_length=20, choices=TRANSACTION_CATEGORY_CHOICES,
        default='other', verbose_name='دسته‌بندی', db_index=True,
    )
    method = models.CharField(
        max_length=20, choices=TRANSACTION_METHOD_CHOICES,
        default='bank', verbose_name='روش پرداخت',
    )
    is_settled = models.BooleanField(
        default=True, verbose_name='تسویه شده',
        help_text='برای درآمد: وصول‌شده (در غیر این صورت مطالبات محسوب می‌شود).',
    )
    notes = models.TextField(blank=True, verbose_name='یادداشت')

    class Meta:
        verbose_name = 'تراکنش'
        verbose_name_plural = 'تراکنش‌ها'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['project', 'type', 'date']),
            models.Index(fields=['project', 'category', 'date']),
        ]

    def __str__(self) -> str:
        return f'{self.get_type_display()} - {self.project.project_name}'