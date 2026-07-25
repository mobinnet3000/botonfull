# api/serializers.py

from math import ceil
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    LabProfile, Project, Sample, SamplingSeries, SamplingSeriesPhoto,
    Mold, Transaction, Ticket, TicketMessage
)

# ----------------------
# Transaction
# ----------------------
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'project', 'type', 'description', 'amount', 'date']


# ----------------------
# ثبت نام کاربر + ساخت پروفایل
# ----------------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    lab_name = serializers.CharField(required=True, write_only=True)
    lab_mobile_number = serializers.CharField(required=True, write_only=True)
    lab_address = serializers.CharField(required=True, write_only=True)
    province = serializers.CharField(required=True, write_only=True)
    city = serializers.CharField(required=True, write_only=True)
    lab_phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    telegram_id = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email',
            'lab_name', 'lab_mobile_number', 'lab_address', 'province',
            'city', 'lab_phone_number', 'telegram_id'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
        profile_data = {
            'lab_name': validated_data.pop('lab_name'),
            'lab_mobile_number': validated_data.pop('lab_mobile_number'),
            'lab_address': validated_data.pop('lab_address'),
            'province': validated_data.pop('province'),
            'city': validated_data.pop('city'),
            'lab_phone_number': validated_data.pop('lab_phone_number', ''),
            'telegram_id': validated_data.pop('telegram_id', None),
        }
        user = User.objects.create_user(**validated_data)
        LabProfile.objects.create(user=user, **profile_data)
        return user


# ----------------------
# Mold
# ----------------------
class MoldSerializer(serializers.ModelSerializer):
    is_done = serializers.SerializerMethodField()

    class Meta:
        model = Mold
        fields = [
            'id', 'series', 'age_in_days', 'mass', 'breaking_load',
            'created_at', 'completed_at', 'deadline', 'sample_identifier',
            'extra_data', 'pre_break_image', 'post_break_image', 'is_done',
        ]
        read_only_fields = [
            'id', 'created_at', 'deadline', 'series', 'age_in_days', 'is_done',
        ]

    def get_is_done(self, obj):
        return obj.breaking_load is not None and obj.breaking_load > 0

    def update(self, instance, validated_data):
        instance.mass = validated_data.get('mass', instance.mass)
        instance.breaking_load = validated_data.get('breaking_load', instance.breaking_load)
        instance.completed_at = validated_data.get('completed_at', instance.completed_at)
        if 'pre_break_image' in validated_data:
            instance.pre_break_image = validated_data['pre_break_image']
        if 'post_break_image' in validated_data:
            instance.post_break_image = validated_data['post_break_image']
        instance.save()
        return instance


# ----------------------
# Sampling Series Photos
# ----------------------
class SamplingSeriesPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SamplingSeriesPhoto
        fields = ['id', 'series', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


# ----------------------
# Sampling Series
# ----------------------
class SamplingSeriesWriteSerializer(serializers.ModelSerializer):
    mold_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=True,
        help_text="لیستی از سن قالب‌ها برای ساخت خودکار. مثال: [7, 28]"
    )

    class Meta:
        model = SamplingSeries
        fields = [
            'id', 'sample', 'name',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image',
            'axis', 'has_additive',
            'mold_ages',
        ]

    @transaction.atomic
    def create(self, validated_data):
        mold_ages = validated_data.pop('mold_ages', [])
        series_instance = SamplingSeries.objects.create(**validated_data)

        molds_to_create = []
        now = timezone.now()
        for age in mold_ages:
            molds_to_create.append(
                Mold(
                    series=series_instance,
                    age_in_days=age,
                    mass=0.0,
                    breaking_load=0.0,
                    deadline=now + timedelta(days=age),
                    sample_identifier=f"{series_instance.sample.category}-{age}روزه-{series_instance.name or series_instance.id}",
                )
            )
        if molds_to_create:
            Mold.objects.bulk_create(molds_to_create)

        return series_instance


class SamplingSeriesReadSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    molds = MoldSerializer(many=True, read_only=True)
    photos = SamplingSeriesPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = SamplingSeries
        fields = [
            'id', 'sample', 'name',
            'concrete_temperature', 'concrete_temperature_image',
            'slump', 'slump_image',
            'axis', 'has_additive',
            'molds', 'photos',
        ]

    def get_name(self, obj: SamplingSeries) -> str:
        if obj.name:
            return obj.name

        if not obj.sample:
            return "سری نمونه نامشخص"

        all_series_for_sample = obj.sample.series.order_by('id').all()
        try:
            series_list = list(all_series_for_sample)
            index = series_list.index(obj)
            return f"{obj.sample.category}-{index + 1}"
        except ValueError:
            return f"{obj.sample.category}-?"


