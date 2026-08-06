from django.db import models


class ProjectSettings(models.Model):
    project = models.OneToOneField(
        'Project', on_delete=models.CASCADE, related_name='settings',
        verbose_name='پروژه',
    )
    default_mold_ages = models.JSONField(default=list, blank=True, verbose_name='سن‌های پیش‌فرض قالب‌ها')
    default_mold_count = models.IntegerField(default=1, verbose_name='تعداد پیش‌فرض قالب برای هر سن')
    pour_name_prefix = models.CharField(default='Truck', max_length=50, verbose_name='پیشوند نام ریز')
    member_name_prefix = models.CharField(default='Member', max_length=50, verbose_name='پیشوند نام عضو')
    use_auto_numbering = models.BooleanField(default=True, verbose_name='استفاده خودکار از شماره‌گذاری')
    next_pour_number = models.IntegerField(default=1, verbose_name='شماره بعدی ریز')
    next_member_number = models.IntegerField(default=1, verbose_name='شماره بعدی عضو')
    custom_age_labels = models.JSONField(default=dict, blank=True, verbose_name='نام‌های سفارشی سن قالب‌ها')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ساخت')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'تنظیمات پروژه'
        verbose_name_plural = 'تنظیمات پروژه‌ها'
        indexes = [
            models.Index(fields=['project']),
        ]

    def __str__(self) -> str:
        return f'تنظیمات — {self.project.project_name}'

    def get_age_label(self, age: int) -> str:
        return self.custom_age_labels.get(str(age), f'{age} روزه')