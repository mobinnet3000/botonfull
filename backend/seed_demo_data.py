"""
seed_demo_data.py
=================
تولید داده نمونه واقع‌گرایانه برای سامانه مدیریت آزمایشگاه بتن (LIMS).

داده‌ها حدود سه ماه را پوشش می‌دهند: دو ماه گذشته، ماه جاری و یک ماه آینده.
این اسکریپت مستقل است و با اجرای مستقیم کار می‌کند:

    python seed_demo_data.py            # ساخت داده نمونه
    python seed_demo_data.py --clear    # حذف داده نمونه قبلی و ساخت مجدد
    python seed_demo_data.py --large    # افزودن پروژه بزرگ (صدها قالب) برای تست فشار

تمام داده‌های نمونه با پیشوند demo_ / DEMO مشخص می‌شوند تا قابل پاک‌سازی باشند.
"""

import os
import random
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

import django  # noqa: E402

django.setup()

from datetime import timedelta  # noqa: E402

from django.contrib.auth.models import User  # noqa: E402
from django.utils import timezone  # noqa: E402

from api.models import (  # noqa: E402
    LabProfile, Profile, Factory, Client, Project, Sample, SamplingSeries, Mold,
    Equipment, MaintenanceRecord, TestExecution, TestType, Notification, Report,
    Transaction, ActivityLog,
)
from api.services.auth_service import ProfileService  # noqa: E402

NOW = timezone.now()
TODAY = NOW.date()

random.seed(42)

DEMO_USER_PREFIX = 'demo_'


def clr(text):
    return f'\033[92m{text}\033[0m'


def is_clear_mode():
    return '--clear' in sys.argv


def is_large_mode():
    return '--large' in sys.argv


def make_user(username, password='demo12345', role=None, lab=None, first='', last=''):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={'password': '!', 'first_name': first, 'last_name': last},
    )
    if created:
        user.set_password(password)
        user.save()
    ProfileService.ensure_profile(user, role=role, lab=lab)
    return user


def clear_demo():
    """حذف داده‌های نمونه قبلی."""
    User.objects.filter(username__startswith=DEMO_USER_PREFIX).delete()
    LabProfile.objects.filter(user__username__startswith=DEMO_USER_PREFIX).delete()
    Factory.objects.filter(name__startswith='کارخانه نمونه').delete()
    Client.objects.filter(name__startswith='مشتری نمونه').delete()
    Project.objects.filter(file_number__startswith='DEMO').delete()
    Equipment.objects.filter(code__startswith='DEMO').delete()
    Notification.objects.filter(title__startswith='[نمونه]').delete()
    Report.objects.filter(report_number__startswith='DEMO').delete()
    ActivityLog.objects.filter(object_repr__startswith='[نمونه]').delete()
    print(clr('داده نمونه قبلی حذف شد.'))


