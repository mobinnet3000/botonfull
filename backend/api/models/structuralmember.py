from django.db import models

MEMBER_TYPE_CHOICES = [
    ('foundation', 'فنداسیون'),
    ('column', 'ستون'),
    ('beam', 'تیر'),
    ('wall', 'دیوار'),
    ('slab', 'سقف'),
    ('stair', 'پله'),
    ('other', 'سایر'),
]


class StructuralMember(models.Model):
    project = models.ForeignKey(
        'Project', on_delete=models.CASCADE, related_name='structural_members',
        verbose_name='پروژه', db_index=True,
    )
    name = models.CharField(max_length=200, verbose_name='نام عضو سازه‌ای')
    member_type = models.CharField(
        max_length=20, choices=MEMBER_TYPE_CHOICES,
        default='other', verbose_name='نوع عضو',
    )
    description = models.TextField(blank=True, verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'عضو سازه‌ای'
        verbose_name_plural = 'اعضای سازه‌ای'
        ordering = ['name']
        indexes = [
            models.Index(fields=['project', 'name']),
            models.Index(fields=['project', 'member_type']),
        ]

    def __str__(self) -> str:
        return f'{self.name} ({self.get_member_type_display()})'