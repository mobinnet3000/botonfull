import logging

from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler as drf_exception_handler
from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        exc = APIException(str(exc))

    response = drf_exception_handler(exc, context)

    if response is not None:
        response.data = {
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': response.data,
            }
        }

    return response
