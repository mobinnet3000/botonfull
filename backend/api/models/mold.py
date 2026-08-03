from django.db import models
from api.validators import validate_image_file


class Mold(models.Model):
    series = models.ForeignKey(
        'SamplingSeries', related_name='molds', on_delete=models.CASCADE,
        db_index=True,
    )
    age_in_days = models.IntegerField()

    mass = models.FloatField(default=0.0, blank=True, null=True)
    breaking_load = models.FloatField(default=0.0, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    deadline = models.DateTimeField()

    sample_identifier = models.CharField(max_length=100)
    extra_data = models.JSONField(default=dict, blank=True)

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
            models.Index(fields=['series', 'age_in_days']),
        ]

    def __str__(self) -> str:
        return f'قالب {self.sample_identifier}'

    @property
    def is_done(self) -> bool:
        return self.breaking_load is not None and self.breaking_load > 0
