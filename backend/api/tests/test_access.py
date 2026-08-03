from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from api.models import Project, Sample, Factory, Equipment, TestExecution, TestType, Report
from api.roles import (
    ADMIN, LAB_MANAGER, TECHNICIAN, FACTORY_MANAGER, SUPERVISOR, CLIENT,
    QUALITY_MANAGER, ENGINEER,
)
from api.tests.test_roles import AuthBase


def project_data(lab, **extra):
    data = {
        'file_number': 'F-100',
        'project_name': 'برج آسمان',
        'client_name': 'کارفرما',
        'client_phone_number': '021',
        'supervisor_name': 'ناظر',
        'supervisor_phone_number': '021',
        'requester_name': 'درخواست دهنده',
        'requester_phone_number': '021',
        'municipality_zone': 'منطقه 1',
        'address': 'تهران',
        'project_usage_type': 'مسکونی',
        'floor_count': 5,
        'occupied_area': 100,
        'contract_price': 1000000,
    }
    data.update(extra)
    return data


class AccessControlTests(AuthBase):

    def setUp(self):
        self.lab, self.manager = self.make_lab()
        self.tech = self.make_user('tech1', role=TECHNICIAN, lab=self.lab)
        self.qm = self.make_user('qm1', role=QUALITY_MANAGER, lab=self.lab)
        self.client_user = self.make_user('client1', role=CLIENT)
        self.supervisor = self.make_user('sup1', role=SUPERVISOR)
        self.factory_manager = self.make_user('facmgr1', role=FACTORY_MANAGER)
        self.factory = Factory.objects.create(name='کارخانه بتن پارس', manager=self.factory_manager)
        self.admin = self.make_user('adminx', role=ADMIN)

        self.project = Project.objects.create(
            owner=self.lab,
            client_user=self.client_user,
            supervisor_user=self.supervisor,
            factory=self.factory,
            **project_data(self.lab),
        )
        self.other_project = Project.objects.create(owner=self.lab, **project_data(self.lab, file_number='F-200'))

    def test_client_sees_only_own_projects(self):
        self.client.force_authenticate(self.client_user)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.project.id)

    def test_supervisor_sees_only_supervised(self):
        self.client.force_authenticate(self.supervisor)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.data['count'], 1)

    def test_factory_manager_sees_only_factory_projects(self):
        self.client.force_authenticate(self.factory_manager)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.data['count'], 1)

    def test_technician_sees_lab_projects(self):
        self.client.force_authenticate(self.tech)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.data['count'], 2)

    def test_admin_sees_all(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.data['count'], 2)

    def test_technician_cannot_create_project(self):
        self.client.force_authenticate(self.tech)
        response = self.client.post('/api/projects/', project_data(self.lab), format='json')
        self.assertEqual(response.status_code, 403)

    def test_client_cannot_update_project(self):
        self.client.force_authenticate(self.client_user)
        response = self.client.patch(f'/api/projects/{self.project.id}/', {'project_name': 'X'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_technician_can_create_sample_in_lab_project(self):
        self.client.force_authenticate(self.tech)
        response = self.client.post('/api/samples/', {
            'project': self.project.id,
            'date': timezone.now().isoformat(),
            'sampling_volume': 70,
            'cement_grade': '350',
            'category': 'ستون1',
            'weather_condition': 'آفتابی',
            'concrete_factory': 'پارس',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)

    def test_technician_cannot_create_sample_in_other_lab(self):
        other_lab, other_mgr = self.make_lab(name='دیگر')
        other_project = Project.objects.create(owner=other_lab, **project_data(other_lab))
        self.client.force_authenticate(self.tech)
        response = self.client.post('/api/samples/', {
            'project': other_project.id,
            'date': timezone.now().isoformat(),
            'sampling_volume': 70,
            'cement_grade': '350',
            'category': 'ستون1',
            'weather_condition': 'آفتابی',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_full_data_scoping_for_client(self):
        self.client.force_authenticate(self.client_user)
        response = self.client.get('/api/full-data/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['projects']), 1)
        self.assertEqual(response.data['user']['role'], CLIENT)


class LabFeatureTests(AuthBase):

    def setUp(self):
        self.lab, self.manager = self.make_lab()
        self.tech = self.make_user('tech1', role=TECHNICIAN, lab=self.lab)
        self.project = Project.objects.create(owner=self.lab, **project_data(self.lab))
        self.sample = Sample.objects.create(
            project=self.project, date=timezone.now(), sampling_volume=70,
            cement_grade='350', category='ستون1', weather_condition='آفتابی',
            concrete_factory='پارس',
        )
        self.equipment = Equipment.objects.create(
            code='EQ1', name='دستگاه فشاری',
            next_calibration_date=timezone.now().date() + timedelta(days=30),
        )
        self.test_type, _ = TestType.objects.get_or_create(code='compression', defaults={'name': 'آزمون فشاری'})

    def test_test_execution_rejects_expired_equipment(self):
        expired = Equipment.objects.create(
            code='EQ2', name='دستگاه قدیمی',
            next_calibration_date=timezone.now().date() - timedelta(days=1),
        )
        self.client.force_authenticate(self.tech)
        response = self.client.post('/api/test-executions/', {
            'sample': self.sample.id, 'test_type': self.test_type.id,
            'machine': expired.id, 'start_time': timezone.now().isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('machine', str(response.data))

    def test_technician_cannot_approve_test(self):
        test = TestExecution.objects.create(
            sample=self.sample, test_type=self.test_type,
            operator=self.tech, start_time=timezone.now(),
            result=320, status='completed',
        )
        self.client.force_authenticate(self.tech)
        response = self.client.post(f'/api/test-executions/{test.id}/approve/')
        self.assertEqual(response.status_code, 403)

    def test_quality_manager_can_approve_test(self):
        test = TestExecution.objects.create(
            sample=self.sample, test_type=self.test_type,
            operator=self.tech, start_time=timezone.now(),
            result=320, status='completed',
        )
        qm = self.make_user('qm2', role=QUALITY_MANAGER, lab=self.lab)
        self.client.force_authenticate(qm)
        response = self.client.post(f'/api/test-executions/{test.id}/approve/')
        self.assertEqual(response.status_code, 200, response.data)
        test.refresh_from_db()
        self.assertEqual(test.result_status, 'approved')

    def test_report_approval_permission(self):
        report = Report.objects.create(
            project=self.project, title='گزارش ۱', created_by=self.manager,
        )
        self.client.force_authenticate(self.tech)
        response = self.client.post(f'/api/reports/{report.id}/approve/')
        self.assertEqual(response.status_code, 403)

        self.client.force_authenticate(self.make_user('qm3', role=QUALITY_MANAGER, lab=self.lab))
        response = self.client.post(f'/api/reports/{report.id}/approve/')
        self.assertEqual(response.status_code, 200, response.data)
        report.refresh_from_db()
        self.assertEqual(report.status, 'approved')
        self.assertIn('signed_by', report.digital_signature)

    def test_dashboard_stats(self):
        self.client.force_authenticate(self.manager)
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['projects']['total'], 1)
        self.assertEqual(response.data['samples']['total'], 1)