# ----------------------
# Sample
# ----------------------
class SampleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = [
            'id', 'project', 'date',
            'sampling_volume', 'cement_grade', 'cement_type',
            'category', 'weather_condition', 'ambient_temperature',
            'concrete_factory', 'specimen_type', 'specimen_size',
            'sampling_location', 'concrete_production_method',
        ]

    def validate(self, attrs):
        specimen_type = attrs.get('specimen_type')
        specimen_size = attrs.get('specimen_size')

        if specimen_type == 'cube' and specimen_size != 'cube_15':
            raise serializers.ValidationError("برای نمونه مکعبی فقط سایز 15x15x15 مجاز است.")
        if specimen_type == 'cylinder' and specimen_size not in ('cyl_300_150', 'cyl_200_100'):
            raise serializers.ValidationError("برای نمونه استوانه‌ای فقط یکی از سایزهای 300x150 یا 200x100 مجاز است.")

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        sample = super().create(validated_data)

        volume = sample.sampling_volume or 0.0
        series_count = ceil(volume / 30.0) if volume > 0 else 0

        for i in range(series_count):
            SamplingSeries.objects.create(
                sample=sample,
                name=f"{sample.category}-{i + 1}",
                concrete_temperature=0.0,
                slump=0.0,
                axis='',
                has_additive=False,
            )

        return sample


class SampleReadSerializer(SampleWriteSerializer):
    series = SamplingSeriesReadSerializer(many=True, read_only=True)

    class Meta(SampleWriteSerializer.Meta):
        fields = SampleWriteSerializer.Meta.fields + ['series']


# ----------------------
# Project
# ----------------------
# ----------------------
# Project
# ----------------------
class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'created_at',
            'file_number', 'project_name',
            'client_name', 'client_phone_number',
            'supervisor_name', 'supervisor_phone_number',
            'requester_name', 'requester_phone_number',
            'municipality_zone', 'address',
            'project_usage_type', 'floor_count',
            'test_type',
            'occupied_area', 'contract_price',
        ]
        read_only_fields = ('owner', 'created_at')

    @transaction.atomic
    def create(self, validated_data):
        """
        هنگام ساخت پروژه، نمونه‌ها (Samples) را بر اساس تعداد طبقه به‌صورت خودکار می‌سازد
        و برای هر نمونه، تعداد سری‌ها را بر اساس حجم بتن‌ریزی می‌سازد.
        """
        project = super().create(validated_data)
        floor_count = validated_data.get('floor_count', 0)

        # لیست ترتیب نام‌های نمونه بر اساس فرمول 2n+1
        sample_names = ['فنداسیون']
        for i in range(1, floor_count + 1):
            sample_names.append(f'ستون{i}')
            sample_names.append(f'سقف{i}')

        # ساخت نمونه‌ها
        from math import ceil
        from .models import Sample, SamplingSeries

        for name in sample_names:
            # برای جلوگیری از خطای خالی بودن فیلدها مقادیر پیش‌فرض منطقی می‌گذاریم
            sample = Sample.objects.create(
                project=project,
                date=timezone.now(),
                sampling_volume=70.0,  # مقدار پیش‌فرض قابل ویرایش کاربر
                cement_grade='350',
                cement_type='تیپ 1',
                category=name,
                weather_condition='آفتابی',
                ambient_temperature=25.0,
                concrete_factory='---',
                specimen_type='cube',
                specimen_size='cube_15',
                sampling_location='کارگاه',
                concrete_production_method='factory_batching',
            )

            # محاسبه تعداد سری‌ها براساس حجم بتن‌ریزی
            volume = sample.sampling_volume or 0.0
            series_count = ceil(volume / 30.0) if volume > 0 else 0

            for i in range(series_count):
                SamplingSeries.objects.create(
                    sample=sample,
                    name=f"{sample.category}-{i + 1}",
                    concrete_temperature=0.0,
                    slump=0.0,
                    axis='',
                    has_additive=False,
                )

        return project


class ProjectReadSerializer(ProjectWriteSerializer):
    samples = SampleReadSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(read_only=True, format="%Y-%m-%dT%H:%M:%S")

    total_income = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta(ProjectWriteSerializer.Meta):
        fields = ProjectWriteSerializer.Meta.fields + [
            'samples', 'transactions', 'total_income', 'total_expense', 'balance'
        ]

    def get_total_income(self, obj: Project):
        total = obj.transactions.filter(type='income').aggregate(total=Sum('amount'))['total']
        return total or 0.0

    def get_total_expense(self, obj: Project):
        total = obj.transactions.filter(type='expense').aggregate(total=Sum('amount'))['total']
        return total or 0.0

    def get_balance(self, obj: Project):
        return self.get_total_income(obj) - self.get_total_expense(obj)


# ----------------------
# Lab Profile
# ----------------------
class LabProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = LabProfile
        fields = [
            'id', 'lab_name', 'lab_phone_number', 'lab_mobile_number',
            'lab_address', 'province', 'city', 'telegram_id',
            'first_name', 'last_name', 'email', 'user',
        ]
        read_only_fields = ('user',)

    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            user.save()
        return super().update(instance, validated_data)


# ----------------------
# Ticketing
# ----------------------
class TicketMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'user', 'username', 'message', 'created_at']
        read_only_fields = ('user', 'created_at', 'username')


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'user', 'username', 'status', 'status_display',
            'priority', 'priority_display', 'created_at', 'updated_at', 'messages',
        ]
        read_only_fields = ('user', 'created_at', 'updated_at', 'username', 'status_display', 'priority_display')


# ----------------------
# Full User Data
# ----------------------
class UserForFullDataSerializer(serializers.ModelSerializer):
    lab_profile = LabProfileSerializer(read_only=True)
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'lab_profile', 'tickets']


class FullUserDataSerializer(serializers.Serializer):
    user = UserForFullDataSerializer()
    projects = ProjectReadSerializer(many=True)
