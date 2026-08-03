import getpass

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

from api.roles import ADMIN
from api.services.auth_service import ProfileService


class Command(BaseCommand):
    help = 'ایجاد کاربر مدیر سیستم (ادمین)'

    def add_arguments(self, parser):
        parser.add_argument('username')
        parser.add_argument('--email', default='')
        parser.add_argument('--password', default='')

    def handle(self, *args, **options):
        username = options['username']
        if User.objects.filter(username=username).exists():
            raise CommandError(f'User {username} already exists.')
        password = options['password'] or getpass.getpass('Password: ')
        email = options['email']
        user = User.objects.create_superuser(username=username, email=email, password=password)
        ProfileService.ensure_profile(user, role=ADMIN)
        self.stdout.write(self.style.SUCCESS(f'Admin user "{username}" created successfully.'))
