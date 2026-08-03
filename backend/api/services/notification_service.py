from api.models import Notification


class NotificationService:

    @staticmethod
    def notify(user, ntype, title, message='', link=''):
        if user is None:
            return
        Notification.objects.create(
            user=user, ntype=ntype, title=title, message=message, link=link,
        )

    @staticmethod
    def notify_sample_ready(sample):
        targets = [sample.technician, sample.responsible_engineer, sample.created_by]
        if sample.project.owner:
            targets.append(sample.project.owner.user)
        for user in targets:
            if user:
                NotificationService.notify(
                    user, 'sample_ready', f'نمونه {sample.code} آماده آزمون است',
                    f'پروژه: {sample.project.project_name}', link=f'/samples/{sample.id}/',
                )

    @staticmethod
    def notify_report_status(report):
        if report.created_by:
            NotificationService.notify(
                report.created_by, 'report_approved' if report.status == 'approved' else 'general',
                f'گزارش {report.report_number} {report.get_status_display()} شد',
                report.title, link=f'/reports/{report.id}/',
            )
