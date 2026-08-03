from django.db import models

CLIENT_TYPE_CHOICES = [
    ('company', 'شرکت'),
    ('government', 'سازمان دولتی'),
    ('private', 'مشتری خصوصی'),
]


class Client(models.Model):
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='private', verbose_name='نوع')
    name = models.CharField(max_length=255, verbose_name='نام')
    contact_person = models.CharField(max_length=200, blank=True, verbose_name='شخص رابط')
    phone_number = models.CharField(max_length=30, blank=True, verbose_name='تلفن')
    email = models.EmailField(blank=True, verbose_name='ایمیل')
    address = models.TextField(blank=True, verbose_name='آدرس')
    tax_id = models.CharField(max_length=100, blank=True, verbose_name='شناسه مالیاتی')
    notes = models.TextField(blank=True, verbose_name='یادداشت')
    created_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_clients', verbose_name='ایجادکننده',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    class Meta:
        verbose_name = 'مشتری'
        verbose_name_plural = 'مشتری‌ها'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['client_type']),
        ]

    def __str__(self) -> str:
        return self.name
