from rest_framework import viewsets

from api.models import Transaction
from api.serializers import TransactionSerializer
from api.access import scope_by_project
from api.roles import ADMIN, LAB_MANAGER
from api.filters import TransactionFilter
from api.views.base import ScopedModelViewSet


class TransactionViewSet(ScopedModelViewSet):
    write_roles = (ADMIN, LAB_MANAGER)
    serializer_class = TransactionSerializer
    filterset_class = TransactionFilter
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        return scope_by_project(
            self.request.user,
            Transaction.objects.select_related('project'),
            'project',
        )
