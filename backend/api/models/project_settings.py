from django.db import models
import json


class ProjectSettings(models.Model):
    """
    Project-specific settings for mold creation, naming, and defaults.
    """
    project = models.OneToOneField(
        'Project', on_delete=models.CASCADE, related_name='settings',
        db_index=True,
        verbose_name='7e31489847',
    )
    
    # Default mold ages (e.g., [7, 14, 28])
    default_mold_ages = models.JSONField(
        default=list, blank=True,
        verbose_name='3346cc 2e482fcc 4227442847cc 2f484434',
    )
    
    # Default number of molds per age
    default_mold_count = models.IntegerField(
        default=1,
        verbose_name='2a342f 2e482fcc 42274428 283127cc 3346',
    )
    
    # Naming rules
    pour_name_prefix = models.CharField(
        max_length=50, default='Truck',
        verbose_name='7ecc342734 462745 31cc34',
    )
    member_name_prefix = models.CharField(
        max_length=50, default='Member',
        verbose_name='7ecc342734 462745 393648',
    )
    
    # Numbering rules
    use_auto_numbering = models.BooleanField(
        default=True,
        verbose_name='27332a41272f47 2e482fcc 34453131cc',
    )
    next_pour_number = models.IntegerField(
        default=1,
        verbose_name='3445273147 2839cc 31cc34',
    )
    next_member_number = models.IntegerField(
        default=1,
        verbose_name='3445273147 2839cc 393648',
    )
    
    # Custom mold age labels
    custom_age_labels = models.JSONField(
        default=dict, blank=True,
        verbose_name='22334527cc 3346cc 2e482fcc 33453832',
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='2a2731cc2e 33272e2a')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='222e31cc46 283148323827')

    class Meta:
        verbose_name = '2a4638cc45272a 7e31489847'
        verbose_name_plural = '2a4638cc45272a2a 7e314898474727'
        indexes = [
            models.Index(fields=['project']),
        ]

    def get_default_mold_ages(self) -> list[int]:
        """Get default mold ages as a list of integers."""
        ages = self.default_mold_ages
        if isinstance(ages, str):
            try:
                ages = json.loads(ages)
            except (json.JSONDecodeError, TypeError):
                ages = [7, 14, 28]
        if not isinstance(ages, list):
            return [7, 14, 28]
        return [int(age) for age in ages if isinstance(age, (int, float)) and age > 0]
    
    def get_age_label(self, age: int) -> str:
        """Get custom label for a mold age, or default."""
        custom = self.custom_age_labels
        if isinstance(custom, str):
            try:
                custom = json.loads(custom)
            except (json.JSONDecodeError, TypeError):
                custom = {}
        return custom.get(str(age), f'2232454846 {age} 31483247')
    
    def __str__(self) -> str:
        return f'2a4638cc45272a {self.project.project_name}'
