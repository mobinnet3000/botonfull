from core.settings.base import *  # noqa

DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)  # noqa

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
