# api/models.py

from django.db import models
from django.contrib.auth.models import User

# ----------------------
# Lab Profile
# ----------------------
class LabProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lab_profile')
    lab_name = models.CharField(max_length=200, verbose_name="نام آزمایشگاه")
    lab_phone_number = models.CharField(max_length=20, verbose_name="شماره آزمایشگاه", blank=True)
    lab_mobile_number = models.CharField(max_length=20, verbose_name="موبایل آزمایشگاه")
    lab_address = models.TextField(verbose_name="آدرس آزمایشگاه")
    province = models.CharField(max_length=100, verbose_name="استان")
    city = models.CharField(max_length=100, verbose_name="شهر")
    telegram_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="آیدی تلگرام")

    def __str__(self):
        return self.lab_name


# ----------------------
# Project
# ----------------------
class Project(models.Model):
    TEST_TYPE_CHOICES = [
        ('compressive', 'مقاومت فشاری'),
        ('schmidt', 'چکش اشمیت'),
    ]

    owner = models.ForeignKey(LabProfile, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ساخت پروژه")

    file_number = models.CharField(max_length=100, verbose_name="شماره پرونده")
    project_name = models.CharField(max_length=255, verbose_name="نام پروژه")

    client_name = models.CharField(max_length=200, verbose_name="نام کارفرما")
    client_phone_number = models.CharField(max_length=20, verbose_name="شماره تماس کارفرما")

    supervisor_name = models.CharField(max_length=200, verbose_name="نام ناظر")
    supervisor_phone_number = models.CharField(max_length=20, verbose_name="شماره تماس ناظر")

    requester_name = models.CharField(max_length=200, verbose_name="نام درخواست دهنده")
    requester_phone_number = models.CharField(max_length=20, verbose_name="شماره تماس درخواست دهنده")

    municipality_zone = models.CharField(max_length=100, verbose_name="منطقه شهرداری")
    address = models.TextField(verbose_name="آدرس")

    project_usage_type = models.CharField(max_length=100, verbose_name="کاربری پروژه")
    floor_count = models.IntegerField(verbose_name="طبقات")

    # نوع آزمون به پروژه منتقل شد
    test_type = models.CharField(
        max_length=20,
        choices=TEST_TYPE_CHOICES,
        default='compressive',   # ✅ برای مهاجرت بدون سوال
        verbose_name="نوع آزمون"
    )


    occupied_area = models.FloatField(verbose_name="سطح زیربنا اشغال شده (مترمربع)")
    contract_price = models.DecimalField(max_digits=20, decimal_places=2, default=0.0, verbose_name="مبلغ کل قرارداد")

    def __str__(self):
        return self.project_name


# ----------------------
# Sample
# ----------------------
class Sample(models.Model):
    SPECIMEN_TYPE_CHOICES = [
        ('cube', 'مکعبی'),
        ('cylinder', 'استوانه‌ای'),
    ]

    SPECIMEN_SIZE_CHOICES = [
        ('cube_15', '15x15x15 cm'),
        ('cyl_300_150', 'ارتفاع 300mm - قطر 150mm'),
        ('cyl_200_100', 'ارتفاع 200mm - قطر 100mm'),
    ]

    PRODUCTION_METHOD_CHOICES = [
        ('factory_batching', 'بچینگ کارخانه'),
        ('manual', 'دستی'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='samples')

    date = models.DateTimeField(verbose_name="تاریخ")

    # نوع آزمون از Sample حذف شد و به Project منتقل شد

    # حجم بتن‌ریزی برای محاسبه تعداد سری‌ها
    sampling_volume = models.FloatField(verbose_name="حجم بتن‌ریزی (متر مکعب)")

    cement_grade = models.CharField(max_length=50, verbose_name="عیار سیمان")

    # تیپ سیمان (اضافه شد)
    cement_type = models.CharField(
        max_length=100,
        verbose_name="تیپ سیمان",
        default='',              # ✅ جلوگیری از سوال در مهاجرت
        blank=True
    )

    category = models.CharField(max_length=100, verbose_name="رده")
    weather_condition = models.CharField(max_length=100, verbose_name="وضعیت جوی")

    # دمای هوای محیط (اضافه شد)
    ambient_temperature = models.FloatField(
        verbose_name="دمای محیط",
        default=20.0             # ✅ مقدار معقول پیش‌فرض
    )
    concrete_factory = models.CharField(max_length=200, verbose_name="کارخانه بتن")

    specimen_type = models.CharField(
        max_length=10,
        choices=SPECIMEN_TYPE_CHOICES,
        default='cube',          # ✅ پیش‌فرض منطقی
        verbose_name="نوع نمونه"
    )
    specimen_size = models.CharField(
        max_length=20,
        choices=SPECIMEN_SIZE_CHOICES,
        default='cube_15',       # ✅ پیش‌فرض منطقی
        verbose_name="سایز نمونه"
    )

    sampling_location = models.CharField(
        max_length=200,
        verbose_name="محل نمونه‌برداری",
        default=''               # ✅ جلوگیری از سوال
    )
    concrete_production_method = models.CharField(
        max_length=20,
        choices=PRODUCTION_METHOD_CHOICES,
        default='factory_batching',  # ✅ پیش‌فرض
        verbose_name="روش ساخت بتن"
    )
    def __str__(self):
        return f"نمونه برای {self.project.project_name}"


# ----------------------
# Sampling Series
# ----------------------
class SamplingSeries(models.Model):
    sample = models.ForeignKey(Sample, on_delete=models.CASCADE, related_name='series')

    # نام سری برای نمایش مثل "فنداسیون-1"
    name = models.CharField(max_length=200, verbose_name="نام سری", blank=True)

    concrete_temperature = models.FloatField(verbose_name="دمای بتن")
    # عکس دمای بتن (اضافه شد)
    concrete_temperature_image = models.ImageField(upload_to='series/concrete_temperature/', blank=True, null=True)

    slump = models.FloatField(verbose_name="اسلامپ")
    # عکس اسلامپ (اضافه شد)
    slump_image = models.ImageField(upload_to='series/slump/', blank=True, null=True)

    # محور (اضافه شد مثل A1-A2)
    axis = models.CharField(max_length=100, verbose_name="محور", blank=True)

    has_additive = models.BooleanField(default=False, verbose_name="داشتن افزودنی")

    # موارد زیر حذف شدند:
    # ambient_temperature (حذف شد)
    # range               (حذف شد)
    # air_percentage      (حذف شد)

    class Meta:
        verbose_name_plural = "Sampling Series"

    def __str__(self):
        return f"سری {self.name or self.id} برای نمونه {self.sample.id}"


class SamplingSeriesPhoto(models.Model):
    series = models.ForeignKey(SamplingSeries, on_delete=models.CASCADE, related_name='photos', verbose_name="سری نمونه")
    image = models.ImageField(upload_to='series/specimens/', verbose_name="عکس نمونه‌ها")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"عکس سری {self.series_id}"


# ----------------------
# Mold
# ----------------------
class Mold(models.Model):
    series = models.ForeignKey('SamplingSeries', related_name='molds', on_delete=models.CASCADE)
    age_in_days = models.IntegerField()

    mass = models.FloatField(default=0.0, blank=True, null=True)
    breaking_load = models.FloatField(default=0.0, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    deadline = models.DateTimeField()

    sample_identifier = models.CharField(max_length=100)
    extra_data = models.JSONField(default=dict, blank=True)

    # عکس قبل شکست و بعد شکست (اضافه شد)
    pre_break_image = models.ImageField(upload_to='molds/pre_break/', blank=True, null=True, verbose_name="عکس قبل شکست")
    post_break_image = models.ImageField(upload_to='molds/post_break/', blank=True, null=True, verbose_name="عکس بعد شکست")

    def __str__(self):
        return f"قالب {self.sample_identifier}"


# ----------------------
# Transaction
# ----------------------
class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'واریزی'),
        ('expense', 'هزینه/برداشت'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='transactions', verbose_name="پروژه")
    type = models.CharField(max_length=7, choices=TRANSACTION_TYPES, verbose_name="نوع تراکنش")
    description = models.TextField(verbose_name="توضیحات")
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="مبلغ")
    date = models.DateTimeField(verbose_name="تاریخ تراکنش")

    def __str__(self):
        return f"{self.get_type_display()} - {self.project.project_name}"


# ----------------------
# Ticketing
# ----------------------
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'باز'),
        ('in_progress', 'در حال بررسی'),
        ('closed', 'بسته شده'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'پایین'),
        ('medium', 'متوسط'),
        ('high', 'بالا'),
    ]

    title = models.CharField(max_length=255, verbose_name="عنوان")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets', verbose_name="کاربر")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', verbose_name="وضعیت")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name="اولویت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="بروزرسانی")

    def __str__(self):
        return f"تیکت: {self.title} ({self.user.username})"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages', verbose_name="تیکت")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="کاربر")
    message = models.TextField(verbose_name="متن پیام")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="ایجاد")

    def __str__(self):
        return f"پیام از {self.user.username} برای تیکت {self.ticket.id}"
