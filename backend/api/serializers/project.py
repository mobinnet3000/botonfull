from rest_framework import serializers

from api.models import Project
from api.services.project_service import ProjectService
from api.serializers.sample import SampleReadSerializer
from api.serializers.transaction import TransactionSerializer


class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'code', 'created_at', 'updated_at',
            'file_number', 'project_name',
            'client_name', 'client_phone_number',
            'supervisor_name', 'supervisor_phone_number',
            'requester_name', 'requester_phone_number',
            'municipality_zone', 'address',
            'project_usage_type', 'floor_count',
            'test_type',
            'occupied_area', 'contract_price',
            'client', 'contractor_name', 'consultant_name', 'description',
            'contract_number', 'start_date', 'end_date',
            'status', 'priority', 'responsible_engineer', 'notes',
            'client_user', 'supervisor_user', 'factory',
            'created_by',
        ]
        read_only_fields = ('owner', 'code', 'created_at', 'updated_at', 'created_by')

    def create(self, validated_data):
        request = self.context.get('request')
        owner = validated_data.pop('owner', None)
        created_by = request.user if request and request.user.is_authenticated else None
        return ProjectService.create_project(validated_data, owner, created_by=created_by)


class ProjectReadSerializer(ProjectWriteSerializer):
    samples = SampleReadSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    factory_name = serializers.CharField(source='factory.name', read_only=True, default=None)
    client_company = serializers.CharField(source='client.name', read_only=True, default=None)

    total_income = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta(ProjectWriteSerializer.Meta):
        fields = ProjectWriteSerializer.Meta.fields + [
            'status_display', 'priority_display', 'factory_name', 'client_company',
            'samples', 'transactions',
            'total_income', 'total_expense', 'balance',
        ]

    @staticmethod
    def get_total_income(obj: Project) -> float:
        return float(getattr(obj, 'total_income', None) or 0)

    @staticmethod
    def get_total_expense(obj: Project) -> float:
        return float(getattr(obj, 'total_expense', None) or 0)

    def get_balance(self, obj: Project) -> float:
        return self.get_total_income(obj) - self.get_total_expense(obj)
