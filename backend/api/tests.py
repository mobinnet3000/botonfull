from django.test import TestCase

from api.models import SamplingSeries

# Create your tests here.
def namee(obj: SamplingSeries) -> str:
        """
        این متد نام ترتیبی هر سری نمونه را بر اساس ترتیب ساخت آن تولید می‌کند.
        """
        # اگر سری نمونه به هیچ نمونه‌ای وصل نبود (برای جلوگیری از خطا)
        if not obj.sample:
            return "سری نمونه نامشخص"
            
        # تمام سری‌های مربوط به همان نمونه را به ترتیب آی‌دی (زمان ساخت) می‌گیریم
        all_series_for_sample = obj.sample.series.order_by('id').all()
        
        # موقعیت (ایندکس) سری فعلی را در لیست پیدا می‌کنیم
        try:
            # تبدیل به لیست برای استفاده از متد index
            series_list = list(all_series_for_sample)
            index = series_list.index(obj)
            # ایندکس از صفر شروع می‌شود، پس ۱ واحد به آن اضافه می‌کنیم
            return f"سری نمونه {index + 1}"
        except ValueError:
            # اگر به هر دلیلی پیدا نشد
            return "سری نمونه ؟"
  