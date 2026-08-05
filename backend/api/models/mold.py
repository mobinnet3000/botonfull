from django.db import models
from django.utils import timezone
from api.validators import validate_image_file


MOLD_STATUS_CHOICES = [
    ('pending', '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631'),
    ('in_progress', '\u062f\u0631 \u062d\u0627\u0644 \u0622\u0632\u0645\u0648\u0646'),
    ('completed', '\u0622\u0646\u062c\u0627\u0645 \u0634\u062f\u0647'),
    ('rejected', '\u0631\u062f \u0634\u062f\u0647'),
    ('overdue', '\u062f\u06cc\u0631\u06a9\u0648\u0644\u062f'),
]

MOLD_PRIORITY_CHOICES = [
    ('low', '\u06a9\u0645'),
    ('medium', '\u0645\u062a\u0648\u0633\u0637'),
    ('high', '\u0632\u06cc\u0627\u062f'),
    ('urgent', '\u0641\u0648\u0631\u06cc'),
]


class Mold(models.Model):
    pour_series = models.ForeignKey(
        'PourSeries', related_name='molds', on_delete=models.CASCADE,
        db_index=True,
        verbose_name='\u0631\u06cc\u0632 \u0628\u062a\u0646',
    )
    age_in_days = models.IntegerField(verbose_name='\u0633\u0646 (\u0631\u0648\u0632)')

    mass = models.FloatField(default=0.0, blank=True, null=True, verbose_name='\u0648\u0632\u0646 (kg)')
    breaking_load = models.FloatField(default=0.0, blank=True, null=True, verbose_name='\u0628\u0627\u0631 \u0634\u06a9\u0633\u062a (kg/cm2)')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='\u062a\u0627\u0631\u06cc\u062e \u0633\u0627\u062e\u062a')
    completed_at = models.DateTimeField(blank=True, null=True, verbose_name='\u062a\u0627\u0631\u06cc\u062e \u0627\u0646\u062c\u0627\u0645')
    deadline = models.DateTimeField(verbose_name='\u0645\u0648\u0639\u062f \u0622\u0632\u0645\u0648\u0646')

    sample_identifier = models.CharField(max_length=100, verbose_name='\u0634\u0646\u0627\u0633\u0647 \u0642\u0627\u0644\u0628')
    extra_data = models.JSONField(default=dict, blank=True, verbose_name='\u062f\u0627\u062f\u0647\u0647\u0627\u06cc \u0627\u0641\u0632\u0648\u062f\u0647')

    # Status and priority
    status = models.CharField(
        max_length=20, choices=MOLD_STATUS_CHOICES,
        default='pending', verbose_name='\u0648\u0636\u0639\u06cc\u062a',
    )
    priority = models.CharField(
        max_length=20, choices=MOLD_PRIORITY_CHOICES,
        default='medium', verbose_name='\u0627\u0648\u0641\u0648\u06cc\u062a',
    )

    # Technician assignment
    technician = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_molds', verbose_name='\u062a\u06a9\u0646\u06cc\u0633\u06cc\u0646',
    )

    # Test result fields
    failure_type = models.CharField(max_length=200, blank=True, verbose_name='\u0646\u0648\u0639 \u0634\u06a9\u0633\u062a')
    test_notes = models.TextField(blank=True, verbose_name='\u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u062a \u0622\u0632\u0645\u0648\u0646')

    pre_break_image = models.ImageField(
        upload_to='molds/pre_break/', blank=True, null=True,
        verbose_name='\u0639\u06a9\u0633 \u0642\u0628\u0644 \u0634\u06a9\u0633\u062a', validators=[validate_image_file],
    )
    post_break_image = models.ImageField(
        upload_to='molds/post_break/', blank=True, null=True,
        verbose_name='\u0639\u06a9\u0633 \u0628\u0631\u062f \u0634\u06a9\u0633\u062a', validators=[validate_image_file],
    )

    class Meta:
        verbose_name = '\u0642\u0627\u0644\u0628'
        verbose_name_plural = '\u0642\u0627\u0644\u0628\u200c\u0647\u0627'
        ordering = ['deadline']
        indexes = [
            models.Index(fields=['pour_series', 'age_in_days']),
            models.Index(fields=['pour_series__structural_member', 'age_in_days']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['deadline']),
            models.Index(fields=['technician']),
        ]

    def __str__(self) -> str:
        return f'\u0642\u0627\u0644\u0628 {self.sample_identifier}'

    @property
    def is_done(self) -> bool:
        return self.breaking_load is not None and self.breaking_load > 0
    
    @property
    def is_overdue(self) -> bool:
        return self.deadline < timezone.now() and not self.is_done
    
    @property
    def is_due_today(self) -> bool:
        return self.deadline.date() == timezone.now().date() and not self.is_done
    
    @property
    def is_due_tomorrow(self) -> bool:
        return self.deadline.date() == (timezone.now() + timezone.timedelta(days=1)).date() and not self.is_done