def create_foundation():
    """ساخت کاربران، آزمایشگاه، کارخانه، مشتری‌ها و کاتالوگ پایه."""
    lab_user = make_user('demo_lab', role='lab_manager', first='مدیر', last='آزمایشگاه')
    lab, _ = LabProfile.objects.get_or_create(
        user=lab_user,
        defaults={
            'lab_name': 'آزمایشگاه نمونه بتن پارس',
            'lab_mobile_number': '09120000001',
            'lab_address': 'تهران، خیابان آزادی',
            'province': 'تهران',
            'city': 'تهران',
        },
    )
    ProfileService.ensure_profile(lab_user, role='lab_manager', lab=lab)
    # اعضای تیم
    techs = [
        make_user('demo_tech1', role='technician', lab=lab, first='احمد', last='تکنسین'),
        make_user('demo_tech2', role='technician', lab=lab, first='مریم', last='تکنسین'),
        make_user('demo_tech3', role='technician', lab=lab, first='رضا', last='تکنسین'),
    ]
    eng = make_user('demo_eng', role='engineer', lab=lab, first='مهندس', last='ناظر')
    qm = make_user('demo_qm', role='quality_manager', lab=lab, first='کارشناس', last='کیفیت')
    reception = make_user('demo_reception', role='reception', lab=lab, first='پذیرش', last='آزمایشگاه')
    client_user = make_user('demo_client', role='client', first='کارفرما', last='نمونه')

    # کارخانه‌ها
    factories = []
    for i, name in enumerate(['کارخانه نمونه پارس', 'کارخانه نمونه البرز', 'کارخانه نمونه مهر']):
        mgr = make_user(f'demo_fm{i}', role='factory_manager', first='مدیر', last=f'کارخانه {i + 1}')
        factory, _ = Factory.objects.get_or_create(name=name, defaults={'manager': mgr})
        factories.append(factory)

    # مشتری‌ها
    client_types = ['company', 'government', 'private']
    clients = []
    for i in range(6):
        c, _ = Client.objects.get_or_create(
            name=f'مشتری نمونه {i + 1}',
            defaults={
                'client_type': client_types[i % 3],
                'contact_person': f'رابط {i + 1}',
                'phone_number': f'021-{random.randint(1000000, 9999999)}',
                'email': f'client{i + 1}@demo.ir',
                'address': 'تهران، شهرک غرب',
            },
        )
        clients.append(c)

    # دستگاه‌ها
    equipment = []
    equip_specs = [
        ('DEMO-PRESS-1', 'دستگاه فشاری بتن', 'Toni Technik', 'NOVA', 'SN-1001'),
        ('DEMO-PRESS-2', 'دستگاه فشاری ۲۰۰ تن', 'Controls', '50-C200', 'SN-1002'),
        ('DEMO-FLEX', 'دستگاه خمش', 'UTEST', 'UTC-4000', 'SN-1003'),
        ('DEMO-SLUMP', 'مخروط اسلامپ', 'LabTech', 'ST-1', 'SN-1004'),
        ('DEMO-OVEN', 'آون آزمایشگاهی', 'Memmert', 'UN-55', 'SN-1005'),
        ('DEMO-BALANCE', 'ترازوی دقیق', 'Mettler', 'ME-2002', 'SN-1006'),
        ('DEMO-HAMMER', 'چکش اشمیت', 'Proceq', 'N', 'SN-1007'),
        ('DEMO-CUR', 'مخزن عمل‌آوری', 'خودساخت', 'C-1', 'SN-1008'),
    ]
    for code, name, manu, model, sn in equip_specs:
        eq, _ = Equipment.objects.get_or_create(
            code=code,
            defaults={
                'name': name, 'manufacturer': manu, 'model': model,
                'serial_number': sn,
                'calibration_date': NOW.date() - timedelta(days=random.randint(60, 300)),
                'next_calibration_date': NOW.date() + timedelta(days=random.choice([-10, 5, 30, 60, 90, 120])),
                'status': random.choices(['active', 'maintenance', 'out_of_service'], weights=[6, 2, 1])[0],
            },
        )
        equipment.append(eq)
    # رکوردهای نگهداری
    for eq in equipment[:5]:
        MaintenanceRecord.objects.get_or_create(
            equipment=eq,
            maintenance_type='calibration',
            date=NOW.date() - timedelta(days=random.randint(30, 90)),
            defaults={
                'technician': random.choice(techs),
                'next_due_date': NOW.date() + timedelta(days=random.randint(0, 120)),
                'notes': 'کالیبراسیون دوره‌ای دستگاه',
            },
        )
    return lab, lab_user, techs, eng, qm, reception, client_user, factories, clients, equipment


