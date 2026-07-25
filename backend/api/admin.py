# api/admin.py

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    LabProfile, Project, Sample, SamplingSeries, SamplingSeriesPhoto,
    Mold, Transaction, Ticket, TicketMessage
)

# --- User & LabProfile ---
class LabProfileInline(admin.StackedInline):
    model = LabProfile
    can_delete = False
    verbose_name_plural = 'پروفایل آزمایشگاه'


class CustomUserAdmin(BaseUserAdmin):
    inlines = (LabProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_lab_name')

    def get_lab_name(self, obj):
        return getattr(obj.lab_profile, 'lab_name', '-')
    get_lab_name.short_description = 'نام آزمایشگاه'


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# --- Project ---
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_name', 'file_number', 'owner', 'client_name',
        'municipality_zone', 'project_usage_type', 'floor_count',
        'test_type', 'contract_price', 'created_at',
    )
    list_filter = ('owner__city', 'test_type', 'project_usage_type')
    search_fields = ('project_name', 'file_number', 'client_name', 'address')
    fieldsets = (
        ('اطلاعات اصلی پروژه', {
            'fields': (
                'owner', 'file_number', 'project_name', 'address', 'municipality_zone',
                'project_usage_type', 'floor_count', 'occupied_area',
                'test_type', 'contract_price',
            )
        }),
        ('اطلاعات کارفرما/ناظر/درخواست‌دهنده', {
            'fields': (
                'client_name', 'client_phone_number',
                'supervisor_name', 'supervisor_phone_number',
                'requester_name', 'requester_phone_number',
            )
        }),
    )


# --- Sample ---
class SamplingSeriesInline(admin.TabularInline):
    model = SamplingSeries
    extra = 0
    fields = ('name', 'concrete_temperature', 'slump', 'axis', 'has_additive')


@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'date', 'category', 'cement_grade', 'cement_type',
        'ambient_temperature', 'sampling_volume', 'specimen_type', 'specimen_size',
    )
    list_filter = ('specimen_type', 'specimen_size', 'cement_type')
    search_fields = (
        'project__project_name', 'category', 'sampling_location', 'concrete_factory',
    )
    fieldsets = (
        ('اطلاعات نمونه', {
            'fields': (
                'project', 'date', 'category', 'weather_condition', 'ambient_temperature',
                'sampling_volume', 'cement_grade', 'cement_type',
                'specimen_type', 'specimen_size',
                'sampling_location', 'concrete_factory', 'concrete_production_method',
            )
        }),
    )
    inlines = [SamplingSeriesInline]


# --- Sampling Series ---
class MoldInline(admin.TabularInline):
    model = Mold
    extra = 0
    fields = ('age_in_days', 'mass', 'breaking_load', 'deadline', 'pre_break_image', 'post_break_image')


class SamplingSeriesPhotoInline(admin.TabularInline):
    model = SamplingSeriesPhoto
    extra = 0
    fields = ('image',)


@admin.register(SamplingSeries)
class SamplingSeriesAdmin(admin.ModelAdmin):
    list_display = ('sample', 'name', 'concrete_temperature', 'slump', 'axis', 'has_additive')
    search_fields = ('name', 'sample__category')
    inlines = [MoldInline, SamplingSeriesPhotoInline]
    fields = (
        'sample', 'name', 'concrete_temperature', 'concrete_temperature_image',
        'slump', 'slump_image', 'axis', 'has_additive',
    )


# --- Mold ---
@admin.register(Mold)
class MoldAdmin(admin.ModelAdmin):
    list_display = ('series', 'age_in_days', 'mass', 'breaking_load', 'deadline', 'is_done_display')
    fields = (
        'series', 'age_in_days', 'mass', 'breaking_load', 'deadline',
        'sample_identifier', 'extra_data', 'pre_break_image', 'post_break_image',
    )

    def is_done_display(self, obj):
        return obj.breaking_load is not None and obj.breaking_load > 0
    is_done_display.short_description = 'شکسته شده؟'


# --- Transaction ---
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('project', 'type', 'amount', 'date')
    list_filter = ('type', 'project')
    search_fields = ('project__project_name',)


# --- Ticket & TicketMessage ---
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'priority', 'updated_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'user__username')


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'created_at')
    search_fields = ('ticket__title', 'user__username')
