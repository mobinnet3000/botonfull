from django.db import models

TEST_TYPE_CATEGORY_CHOICES = [
    ('concrete', 'بتن'),
    ('cement', 'سیمان'),
    ('aggregate', 'مصالح سنگی'),
    ('water', 'آب'),
    ('soil', 'خاک'),
    ('steel', 'فولاد'),
    ('asphalt', 'آسفالت'),
    ('general', 'عمومی'),
]

TEST_TYPE_CHOICES_CATALOG = [
    ('compression', 'فشاری'),
    ('flexural', 'خمشی'),
    ('splitting_tensile', 'کششی دو نیمه'),
    ('slump', 'اسلامپ'),
    ('density', 'چگالی'),
    ('water_absorption', 'جذب آب'),
    ('permeability', 'نفوذپذیری'),
    ('rebound_hammer', 'چکش اشمیت'),
    ('upv', 'سرعت پالس اولتراسونیک'),
    ('sieve_analysis', 'دانه‌بندی'),
    ('specific_gravity', 'وزن مخصوص'),
    ('moisture_content', 'رطوبت'),
    ('cement_test', 'آزمون سیمان'),
    ('steel_test', 'آزمون فولاد'),
    ('custom', 'سفارشی'),
]


class TestType(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='کد آزمون')
    name = models.CharField(max_length=200, verbose_name='نام آزمون')
    category = models.CharField(
        max_length=20, choices=TEST_TYPE_CATEGORY_CHOICES,
        default='concrete', verbose_name='دسته',
    )
    unit = models.CharField(max_length=50, blank=True, verbose_name='واحد')
    method_reference = models.CharField(max_length=200, blank=True, verbose_name='مرجع روش آزمون')
    params_schema = models.JSONField(default=list, blank=True, verbose_name='پارامترهای اندازه‌گیری')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'نوع آزمون'
        verbose_name_plural = 'انواع آزمون'
        ordering = ['category', 'name']

    def __str__(self) -> str:
        return f'{self.name} ({self.get_category_display()})'


class AcceptanceCriteria(models.Model):
    name = models.CharField(max_length=200, verbose_name='نام معیار')
    test_type = models.ForeignKey(
        TestType, on_delete=models.CASCADE, related_name='criteria',
        null=True, blank=True, verbose_name='نوع آزمون',
    )
    standard_name = models.CharField(max_length=200, blank=True, verbose_name='استاندارد')
    params = models.JSONField(default=dict, blank=True, verbose_name='پارامترها')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'معیار پذیرش'
        verbose_name_plural = 'معیارهای پذیرش'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
