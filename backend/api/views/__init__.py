from api.views.auth import UserRegistrationView, FullUserDataView
from api.views.lab_profile import LabProfileViewSet
from api.views.factory import FactoryViewSet
from api.views.client import ClientViewSet
from api.views.project import ProjectViewSet
from api.views.sample import SampleViewSet
from api.views.sampling_series import SamplingSeriesViewSet, SamplingSeriesPhotoViewSet
from api.views.mold import MoldViewSet
from api.views.structuralmember import StructuralMemberViewSet
from api.views.pourseries import PourSeriesViewSet
from api.views.transaction import TransactionViewSet
from api.views.ticket import TicketViewSet, TicketMessageViewSet
from api.views.catalog import SampleTypeViewSet, TestTypeViewSet, AcceptanceCriteriaViewSet
from api.views.lab_request import LabRequestViewSet
from api.views.test_execution import TestExecutionViewSet
from api.views.equipment import EquipmentViewSet, MaintenanceRecordViewSet
from api.views.curing import CuringTankViewSet, CuringRecordViewSet
from api.views.report import ReportViewSet
from api.views.notification import NotificationViewSet
from api.views.file import AppFileViewSet, ActivityLogViewSet
from api.views.admin import AdminUserViewSet
from api.views.dashboard import DashboardView, QcAnalysisView
from api.views.calendar import CalendarScheduleView

__all__ = [
    'UserRegistrationView',
    'FullUserDataView',
    'LabProfileViewSet',
    'FactoryViewSet',
    'ClientViewSet',
    'ProjectViewSet',
    'SampleViewSet',
    'SamplingSeriesViewSet',
    'SamplingSeriesPhotoViewSet',
    'MoldViewSet',
    'StructuralMemberViewSet',
    'PourSeriesViewSet',
    'TransactionViewSet',
    'TicketViewSet',
    'TicketMessageViewSet',
    'SampleTypeViewSet',
    'TestTypeViewSet',
    'AcceptanceCriteriaViewSet',
    'LabRequestViewSet',
    'TestExecutionViewSet',
    'EquipmentViewSet',
    'MaintenanceRecordViewSet',
    'CuringTankViewSet',
    'CuringRecordViewSet',
    'ReportViewSet',
    'NotificationViewSet',
    'AppFileViewSet',
    'ActivityLogViewSet',
    'AdminUserViewSet',
    'DashboardView',
    'QcAnalysisView',
    'CalendarScheduleView',
]
