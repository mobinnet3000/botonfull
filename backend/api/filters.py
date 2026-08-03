import django_filters
from django.db import models
from api.models import Project, Sample, Mold, Transaction, Ticket, LabRequest, TestExecution, Report


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
    class Meta:
        model = Mold
        fields = {
            'age_in_days': ['exact', 'gte', 'lte'],
            'breaking_load': ['isnull'],
            'deadline': ['gte', 'lte'],
        }


class TransactionFilter(django_filters.FilterSet):
    class Meta:
        model = Transaction
        fields = {
            'type': ['exact'],
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
