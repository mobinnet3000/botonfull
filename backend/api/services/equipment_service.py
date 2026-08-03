from datetime import timedelta

from django.utils import timezone

from api.models import Equipment


class EquipmentService:

    @staticmethod
    def validate_usable(equipment: Equipment) -> None:
        """جلوگیری از استفاده از دستگاه منقضی/نامعتبر."""
        from rest_framework.exceptions import ValidationError
        if equipment is None:
            return
        if equipment.status != 'active':
            raise ValidationError({'machine': f'دستگاه {equipment.name} فعال نیست.'})
        if equipment.is_calibration_expired:
            raise ValidationError({
                'machine': f'کالیبراسیون دستگاه {equipment.name} منقضی شده است.'
            })

    @staticmethod
    def notify_calibration_due(within_days=14):
        from api.roles import ADMIN, LAB_MANAGER
        from django.contrib.auth.models import User
        from api.services.notification_service import NotificationService

        today = timezone.now().date()
        for eq in Equipment.objects.filter(
            status='active', next_calibration_date__lte=today + timedelta(days=within_days),
        ):
            targets = User.objects.filter(
                profile__role__in=[ADMIN, LAB_MANAGER],
            )
            for user in targets:
                NotificationService.notify(
                    user, 'equipment_calibration',
                    f'کالیبراسیون دستگاه {eq.name} نزدیک است',
                    f'تاریخ کالیبراسیون بعدی: {eq.next_calibration_date}',
                )
