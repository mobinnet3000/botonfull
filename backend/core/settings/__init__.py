from decouple import config
import os

ENVIRONMENT = config('DJANGO_ENV', default='development')

if ENVIRONMENT == 'production':
    from core.settings.production import *  # noqa
else:
    from core.settings.development import *  # noqa
