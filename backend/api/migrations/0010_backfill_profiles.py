from django.db import migrations
from django.contrib.auth.models import User

from api.roles import ADMIN, CLIENT, LAB_MANAGER


def backfill_profiles(apps, schema_editor):
    Profile = apps.get_model('api', 'Profile')
    users = User.objects.select_related('lab_profile').all()
    for user in users:
        role = CLIENT
        lab = None
        if user.is_superuser:
            role = ADMIN
        elif hasattr(user, 'lab_profile') and user.lab_profile_id:
            role = LAB_MANAGER
            lab = user.lab_profile
        Profile.objects.get_or_create(user_id=user.id, defaults={'role': role, 'lab': lab})


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_acceptancecriteria_curingtank_labrequest_and_more'),
    ]

    operations = [
        migrations.RunPython(backfill_profiles, migrations.RunPython.noop),
    ]
