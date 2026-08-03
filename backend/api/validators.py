import os

from django.core.exceptions import ValidationError

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS + [
    '.pdf', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.mp4', '.mov', '.txt', '.zip',
]
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def validate_specimen_type(specimen_type: str, specimen_size: str) -> None:
    if specimen_type == 'cube' and specimen_size != 'cube_15':
        raise ValidationError('برای نمونه مکعبی فقط سایز 15x15x15 مجاز است.')
    if specimen_type == 'cylinder' and specimen_size not in ('cyl_300_150', 'cyl_200_100'):
        raise ValidationError('برای نمونه استوانه‌ای فقط یکی از سایزهای 300x150 یا 200x100 مجاز است.')


def _extension(value) -> str:
    return os.path.splitext(value.name)[1].lower()


def validate_image_file(value) -> None:
    ext = _extension(value)
    if ext not in IMAGE_EXTENSIONS:
        raise ValidationError(
            f'فرمت فایل {ext} مجاز نیست. فرمت‌های مجاز: {", ".join(IMAGE_EXTENSIONS)}.'
        )


def validate_file_extension(value) -> None:
    ext = _extension(value)
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f'فرمت فایل {ext} مجاز نیست.')


def validate_file_size(value) -> None:
    if value.size > MAX_FILE_SIZE:
        raise ValidationError(f'حجم فایل نباید بیشتر از {MAX_FILE_SIZE // (1024 * 1024)} مگابایت باشد.')
