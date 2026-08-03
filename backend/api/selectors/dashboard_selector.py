from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from api.access import scope_projects, scope_by_project, scope_lab_catalog
from api.models import (
    Project, Sample, TestExecution, Report, Equipment, Notification, CuringTank,
)


class DashboardSelector:
    """آمار داشبورد بر اساس محدوده دسترسی کاربر."""

    @staticmethod
    def stats(user) -> dict:
        projects = scope_projects(user)
        samples = scope_by_project(user, Sample.objects.all(), 'project')
        tests = scope_by_project(
            user, TestExecution.objects.all(), 'sample__project',
        )
        reports = scope_by_project(user, Report.objects.all(), 'project')
        equipment = scope_lab_catalog(user, Equipment.objects.all())
        today = timezone.now()
        start_of_today = today.replace(hour=0, minute=0, second=0, microsecond=0)

        late_tests = tests.filter(
            status__in=['planned', 'in_progress'],
            lab_request__due_date__lt=today,
        ).count()

        return {
            'projects': {
                'total': projects.count(),
                'active': projects.filter(status='active').count(),
                'completed': projects.filter(status='completed').count(),
            },
            'samples': {
                'total': samples.count(),
                'today': samples.filter(date__gte=start_of_today).count(),
                'waiting': samples.filter(status__in=['waiting', 'stored', 'curing', 'ready_for_test']).count(),
                'completed': samples.filter(status__in=['completed', 'reported']).count(),
            },
            'tests': {
                'today': tests.filter(start_time__gte=start_of_today).count(),
                'pending': tests.filter(status__in=['planned', 'in_progress']).count(),
                'completed': tests.filter(status='completed').count(),
                'late': late_tests,
            },
            'reports': {
                'draft': reports.filter(status='draft').count(),
                'reviewed': reports.filter(status='reviewed').count(),
                'approved': reports.filter(status='approved').count(),
            },
            'equipment': {
                'active': equipment.filter(status='active').count(),
                'calibration_due': equipment.filter(
                    status='active', next_calibration_date__lte=today.date() + timedelta(days=14),
                ).count(),
            },
            'curing_tanks': {
                'total': scope_lab_catalog(user, CuringTank.objects.all()).count(),
            },
            'notifications': {
                'unread': Notification.objects.filter(user=user, is_read=False).count(),
            },
            'activity': {
                'monthly_tests': tests.filter(start_time__gte=today - timedelta(days=30)).count(),
                'monthly_samples': samples.filter(date__gte=today - timedelta(days=30)).count(),
            },
        }
