# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from api.views import (
    TransactionViewSet, LabProfileViewSet, ProjectViewSet, SampleViewSet,
    SamplingSeriesViewSet, SamplingSeriesPhotoViewSet, MoldViewSet,
    StructuralMemberViewSet, PourSeriesViewSet,
    TicketViewSet, TicketMessageViewSet,
    UserRegistrationView, FullUserDataView,
    FactoryViewSet, ClientViewSet,
    SampleTypeViewSet, TestTypeViewSet, AcceptanceCriteriaViewSet,
    LabRequestViewSet, TestExecutionViewSet,
    EquipmentViewSet, MaintenanceRecordViewSet,
    CuringTankViewSet, CuringRecordViewSet,
    ReportViewSet, NotificationViewSet,
    AppFileViewSet, ActivityLogViewSet, AdminUserViewSet,
    DashboardView, QcAnalysisView,
)

router = DefaultRouter()
router.register(r'profiles', LabProfileViewSet, basename='profiles')
router.register(r'factories', FactoryViewSet, basename='factories')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'samples', SampleViewSet, basename='samples')
router.register(r'sample-types', SampleTypeViewSet, basename='sample-types')
router.register(r'test-types', TestTypeViewSet, basename='test-types')
router.register(r'series', SamplingSeriesViewSet, basename='series')
router.register(r'series-photos', SamplingSeriesPhotoViewSet, basename='series-photos')
router.register(r'molds', MoldViewSet, basename='molds')
router.register(r'structural-members', StructuralMemberViewSet, basename='structural-members')
router.register(r'pour-series', PourSeriesViewSet, basename='pour-series')
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'tickets', TicketViewSet, basename='tickets')
router.register(r'ticket-messages', TicketMessageViewSet, basename='ticket-messages')
router.register(r'lab-requests', LabRequestViewSet, basename='lab-requests')
router.register(r'test-executions', TestExecutionViewSet, basename='test-executions')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'maintenance-records', MaintenanceRecordViewSet, basename='maintenance-records')
router.register(r'curing-tanks', CuringTankViewSet, basename='curing-tanks')
router.register(r'curing-records', CuringRecordViewSet, basename='curing-records')
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'acceptance-criteria', AcceptanceCriteriaViewSet, basename='acceptance-criteria')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'files', AppFileViewSet, basename='files')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')
router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'),
    path('full-data/', FullUserDataView.as_view(), name='full-data'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('qc/analysis/', QcAnalysisView.as_view(), name='qc-analysis'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
