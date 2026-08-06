from django.db import models
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Project
from api.serializers import ProjectReadSerializer, ProjectWriteSerializer, ProjectSettingsSerializer
from api.access import scope_projects
from api.roles import ADMIN, LAB_MANAGER
from api.filters import ProjectFilter
from api.views.base import ScopedModelViewSet


class ProjectViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    filterset_class = ProjectFilter
    search_fields = ['project_name', 'file_number', 'client_name', 'address', 'code']
    ordering_fields = ['created_at', 'project_name', 'status', 'priority', 'contract_price']

    def get_queryset(self):
        qs = (
            scope_projects(self.request.user)
            .with_financials()
            .select_related('owner', 'client', 'factory')
            .prefetch_related(
                'settings',
                'structural_members__pour_series__molds',
                'transactions', 'lab_requests',
            )
        )

        if self.action == 'list':
            qs = qs.annotate(
                member_count=models.Count('structural_members', distinct=True),
                pour_count=models.Count('structural_members__pour_series', distinct=True),
                mold_count=models.Count('structural_members__pour_series__molds', distinct=True),
                tested_mold_count=models.Count(
                    'structural_members__pour_series__molds',
                    filter=models.Q(structural_members__pour_series__molds__status__in=['completed', 'rejected']),
                    distinct=True,
                ),
            )

        return qs

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProjectReadSerializer
        return ProjectWriteSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == 'retrieve':
            context['with_tree'] = True
        return context

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.lab_profile)

    @action(detail=True, methods=['patch'], url_path='settings')
    def update_settings(self, request, pk=None):
        """به‌روزرسانی تنظیمات پروژه (سن قالب‌ها، شماره‌گذاری خودکار و...)."""
        project = self.get_object()
        instance = getattr(project, 'settings', None)
        if instance is None:
            from api.models import ProjectSettings
            instance = ProjectSettings.objects.create(project=project)
        serializer = ProjectSettingsSerializer(instance, data=request.data, partial=True, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def accounting(self, request, pk=None):
        """گزارش سبک حسابداری پروژه: جمع‌ها، دسته‌بندی، تراز تجمعی و نمودار ماهانه."""
        from django.db.models import Sum, Q
        from datetime import timedelta
        from decimal import Decimal
        from api.models import Transaction

        project = self.get_object()
        transactions = list(
            project.transactions.all().order_by('date', 'id')
        )

        income = sum(t.amount for t in transactions if t.type == 'income' and t.is_settled)
        expense = sum(t.amount for t in transactions if t.type == 'expense')
        receivables = sum(t.amount for t in transactions if t.type == 'income' and not t.is_settled)

        running = []
        running_balance = Decimal('0.0')
        for t in transactions:
            delta = t.amount if t.type == 'income' else -t.amount
            running_balance += delta
            running.append({
                'id': t.id, 'type': t.type, 'amount': float(t.amount),
                'date': t.date.isoformat(), 'balance': float(round(running_balance, 2)),
            })

        categories: dict[str, dict] = {}
        for t in transactions:
            entry = categories.setdefault(t.category or 'سایر', {'income': 0.0, 'expense': 0.0})
            key = 'income' if t.type == 'income' else 'expense'
            entry[key] += float(t.amount)

        monthly: dict[str, dict] = {}
        for t in transactions:
            key = t.date.strftime('%Y-%m')
            entry = monthly.setdefault(key, {'income': 0.0, 'expense': 0.0})
            entry['income' if t.type == 'income' else 'expense'] += float(t.amount)

        return Response({
            'summary': {
                'total_income': round(income, 2),
                'total_expense': round(expense, 2),
                'receivables': round(receivables, 2),
                'received': round(income, 2),
                'balance': round(income - expense, 2),
                'profit': round(income - expense, 2),
                'transaction_count': len(transactions),
            },
            'running_balance': running,
            'categories': categories,
            'monthly': monthly,
        })

    def get_permissions(self):
        from api.permissions import RoleWritePermission
        return [permissions.IsAuthenticated(), RoleWritePermission(self.write_roles)]