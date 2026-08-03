"""نقش‌ها و سطوح دسترسی سیستم مدیریت آزمایشگاه (LIMS)."""

ADMIN = 'admin'
LAB_MANAGER = 'lab_manager'
QUALITY_MANAGER = 'quality_manager'
ENGINEER = 'engineer'
TECHNICIAN = 'technician'
RECEPTION = 'reception'
CLIENT = 'client'
READONLY = 'readonly'
FACTORY_MANAGER = 'factory_manager'
SUPERVISOR = 'supervisor'

ROLE_CHOICES = [
    (ADMIN, 'مدیر سیستم'),
    (LAB_MANAGER, 'مدیر آزمایشگاه'),
    (QUALITY_MANAGER, 'مدیر کنترل کیفیت'),
    (ENGINEER, 'مهندس'),
    (TECHNICIAN, 'تکنسین'),
    (RECEPTION, 'پذیرش'),
    (CLIENT, 'مشتری'),
    (READONLY, 'فقط‌خواندنی'),
    (FACTORY_MANAGER, 'مدیر کارخانه'),
    (SUPERVISOR, 'ناظر'),
]

ROLE_LABELS = dict(ROLE_CHOICES)

DEFAULT_ROLE = CLIENT

#: نقش‌های وابسته به آزمایشگاه (اعضای آزمایشگاه)
LAB_ROLES = (LAB_MANAGER, QUALITY_MANAGER, ENGINEER, TECHNICIAN, RECEPTION)

#: نقش‌های مجاز برای نوشتن هر منبع (خارج از نقش ادمین)
CLIENT_WRITE = (LAB_MANAGER, RECEPTION)
PROJECT_WRITE = (LAB_MANAGER,)
SAMPLE_WRITE = (LAB_MANAGER, TECHNICIAN, RECEPTION)
SERIES_MOLD_WRITE = (LAB_MANAGER, TECHNICIAN)
LAB_REQUEST_WRITE = (LAB_MANAGER, ENGINEER, RECEPTION)
TEST_EXECUTION_WRITE = (LAB_MANAGER, TECHNICIAN, QUALITY_MANAGER)
EQUIPMENT_WRITE = (LAB_MANAGER,)
MAINTENANCE_WRITE = (LAB_MANAGER, TECHNICIAN)
CURING_WRITE = (LAB_MANAGER, TECHNICIAN)
REPORT_WRITE = (LAB_MANAGER, ENGINEER, QUALITY_MANAGER)
CRITERIA_WRITE = (LAB_MANAGER, QUALITY_MANAGER)
TRANSACTION_WRITE = (LAB_MANAGER,)
CATALOG_WRITE = (LAB_MANAGER, QUALITY_MANAGER)
FILE_WRITE = (LAB_MANAGER, TECHNICIAN, RECEPTION, ENGINEER)
FACTORY_WRITE = (FACTORY_MANAGER,)

#: نقش‌های مجاز برای تأیید گزارش
REPORT_APPROVAL_ROLES = (LAB_MANAGER, QUALITY_MANAGER)


def get_role(user) -> str | None:
    """نقش کاربر؛ برای کاربران بدون پروفایل به‌صورت امن نقش مشتری برمی‌گرداند."""
    if user is None or not getattr(user, 'is_authenticated', False):
        return None
    profile = getattr(user, 'profile', None)
    if profile is None:
        return CLIENT
    return profile.role or CLIENT


def role_label(role: str) -> str:
    return ROLE_LABELS.get(role, role or '')
