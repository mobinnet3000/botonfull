# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    TransactionViewSet, LabProfileViewSet, ProjectViewSet, SampleViewSet,
    SamplingSeriesViewSet, SamplingSeriesPhotoViewSet, MoldViewSet,
    TicketViewSet, TicketMessageViewSet,
    UserRegistrationView, FullUserDataView
)

router = DefaultRouter()
router.register(r'profiles', LabProfileViewSet, basename='profiles')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'samples', SampleViewSet, basename='samples')
router.register(r'series', SamplingSeriesViewSet, basename='series')
router.register(r'series-photos', SamplingSeriesPhotoViewSet, basename='series-photos')
router.register(r'molds', MoldViewSet, basename='molds')
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'tickets', TicketViewSet, basename='tickets')
router.register(r'ticket-messages', TicketMessageViewSet, basename='ticket-messages')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'),
    path('full-data/', FullUserDataView.as_view(), name='full-data'),
]
