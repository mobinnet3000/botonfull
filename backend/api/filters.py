import django_filters
from django.db import models
from django.utils import timezone
from api.models import Project, Sample, Mold, Transaction, Ticket, LabRequest, TestExecution, Report, StructuralMember, PourSeries


class ProjectFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Project
        fields = {
            'test_type': ['exact'],
            'project_usage_type': ['exact'],
            'municipality_zone': ['exact'],
            'created_at': ['gte', 'lte'],
            'floor_count': ['gte', 'lte'],
            'project_name': ['icontains'],
            'file_number': ['exact'],
            'client_name': ['icontains'],
        }

    @staticmethod
    def filter_search(queryset, name, value):
        return queryset.filter(
            models.Q(project_name__icontains=value) |
            models.Q(file_number__icontains=value) |
            models.Q(client_name__icontains=value) |
            models.Q(address__icontains=value)
        )


class SampleFilter(django_filters.FilterSet):
    class Meta:
        model = Sample
        fields = {
            'category': ['exact', 'icontains'],
            'cement_grade': ['exact'],
            'specimen_type': ['exact'],
            'date': ['gte', 'lte'],
        }


class MoldFilter(django_filters.FilterSet):
    project = django_filters.NumberFilter(field_name='pour_series__structural_member__project', lookup_expr='exact')
    member = django_filters.NumberFilter(field_name='pour_series__structural_member', lookup_expr='exact')
    pour = django_filters.NumberFilter(field_name='pour_series', lookup_expr='exact')
    technician = django_filters.NumberFilter(field_name='technician', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='exact')
    is_done = django_filters.BooleanFilter(method='filter_is_done')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')

    class Meta:
        model = Mold
        fields = {
            'age_in_days': ['exact', 'gte', 'lte'],
            'breaking_load': ['isnull'],
            'deadline': ['gte', 'lte'],
        }

    @staticmethod
    def filter_is_done(queryset, name, value):
        done = models.Q(status__in=['completed', 'rejected']) | models.Q(breaking_load__gt=0)
        return queryset.filter(done) if value else queryset.exclude(done)

    @staticmethod
    def filter_is_overdue(queryset, name, value):
        overdue = models.Q(deadline__lt=timezone.now()) & ~models.Q(status__in=['completed', 'rejected'])
        return queryset.filter(overdue) if value else queryset.exclude(overdue)


class TransactionFilter(django_filters.FilterSet):
    class Meta:
        model = Transaction
        fields = {
            'type': ['exact'],
            'category': ['exact'],
            'method': ['exact'],
            'is_settled': ['exact'],
            'date': ['gte', 'lte'],
            'amount': ['gte', 'lte'],
        }


class TicketFilter(django_filters.FilterSet):
    class Meta:
        model = Ticket
        fields = {
            'status': ['exact'],
            'priority': ['exact'],
        }


class LabRequestFilter(django_filters.FilterSet):
    class Meta:
        model = LabRequest
        fields = {
            'status': ['exact'],
            'priority': ['exact'],
            'project': ['exact'],
            'due_date': ['gte', 'lte'],
            'requested_tests': ['exact'],
        }


class TestExecutionFilter(django_filters.FilterSet):
    class Meta:
        model = TestExecution
        fields = {
            'status': ['exact'],
            'result_status': ['exact'],
            'test_type': ['exact'],
            'machine': ['exact'],
            'start_time': ['gte', 'lte'],
            'result': ['gte', 'lte'],
        }


class ReportFilter(django_filters.FilterSet):
    class Meta:
        model = Report
        fields = {
            'status': ['exact'],
            'project': ['exact'],
            'sample': ['exact'],
            'created_at': ['gte', 'lte'],
        }


class StructuralMemberFilter(django_filters.FilterSet):
    project = django_filters.NumberFilter(field_name='project', lookup_expr='exact')
    member_type = django_filters.CharFilter(field_name='member_type', lookup_expr='exact')

    class Meta:
        model = StructuralMember
        fields = ['project', 'member_type']


class PourSeriesFilter(django_filters.FilterSet):
    structural_member = django_filters.NumberFilter(field_name='structural_member', lookup_expr='exact')
    project = django_filters.NumberFilter(field_name='structural_member__project', lookup_expr='exact')
    member_type = django_filters.CharFilter(field_name='structural_member__member_type', lookup_expr='exact')

    class Meta:
        model = PourSeries
        fields = ['structural_member', 'project', 'member_type']