def create_project(lab, lab_user, techs, eng, clients, factories, title, file_no, status,
                   floor_count, start_months_ago, members_count, pours_per_member, mold_ages,
                   concurrency=0.6, done_rate=0.4, overdue_rate=0.15, empty=False):
    project, _ = Project.objects.get_or_create(
        file_number=file_no,
        defaults={
            'owner': lab,
            'project_name': title,
            'client_name': 'کارفرمای نمونه',
            'client_phone_number': '021-0000000',
            'supervisor_name': 'ناظر نمونه',
            'supervisor_phone_number': '021-0000000',
            'requester_name': 'درخواست‌دهنده نمونه',
            'requester_phone_number': '021-0000000',
            'municipality_zone': f'منطقه {random.randint(1, 22)}',
            'address': 'تهران، بزرگراه حکیم',
            'project_usage_type': random.choice(['مسکونی', 'تجاری', 'اداری', 'بیمارستانی']),
            'floor_count': floor_count,
            'occupied_area': random.randint(500, 50000),
            'contract_price': random.randint(5, 200) * 10**9,
            'client': random.choice(clients),
            'factory': random.choice(factories),
            'contractor_name': 'پیمانکار نمونه',
            'consultant_name': 'مشاور نمونه',
            'contract_number': f'CON-{file_no}',
            'start_date': TODAY - timedelta(days=random.randint(120, 200)),
            'end_date': TODAY + timedelta(days=random.randint(30, 200)),
            'status': status,
            'priority': random.choice(['low', 'medium', 'high', 'urgent']),
            'responsible_engineer': eng.get_full_name() or 'مهندس مسئول نمونه',
            'created_by': lab_user,
            'notes': '',
        },
    )
    if empty:
        return project, []

    # عضوهای سازه‌ای (نمونه‌ها)
    categories = ['فنداسیون', 'ستون', 'سقف', 'دیوار', 'تیر', 'پله', 'ستون-همکف', 'ستون-طبقه۱']
    all_molds = []
    for m in range(members_count):
        cat = categories[m % len(categories)] + ('' if m < len(categories) else f'-{m // len(categories) + 1}')
        casting = NOW - timedelta(days=random.randint(15, 75))
        member, _ = Sample.objects.get_or_create(
            project=project,
            category=cat,
            defaults={
                'date': casting,
                'casting_date': casting,
                'sampling_date': casting,
                'status': random.choice(['received', 'waiting', 'curing', 'ready_for_test', 'testing', 'completed']),
                'current_location': 'آزمایشگاه',
                'sampling_volume': random.choice([30, 60, 70, 120, 150]),
                'cement_grade': random.choice(['350', '400', '450', '500']),
                'cement_type': random.choice(['تیپ ۱', 'تیپ ۲', 'تیپ ۵']),
                'weather_condition': random.choice(['آفتابی', 'ابری', 'بارانی', 'گل‌آلود']),
                'ambient_temperature': round(random.uniform(10, 38), 1),
                'concrete_factory': project.factory.name if project.factory else 'کارخانه نمونه',
                'specimen_type': random.choice(['cube', 'cylinder']),
                'specimen_size': random.choice(['cube_15', 'cyl_300_150', 'cyl_200_100']),
                'sampling_location': 'محل اجرا',
                'concrete_production_method': random.choice(['factory_batching', 'manual']),
                'technician': random.choice(techs),
                'responsible_engineer': eng,
                'description': f'عضو سازه‌ای {cat} پروژه {title}',
            },
        )
        # ریزش‌ها (سری نمونه‌ها) و قالب‌ها
        pour_names = ['تراک', 'تراک', 'بتن‌ریزی', 'بچ', 'شب‌کاری']
        for p in range(random.randint(1, pours_per_member)):
            pour_name = f'{pour_names[p % len(pour_names)]} #{p + 1}'
            series, _ = SamplingSeries.objects.get_or_create(
                sample=member,
                name=pour_name,
                defaults={
                    'concrete_temperature': round(random.uniform(5, 30), 1),
                    'slump': random.randint(3, 18),
                    'axis': '',
                    'has_additive': random.random() < 0.3,
                },
            )
            # قالب‌ها
            ages = mold_ages if random.random() < concurrency else mold_ages[:2]
            for age in ages:
                deadline = casting + timedelta(days=age)
                is_done = random.random() < done_rate
                is_overdue = (not is_done) and deadline < NOW and random.random() < overdue_rate
                breaking_load = round(random.uniform(25, 48), 1) if is_done else (0.0 if is_overdue else 0.0)
                mold, _ = Mold.objects.get_or_create(
                    series=series,
                    age_in_days=age,
                    defaults={
                        'mass': round(random.uniform(7.5, 8.4), 2),
                        'breaking_load': breaking_load,
                        'completed_at': deadline - timedelta(hours=random.randint(1, 48)) if is_done else None,
                        'deadline': deadline,
                        'sample_identifier': f'{cat}-{age}روزه-{pour_name}',
                        'extra_data': {},
                    },
                )
                all_molds.append(mold)
    return project, all_molds


