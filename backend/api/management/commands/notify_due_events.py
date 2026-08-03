from django.core.management.base import BaseCommand

from api.services.equipment_service import EquipmentService


class Command(BaseCommand):
    help = 'ارسال اعلان‌های موعد (کالیبراسیون دستگاه‌ها)'

    def add_arguments(self, parser):
        parser.add_argument('--within-days', type=int, default=14)

    def handle(self, *args, **options):
        EquipmentService.notify_calibration_due(options['within_days'])
        self.stdout.write(self.style.SUCCESS('اعلان‌های کالیبراسیون ارسال شد.'))
