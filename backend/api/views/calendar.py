from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from api.access import scope_by_project
from api.models import Mold, PourSeries, Project
from api.serializers import MoldSerializer


class CalendarScheduleView(APIView):
    """برنامه‌ی روزانه‌ی قالب‌ها برای تقویم (ورک‌اسپیس تکنسین).

    GET /api/calendar/schedule/?from=YYYY-MM-DD&to=YYYY-MM-DD
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now()
        date_from = request.query_params.get('from')
        date_to = request.query_params.get('to')

        try:
            start = datetime.fromisoformat(date_from).replace(tzinfo=timezone.get_current_timezone()) if date_from else today - timedelta(days=7)
            end = datetime.fromisoformat(date_to).replace(tzinfo=timezone.get_current_timezone()) if date_to else today + timedelta(days=30)
        except ValueError:
            return Response({'detail': 'قالب تاریخ معتبر نیست.'}, status=400)

        if (end - start) > timedelta(days=92):
            end = start + timedelta(days=92)

        molds = (
            scope_by_project(
                request.user,
                Mold.objects.select_related(
                    'pour_series__structural_member__project', 'technician',
                ),
                'pour_series__structural_member__project',
            )
            .filter(deadline__date__gte=start.date(), deadline__date__lte=end.date())
            .order_by('deadline')
        )

        mold_serializer = MoldSerializer(molds, many=True, context={'request': request})

        days: dict[str, dict] = {}
        stats = {
            'total': 0, 'overdue': 0, 'today': 0, 'pending': 0,
            'completed': 0, 'rejected': 0, 'urgent': 0,
        }
        today_str = today.date().isoformat()

        for mold in molds:
            stats['total'] += 1
            if mold.priority == 'urgent' and not mold.is_done:
                stats['urgent'] += 1
            if mold.is_done:
                stats['completed' if mold.status == 'completed' else 'rejected'] += 1
                continue
            if mold.deadline.date() < today.date():
                stats['overdue'] += 1
            elif mold.deadline.date().isoformat() == today_str:
                stats['today'] += 1
            else:
                stats['pending'] += 1

            key = mold.deadline.date().isoformat()
            entry = days.setdefault(key, {'overdue': 0, 'today': 0, 'completed': 0, 'pending': 0, 'rejected': 0, 'urgent': 0, 'molds': []})
            day_status = mold.status
            if mold.is_done:
                entry['completed' if mold.status == 'completed' else 'rejected'] += 1
            elif mold.deadline.date() < today.date():
                entry['overdue'] += 1
                day_status = 'overdue'
            elif mold.deadline.date().isoformat() == today_str:
                entry['today'] += 1
            else:
                entry['pending'] += 1
            if mold.priority == 'urgent' and not mold.is_done:
                entry['urgent'] += 1
            entry['molds'].append(mold.id)

        pours = (
            scope_by_project(
                request.user,
                PourSeries.objects.select_related('structural_member__project'),
                'structural_member__project',
            )
            .filter(pour_date__date__gte=start.date(), pour_date__date__lte=end.date())
            .order_by('pour_date')
        )
        pour_list = [
            {
                'id': p.id,
                'name': p.name,
                'pour_date': p.pour_date.isoformat(),
                'member': p.structural_member.name,
                'member_type': p.structural_member.member_type,
                'project': p.structural_member.project.project_name,
                'project_id': p.structural_member.project_id,
            }
            for p in pours
        ]

        deadlines = list(
            scope_projects_qs(request.user)
            .filter(end_date__isnull=False, end_date__gte=start.date(), end_date__lte=end.date())
            .values('id', 'project_name', 'end_date')
        )
        for d in deadlines:
            d['end_date'] = d['end_date'].isoformat()

        return Response({
            'start': start.date().isoformat(),
            'end': end.date().isoformat(),
            'today': today_str,
            'days': days,
            'molds': mold_serializer.data,
            'stats': stats,
            'pours': pour_list,
            'deadlines': deadlines,
        })


def scope_projects_qs(user):
    from api.access import scope_projects
    return scope_projects(user, Project.objects.all())