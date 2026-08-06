from django.db import models
from api.validators import validate_image_file


MOLD_STATUS_CHOICES = [
    ('pending', 'در انتظار'),
    ('in_progress', 'در حال آزمون'),
    ('completed', 'انجام شده'),
    ('rejected', 'رد شده'),
    ('overdue', 'دیرکرد'),
]

MOLD_PRIORITY_CHOICES = [
    ('low', 'کم'),
    ('medium', 'متوسط'),
    ('high', 'زیاد'),
    ('urgent', 'فوری'),
]


class Mold(models.Model):
    pour_series = models.ForeignKey(
        'PourSeries', related_name='molds', on_delete=models.CASCADE,
        db_index=True, verbose_name='ریز بتن',
    )
    age_in_days = models.IntegerField(verbose_name='سن (روز)')
    sample_identifier = models.CharField(max_length=100, verbose_name='شناسه قالب')
    mass = models.FloatField(default=0.0, blank=True, null=True, verbose_name='وزن (kg)')
    breaking_load = models.FloatField(default=0.0, blank=True, null=True, verbose_name='بار شکست (kg/cm2)')
    failure_type = models.CharField(max_length=200, blank=True, verbose_name='نوع شکست')
    test_notes = models.TextField(blank=True, verbose_name='یادداشت آزمون')
    extra_data = models.JSONField(default=dict, blank=True, verbose_name='داده‌های افزوده')

    status = models.CharField(
        max_length=20, choices=MOLD_STATUS_CHOICES,
        default='pending', verbose_name='وضعیت', db_index=True,
    )
    priority = models.CharField(
        max_length=20, choices=MOLD_PRIORITY_CHOICES,
        default='medium', verbose_name='اولویت',
    )
    technician = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_molds', verbose_name='تکنسین',
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ساخت')
    completed_at = models.DateTimeField(blank=True, null=True, verbose_name='تاریخ انجام')
    deadline = models.DateTimeField(verbose_name='موعد آزمون')

    pre_break_image = models.ImageField(
        upload_to='molds/pre_break/', blank=True, null=True,
        verbose_name='عکس قبل شکست', validators=[validate_image_file],
    )
    post_break_image = models.ImageField(
        upload_to='molds/post_break/', blank=True, null=True,
        verbose_name='عکس بعد شکست', validators=[validate_image_file],
    )

    class Meta:
        verbose_name = 'قالب'
        verbose_name_plural = 'قالب‌ها'
        ordering = ['deadline']
        indexes = [
            models.Index(fields=['pour_series', 'age_in_days']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['deadline']),
            models.Index(fields=['technician']),
        ]

    def __str__(self) -> str:
        return f'قالب {self.sample_identifier}'

    @property
    def is_done(self) -> bool:
        return self.status in ('completed', 'rejected') or (self.breaking_load is not None and self.breaking_load > 0)