def create_tests(project, lab_user, techs, eng, qm):
    """ایجاد آزمون‌های آزمایشگاهی برای قالب‌های انجام‌شده."""
    test_type, _ = TestType.objects.get_or_create(code='compression', defaults={'name': 'آزمون فشاری'})
    molds = Mold.objects.filter(series__sample__project=project)
    done_molds = [m for m in molds if m.is_done]
    for m in random.sample(done_molds, min(len(done_molds), 40)):
        approved = random.random() < 0.85
        status = random.choices(['completed', 'in_progress', 'planned'], weights=[7, 2, 1])[0]
        TestExecution.objects.get_or_create(
            sample=m.series.sample,
            test_type=test_type,
            machine=Equipment.objects.filter(code__startswith='DEMO-PRESS').first(),
            start_time=m.completed_at or NOW - timedelta(days=random.randint(1, 10)),
            defaults={
                'finish_time': (m.completed_at or NOW) + timedelta(hours=1),
                'temperature': round(random.uniform(18, 28), 1),
                'humidity': round(random.uniform(40, 70), 1),
                'result': m.breaking_load,
                'result_status': 'approved' if approved else random.choice(['pending', 'rejected']),
                'status': status,
                'operator': random.choice(techs),
                'approved_by': qm if approved else None,
                'approved_at': NOW - timedelta(days=random.randint(0, 5)) if approved else None,
                'notes': 'نتیجه آزمایش فشاری قالب',
            },
        )


def create_financials(project, lab_user):
    for t, desc in [('income', 'پیش‌پرداخت قرارداد'), ('income', 'پرداخت مرحله دوم'), ('expense', 'خرید مصالح آزمایشگاهی')]:
        Transaction.objects.get_or_create(
            project=project,
            description=desc,
            date=NOW - timedelta(days=random.randint(5, 90)),
            defaults={
                'type': t,
                'amount': random.randint(5, 50) * 10**7,
            },
        )


def create_notifications(lab_user, techs):
    samples = Sample.objects.filter(project__owner__user=lab_user).order_by('-id')[:3]
    for s in samples:
        Notification.objects.get_or_create(
            user=random.choice(techs),
            ntype='sample_ready',
            title=f'[نمونه] نمونه {s.code} آماده آزمون است',
            message=f'پروژه: {s.project.project_name}',
            link=f'/samples/{s.id}/',
        )
    Notification.objects.get_or_create(
        user=lab_user,
        ntype='equipment_calibration',
        title='[نمونه] کالیبراسیون دستگاه فشاری نزدیک است',
        message='موعد کالیبراسیون دستگاه DEMO-PRESS-1 در ۵ روز دیگر است',
        link='/equipment',
    )
    Notification.objects.get_or_create(
        user=lab_user,
        ntype='late_test',
        title='[نمونه] آزمون دیرکرد دارد',
        message='چند قالب دارای موعد منقضی هستند',
        link='/molds',
    )


def create_reports(project, lab_user, qm):
    if project.status in ('completed', 'active'):
        for i in range(random.randint(1, 2)):
            status = 'approved' if project.status == 'completed' else 'draft'
            report, _ = Report.objects.get_or_create(
                project=project,
                title=f'گزارش آزمایشگاهی {project.project_name} ({i + 1})',
                defaults={
                    'status': status,
                    'created_by': lab_user,
                    'approved_by': qm if status == 'approved' else None,
                    'approved_at': NOW - timedelta(days=2) if status == 'approved' else None,
                    'description': 'نتایج آزمایش‌های بتن پروژه',
                },
            )


