import os

from core.settings.base import *  # noqa

os.makedirs(BASE_DIR / 'logs', exist_ok=True)  # noqa

DEBUG = False

ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', cast=Csv())  # noqa

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin for origin in config('DJANGO_CORS_ALLOWED_ORIGINS', default='', cast=Csv())
    if origin != '*' and origin.startswith(('http://', 'https://'))
]  # noqa

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

CSRF_TRUSTED_ORIGINS = config('DJANGO_CSRF_TRUSTED_ORIGINS', default='', cast=Csv())  # noqa

INSTALLED_APPS.insert(0, 'whitenoise.runserver_nostatic')  # noqa
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # noqa

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',  # noqa
            'maxBytes': 10485760,
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': config('DJANGO_LOG_LEVEL', default='WARNING'),  # noqa
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': config('DJANGO_LOG_LEVEL', default='WARNING'),  # noqa
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': config('DJANGO_LOG_LEVEL', default='WARNING'),  # noqa
            'propagate': False,
        },
    },
}
