# api/admin.py

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from api.models import (
    LabProfile, Profile, Factory, Client,
    Project, Sample, SampleType, SamplingSeries, SamplingSeriesPhoto,
    Mold, Transaction, Ticket, TicketMessage,
    TestType, AcceptanceCriteria, LabRequest,
    Equipment, MaintenanceRecord, TestExecution,
    CuringTank, CuringRecord,
    Report, ReportRevision, Notification, AppFile, ActivityLog,
)
from api.roles import ROLE_LABELS


# --- User & Profile ---
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'پروفایل و نقش'


class LabProfileInline(admin.StackedInline):
    model = LabProfile
    can_delete = False
    verbose_name_plural = 'پروفایل آزمایشگاه'


class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, LabProfileInline)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'get_lab_name', 'is_staff')

    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        return ROLE_LABELS.get(getattr(profile, 'role', ''), '-')
    get_role.short_description = 'نقش'

    def get_lab_name(self, obj):
        return getattr(obj, 'lab_profile', None) or getattr(getattr(obj, 'profile', None), 'lab', None) or '-'
    get_lab_name.short_description = 'آزمایشگاه'


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(LabProfile)
class LabProfileAdmin(admin.ModelAdmin):
    list_display = ('lab_name', 'lab_code', 'user', 'city', 'province')
    search_fields = ('lab_name', 'lab_code', 'user__username')


@admin.register(Factory)
class FactoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager', 'phone_number', 'created_at')
    search_fields = ('name', 'manager__username')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'client_type', 'contact_person', 'phone_number', 'email')
    list_filter = ('client_type',)
    search_fields = ('name', 'contact_person', 'email')


# --- Project ---
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'code', 'project_name', 'file_number', 'owner', 'client',
        'client_name', 'status', 'priority', 'contract_price', 'created_at',
    )
    list_filter = ('status', 'priority', 'owner__city', 'test_type')
    search_fields = ('project_name', 'file_number', 'code', 'client_name', 'address')
    fieldsets = (
        ('اطلاعات اصلی پروژه', {
            'fields': (
                'owner', 'code', 'file_number', 'project_name', 'address',
                'municipality_zone', 'project_usage_type', 'floor_count',
                'occupied_area', 'test_type', 'contract_price',
                'client', 'factory', 'contractor_name', 'consultant_name',
                'description', 'contract_number', 'start_date', 'end_date',
                'status', 'priority', 'responsible_engineer', 'notes',
                'client_user', 'supervisor_user', 'created_by',
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
        'code', 'project', 'date', 'status', 'category', 'cement_grade',
        'specimen_type', 'specimen_size',
    )
    list_filter = ('status', 'specimen_type', 'specimen_size', 'sample_type')
    search_fields = ('code', 'barcode', 'project__project_name', 'category', 'concrete_factory')
    fieldsets = (
        ('شناسه و وضعیت', {'fields': ('project', 'code', 'barcode', 'qr_token', 'status', 'current_location', 'date')}),
        ('اطلاعات نمونه', {'fields': (
            'casting_date', 'sampling_date', 'receiving_date',
            'sample_type', 'category', 'weight', 'dimensions', 'description',
            'weather_condition', 'ambient_temperature', 'sampling_volume',
            'cement_grade', 'cement_type', 'specimen_type', 'specimen_size',
            'sampling_location', 'concrete_factory', 'concrete_production_method',
            'technician', 'responsible_engineer', 'received_by', 'created_by',
        )}),
    )
    inlines = [SamplingSeriesInline]


@admin.register(SampleType)
class SampleTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active')
    search_fields = ('name', 'code')


# --- Sampling Series ---


class SamplingSeriesPhotoInline(admin.TabularInline):
    model = SamplingSeriesPhoto
    extra = 0
    fields = ('image',)


@admin.register(SamplingSeries)
class SamplingSeriesAdmin(admin.ModelAdmin):
    list_display = ('sample', 'name', 'concrete_temperature', 'slump', 'axis')
    search_fields = ('name', 'sample__code', 'sample__category')
    inlines = [SamplingSeriesPhotoInline]


# --- Mold ---
@admin.register(Mold)
class MoldAdmin(admin.ModelAdmin):
    list_display = ('sample_identifier', 'pour_series', 'age_in_days', 'breaking_load', 'deadline', 'is_done', 'status')
    list_filter = ('status', 'priority')
    search_fields = ('sample_identifier',)


# --- Transaction ---
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('project', 'type', 'amount', 'date')
    list_filter = ('type',)
    search_fields = ('project__project_name', 'description')


# --- Ticket ---
@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'priority', 'updated_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'user__username')


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'created_at')
    search_fields = ('ticket__title', 'user__username')


# --- Catalogs ---
@admin.register(TestType)
class TestTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'unit', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'code')


@admin.register(AcceptanceCriteria)
class AcceptanceCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'test_type', 'standard_name', 'is_active')
    search_fields = ('name', 'standard_name')


# --- Lab Request ---
@admin.register(LabRequest)
class LabRequestAdmin(admin.ModelAdmin):
    list_display = ('request_number', 'project', 'priority', 'status', 'due_date', 'requested_by')
    list_filter = ('status', 'priority')
    search_fields = ('request_number', 'project__project_name')
    filter_horizontal = ('requested_tests',)


# --- Equipment ---
@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'manufacturer', 'model', 'status', 'next_calibration_date', 'is_usable')
    list_filter = ('status',)
    search_fields = ('name', 'code', 'manufacturer', 'serial_number')


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ('equipment', 'maintenance_type', 'date', 'next_due_date')
    list_filter = ('maintenance_type',)
    search_fields = ('equipment__name',)


# --- Test Execution ---
@admin.register(TestExecution)
class TestExecutionAdmin(admin.ModelAdmin):
    list_display = ('sample', 'test_type', 'status', 'result_status', 'result', 'operator', 'start_time')
    list_filter = ('status', 'result_status', 'test_type')
    search_fields = ('sample__code',)


# --- Curing ---
@admin.register(CuringTank)
class CuringTankAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'capacity', 'water_temperature', 'is_active', 'current_sample_count')
    search_fields = ('name', 'code')


@admin.register(CuringRecord)
class CuringRecordAdmin(admin.ModelAdmin):
    list_display = ('tank', 'sample', 'entry_date', 'exit_date', 'operator')
    list_filter = ('tank',)
    search_fields = ('sample__code',)


# --- Report ---
class ReportRevisionInline(admin.TabularInline):
    model = ReportRevision
    extra = 0
    readonly_fields = ('version', 'content', 'changed_by', 'notes', 'created_at')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'title', 'project', 'status', 'version', 'created_by', 'approved_at')
    list_filter = ('status',)
    search_fields = ('report_number', 'title', 'project__project_name')
    inlines = [ReportRevisionInline]


@admin.register(ReportRevision)
class ReportRevisionAdmin(admin.ModelAdmin):
    list_display = ('report', 'version', 'changed_by', 'created_at')
    search_fields = ('report__report_number',)


# --- Notifications / Files / Logs ---
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'ntype', 'is_read', 'created_at')
    list_filter = ('ntype', 'is_read')
    search_fields = ('title', 'user__username')


@admin.register(AppFile)
class AppFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'content_type', 'object_id', 'uploaded_by', 'created_at')
    list_filter = ('content_type',)
    search_fields = ('original_name',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'content_type', 'object_id', 'user', 'ip', 'created_at')
    list_filter = ('action', 'content_type')
    search_fields = ('object_repr', 'user__username')
    date_hierarchy = 'created_at'