def run():
    if is_clear_mode():
        clear_demo()

    print(clr('ساخت داده پایه (کاربران، آزمایشگاه، کارخانه، مشتری، دستگاه)...'))
    lab, lab_user, techs, eng, qm, reception, client_user, factories, clients, equipment = create_foundation()

    total_molds = 0
    projects_created = 0

    # پروژه‌های بزرگ فعال (صدها قالب) — فقط در حالت --large
    if is_large_mode():
        print(clr('ساخت پروژه بزرگ برای تست فشار...'))
        p, molds = create_project(
            lab, lab_user, techs, eng, clients, factories,
            'برج نمونه آسمان ۱۰۰', 'DEMO-LARGE-1', 'active', 30,
            60, 16, 8, [7, 14, 28, 56], concurrency=0.9, done_rate=0.3, overdue_rate=0.2,
        )
        create_financials(p, lab_user)
        total_molds += len(molds)
        projects_created += 1

    # پروژه‌های عادی
    specs = [
        # (عنوان، فایل، وضعیت، طبقات، تعداد عضو، ریزش، سن قالب، نرخ انجام، دیرکرد)
        ('برج نمونه مسکونی الف', 'DEMO-001', 'active', 12, 9, 3, [7, 14, 28], 0.55, 0.12),
        ('مجتمع تجاری نمونه ب', 'DEMO-002', 'active', 5, 7, 3, [7, 14, 28], 0.6, 0.1),
        ('ساختمان اداری نمونه ج', 'DEMO-003', 'on_hold', 8, 6, 2, [7, 14, 28], 0.4, 0.25),
        ('پروژه نمونه تکمیل‌شده', 'DEMO-004', 'completed', 6, 6, 2, [7, 14, 28], 0.95, 0.0),
        ('پروژه نمونه لغو/بایگانی', 'DEMO-005', 'cancelled', 4, 3, 1, [7, 14], 0.2, 0.3),
        ('پروژه نمونه خالی', 'DEMO-006', 'active', 3, 0, 0, [7, 14, 28], 0.0, 0.0),
        ('پروژه نمونه نزدیک تکمیل', 'DEMO-007', 'active', 7, 7, 2, [7, 14, 28], 0.9, 0.02),
        ('پروژه کوچک نمونه', 'DEMO-008', 'active', 2, 2, 2, [7, 14, 28], 0.3, 0.2),
    ]
    for title, file_no, status, floors, members, pours, ages, done, overdue in specs:
        p, molds = create_project(
            lab, lab_user, techs, eng, clients, factories,
            title, file_no, status, floors, 40, members, pours, ages,
            concurrency=0.75, done_rate=done, overdue_rate=overdue,
            empty=(members == 0),
        )
        if molds:
            create_financials(p, lab_user)
            create_tests(p, lab_user, techs, eng, qm)
            create_reports(p, lab_user, qm)
        total_molds += len(molds)
        projects_created += 1

    create_notifications(lab_user, techs)

    # لاگ فعالیت ورود
    ActivityLog.objects.get_or_create(
        user=lab_user,
        action='login',
        content_type='auth.user',
        object_id=lab_user.id,
        object_repr=f'[نمونه] ورود {lab_user.username}',
        new_value={'username': lab_user.username},
    )

    print(clr('=' * 50))
    print(clr(f'پروژه‌ها: {projects_created}'))
    print(clr(f'قالب‌ها: {total_molds}'))
    print(clr(f'کاربران: {User.objects.filter(username__startswith=DEMO_USER_PREFIX).count()}'))
    print(clr(f'دستگاه‌ها: {Equipment.objects.filter(code__startswith="DEMO").count()}'))
    print(clr('داده نمونه با موفقیت ساخته شد.'))


if __name__ == '__main__':
    run()
