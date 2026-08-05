from django.db import models
from api.validators import validate_image_file


class PourSeries(models.Model):
    """
    Represents a concrete pour/batch/truck in a project.
    Each pour belongs to exactly one structural member.
    Each pour can have multiple molds with different ages.
    """
    structural_member = models.ForeignKey(
        'StructuralMember', on_delete=models.CASCADE, related_name='pour_series',
        db_index=True,
        verbose_name='393648 33273247cc27cc',
    )
    name = models.CharField(max_length=200, verbose_name='462745 31cc34 282a46')
    pour_date = models.DateTimeField(verbose_name='2a2731cc2e 31cc34')
    
    # Concrete properties
    concrete_temperature = models.FloatField(
        verbose_name='2f4527cc 282a46',
        default=0.0,
    )
    concrete_temperature_image = models.ImageField(
        upload_to='pours/concrete_temperature/', blank=True, null=True,
        validators=[validate_image_file],
        verbose_name='39a933 2f45272a4831 282a46',
    )
    slump = models.FloatField(verbose_name='27334427457e', default=0.0)
    slump_image = models.ImageField(
        upload_to='pours/slump/', blank=True, null=True,
        validators=[validate_image_file],
        verbose_name='39a933 27334427457e',
    )
    
    # Additional pour info
    axis = models.CharField(max_length=100, verbose_name='452d4831', blank=True)
    has_additive = models.BooleanField(default=False, verbose_name='2f27342a46 274132482f46cc')
    truck_number = models.CharField(max_length=100, verbose_name='3445273147 a92745cc46', blank=True)
    batch_number = models.CharField(max_length=100, verbose_name='3445273147 282a2f', blank=True)
    
    # Sample reference (for backward compatibility)
    sample = models.ForeignKey(
        'Sample', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='pour_series', verbose_name='4645484647',
    )
    
    notes = models.TextField(blank=True, verbose_name='cc2736272a2a')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='2a2731cc2e 33272e2a')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='222e31cc46 283148323827')

    class Meta:
        verbose_name = '31cc34 282a46'
        verbose_name_plural = '31cc344727cc 282a46'
        ordering = ['-pour_date']
        indexes = [
            models.Index(fields=['structural_member', 'pour_date']),
            models.Index(fields=['structural_member__project', 'pour_date']),
        ]

    def __str__(self) -> str:
        return f'{self.name} - {self.structural_member.name}'
