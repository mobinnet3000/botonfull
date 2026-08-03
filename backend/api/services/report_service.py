from django.db import transaction
from django.utils import timezone

from api.models import Report, ReportRevision, TestExecution
from api.services.notification_service import NotificationService


class ReportService:

    @staticmethod
    def _revision(instance: Report, changed_by, notes=''):
        ReportRevision.objects.create(
            report=instance,
            version=instance.version,
            content=instance.content,
            changed_by=changed_by,
            notes=notes,
        )

    @staticmethod
    @transaction.atomic
    def update_report(instance: Report, validated_data: dict, user) -> Report:
        changed_fields = set(validated_data.keys()) - {'content'}
        if 'content' in validated_data and validated_data['content'] != instance.content:
            changed_fields.add('content')

        if 'status' in validated_data and validated_data['status'] != instance.status:
            status = validated_data['status']
            if status in ('reviewed', 'approved', 'rejected'):
                instance.reviewed_by = user
                instance.reviewed_at = timezone.now()
                if status == 'approved':
                    instance.approved_by = user
                    instance.approved_at = timezone.now()
                    instance.digital_signature = {
                        'signed_by': user.username,
                        'signed_at': timezone.now().isoformat(),
                    }
                elif status == 'reviewed':
                    instance.approved_by = None
                    instance.approved_at = None

        if changed_fields:
            ReportService._revision(instance, user, notes='بروزرسانی گزارش')
            instance.version += 1

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        NotificationService.notify_report_status(instance)
        return instance

    @staticmethod
    def approve_test(test: TestExecution, user) -> TestExecution:
        test.result_status = 'approved'
        test.approved_by = user
        test.approved_at = timezone.now()
        test.save(update_fields=['result_status', 'approved_by', 'approved_at'])
        if test.sample.status not in ('reported', 'completed'):
            test.sample.status = 'reported'
            test.sample.save(update_fields=['status'])
        return test
