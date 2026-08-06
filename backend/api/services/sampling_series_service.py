from django.db import transaction

from api.models import SamplingSeries


class SamplingSeriesService:

    @staticmethod
    @transaction.atomic
    def create_series_with_molds(validated_data: dict) -> SamplingSeries:
        """سری نمونه را می‌سازد.

        قالب‌ها تنها در ساختار یکپارچه «پروژه → عضو سازه‌ای → ریز بتن → قالب»
        ساخته می‌شوند؛ لذا این سرویس دیگر قالب ایجاد نمی‌کند. فیلد `mold_ages`
        برای سازگاری عقب‌مانده پذیرفته و نادیده گرفته می‌شود.
        """
        validated_data.pop('mold_ages', None)
        return SamplingSeries.objects.create(**validated_data)