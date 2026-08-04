from django.contrib.auth.models import User
from django.db.models import Prefetch

from api.access import scope_projects
from api.models import Project, Sample, SamplingSeries, Mold, Transaction, Ticket, TestExecution


class FullDataSelector:

    @staticmethod
    def get_full_user_data(user: User) -> dict:
        projects = (
            scope_projects(user)
            .with_financials()
            .select_related('owner')
            .prefetch_related(
                Prefetch(
                    'samples',
                    queryset=Sample.objects.prefetch_related(
                        Prefetch(
                            'series',
                            queryset=SamplingSeries.objects.prefetch_related(
                                Prefetch('molds', queryset=Mold.objects.only(
                                    'id', 'series', 'age_in_days', 'mass',
                                    'breaking_load', 'created_at', 'completed_at',
                                    'deadline', 'sample_identifier', 'extra_data',
                                    'pre_break_image', 'post_break_image',
                                )),
                                'photos',
                            ).only(
                                'id', 'sample', 'name', 'concrete_temperature',
                                'concrete_temperature_image', 'slump', 'slump_image',
                                'axis', 'has_additive',
                            ),
                        ),
                        Prefetch(
                            'test_executions',
                            queryset=TestExecution.objects.select_related('test_type', 'machine'),
                        ),
                    ).only(
                        'id', 'project', 'code', 'barcode', 'qr_token', 'date',
                        'casting_date', 'sampling_date', 'receiving_date',
                        'status', 'current_location', 'sampling_volume',
                        'cement_grade', 'cement_type', 'category',
                        'weather_condition', 'ambient_temperature',
                        'concrete_factory', 'specimen_type', 'specimen_size',
                        'sampling_location', 'concrete_production_method',
                        'sample_type', 'weight', 'dimensions', 'description',
                        'technician', 'responsible_engineer', 'received_by',
                    ),
                ),
                Prefetch(
                    'transactions',
                    queryset=Transaction.objects.all(),
                ),
            )
            .only(
                'id', 'owner', 'code', 'created_at', 'updated_at',
                'file_number', 'project_name',
                'client_name', 'client_phone_number',
                'supervisor_name', 'supervisor_phone_number',
                'requester_name', 'requester_phone_number',
                'municipality_zone', 'address', 'project_usage_type',
                'floor_count', 'occupied_area',
                'contract_price', 'test_type',
                'client', 'contractor_name', 'consultant_name', 'description',
                'contract_number', 'start_date', 'end_date',
                'status', 'priority', 'responsible_engineer', 'notes',
                'client_user', 'supervisor_user', 'factory',
            )
        )

        tickets = Ticket.objects.filter(user=user).prefetch_related('messages')

        return {
            'user': user,
            'projects': projects,
            'tickets': tickets,
        }
