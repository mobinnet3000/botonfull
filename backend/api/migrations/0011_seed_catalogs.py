from django.db import migrations

SAMPLE_TYPES = [
    ('cube', 'مکعب بتنی'),
    ('cylinder', 'استوانه بتنی'),
    ('core', 'مغزه بتنی'),
    ('mortar', 'ملات'),
    ('cement', 'سیمان'),
    ('aggregate', 'مصالح سنگی'),
    ('water', 'آب'),
    ('soil', 'خاک'),
    ('steel', 'فولاد'),
    ('asphalt', 'آسفالت'),
    ('custom', 'سفارشی'),
]

TEST_TYPES = [
    ('compression', 'آزمون فشاری', 'concrete'),
    ('flexural', 'آزمون خمشی', 'concrete'),
    ('splitting_tensile', 'آزمون کششی دو نیمه', 'concrete'),
    ('slump', 'اسلامپ', 'concrete'),
    ('density', 'چگالی', 'concrete'),
    ('water_absorption', 'جذب آب', 'aggregate'),
    ('permeability', 'نفوذپذیری', 'concrete'),
    ('rebound_hammer', 'چکش اشمیت', 'concrete'),
    ('upv', 'سرعت پالس اولتراسونیک', 'concrete'),
    ('sieve_analysis', 'دانه‌بندی', 'aggregate'),
    ('specific_gravity', 'وزن مخصوص', 'aggregate'),
    ('moisture_content', 'درصد رطوبت', 'aggregate'),
    ('cement_test', 'آزمون سیمان', 'cement'),
    ('steel_test', 'آزمون فولاد', 'steel'),
]


def seed_catalogs(apps, schema_editor):
    SampleType = apps.get_model('api', 'SampleType')
    TestType = apps.get_model('api', 'TestType')
    for code, name in SAMPLE_TYPES:
        SampleType.objects.get_or_create(code=code, defaults={'name': name})
    for code, name, category in TEST_TYPES:
        TestType.objects.get_or_create(code=code, defaults={'name': name, 'category': category})


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_backfill_profiles'),
    ]

    operations = [
        migrations.RunPython(seed_catalogs, migrations.RunPython.noop),
    ]
