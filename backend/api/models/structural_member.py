from django.db import models


STRUCTURAL_MEMBER_TYPE_CHOICES = [
    ('foundation', '41462f2733cc4846'),
    ('column', '332a4846'),
    ('beam', '2acc31'),
    ('wall', '2fcc482731'),
    ('slab', '334241'),
    ('stair', '7e4447'),
    ('other', '3327cc31'),
]


class StructuralMember(models.Model):
    """
    Represents structural members of a project (Foundation, Column, Beam, etc.)
    Each member can have multiple pour series (concrete pours).
    """
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='structural_members',
        db_index=True,
        verbose_name='7e31489847',
    )
    name = models.CharField(max_length=200, verbose_name='462745 393648 33273247cc27cc')
    member_type = models.CharField(
        max_length=20, choices=STRUCTURAL_MEMBER_TYPE_CHOICES,
        default='other', verbose_name='464839 393648',
    )
    description = models.TextField(blank=True, verbose_name='2a4836cc2d272a2a')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='2a2731cc2e 33272e2a')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='222e31cc46 28314832313827')

    class Meta:
        verbose_name = '393648 33273247cc27cc'
        verbose_name_plural = '3936484727cc 33273247cc27cc'
        ordering = ['name']
        indexes = [
            models.Index(fields=['project', 'name']),
            models.Index(fields=['project', 'member_type']),
        ]

    def __str__(self) -> str:
        return f'{self.name} ({self.get_member_type_display()})'
