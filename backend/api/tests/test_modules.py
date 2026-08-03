from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from api.models import (
    Project, Sample, Factory, Equipment, TestExecution, TestType, Report,
    Notification, AcceptanceCriteria, LabRequest,
)
from api.roles import FACTORY_MANAGER, QUALITY_MANAGER, TECHNICIAN
from api.services.qc_service import QcService
from api.tests.test_access import project_data
from api.tests.test_roles import AuthBase


class QcServiceTests(APITestCase):

    def test_analyze_stats(self):
        result = QcService.analyze([100, 200, 300, 400, 500, 10000])
        self.assertEqual(result['count'], 6)
        self.assertIsNotNone(result['mean'])
        self.assertEqual(len(result['outliers']), 1)
        self.assertAlmostEqual(result['outliers'][0], 10000)

    def test_check_criteria(self):
        criteria = AcceptanceCriteria(name='استاندارد ACI', params={'min_strength': 300, 'max_stdev': 20})
        result = QcService.check_criteria([310, 320, 330], criteria)
        self.assertTrue(result['passed'])
        failed = QcService.check_criteria([100, 110], criteria)
        self.assertFalse(failed['passed'])


class NewModulesTests(AuthBase):

    def setUp(self):
        self.lab, self.manager = self.make_lab()
        self.tech = self.make_user('tech1', role=TECHNICIAN, lab=self.lab)
        self.qm = self.make_user('qm1', role=QUALITY_MANAGER, lab=self.lab)
        self.project = Project.objects.create(owner=self.lab, **project_data(self.lab))
        self.sample = Sample.objects.create(
            project=self.project, date=timezone.now(), sampling_volume=70,
            cement_grade='350', category='ستون1', weather_condition='آفتابی',
            concrete_factory='پارس',
        )
        self.test_type, _ = TestType.objects.get_or_create(code='compression', defaults={'name': 'فشاری'})

    def test_lab_request_flow(self):
        self.client.force_authenticate(self.manager)
        response = self.client.post('/api/lab-requests/', {
            'project': self.project.id,
            'requested_tests': [self.test_type.id],
            'priority': 'high',
            'due_date': (timezone.now() + timedelta(days=7)).isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        req = LabRequest.objects.get(id=response.data['id'])
        self.assertTrue(req.request_number)
        self.assertEqual(req.requested_by, self.manager)

    def test_report_versioning(self):
        report = Report.objects.create(project=self.project, title='گزارش', created_by=self.manager)
        self.client.force_authenticate(self.qm)
        response = self.client.patch(f'/api/reports/{report.id}/', {'title': 'گزارش نهایی'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        report.refresh_from_db()
        self.assertEqual(report.version, 2)
        self.assertEqual(report.revisions.count(), 1)

    def test_equipment_scope(self):
        Equipment.objects.create(code='EQ9', name='دستگاه داخلی')
        self.client.force_authenticate(self.tech)
        response = self.client.get('/api/equipment/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)

    def test_factory_manager_edits_own_factory(self):
        fm = self.make_user('fm1', role=FACTORY_MANAGER)
        factory = Factory.objects.create(name='کارخانه آ', manager=fm)
        self.client.force_authenticate(fm)
        response = self.client.patch(f'/api/factories/{factory.id}/', {'phone_number': '026'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        other = Factory.objects.create(name='کارخانه ب', manager=self.make_user('fm2', role=FACTORY_MANAGER))
        response = self.client.patch(f'/api/factories/{other.id}/', {'phone_number': '027'}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_sample_notification_on_ready(self):
        self.client.force_authenticate(self.tech)
        self.client.patch(f'/api/samples/{self.sample.id}/', {'status': 'ready_for_test'}, format='json')
        self.assertTrue(Notification.objects.filter(ntype='sample_ready').exists())

    def test_qc_endpoint(self):
        TestExecution.objects.create(
            sample=self.sample, test_type=self.test_type, operator=self.tech,
            start_time=timezone.now(), result=310, status='completed',
        )
        self.client.force_authenticate(self.manager)
        response = self.client.get(f'/api/qc/analysis/?sample={self.sample.id}&test_type={self.test_type.id}')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['statistics']['count'], 1)

    def test_report_pdf(self):
        report = Report.objects.create(project=self.project, title='گزارش پی‌دی‌اف', created_by=self.manager)
        self.client.force_authenticate(self.manager)
        response = self.client.get(f'/api/reports/{report.id}/pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
