from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from api.models import LabProfile, Factory, Profile
from api.roles import ADMIN, LAB_MANAGER, TECHNICIAN, FACTORY_MANAGER, CLIENT, SUPERVISOR, QUALITY_MANAGER, get_role
from api.services.auth_service import ProfileService


class AuthBase(APITestCase):
    def make_user(self, username, role=CLIENT, lab=None, factory=None, password='pass12345'):
        user = User.objects.create_user(username=username, password=password)
        ProfileService.ensure_profile(user, role=role, lab=lab, factory=factory)
        return user

    def make_lab(self, name='آزمایشگاه نمونه'):
        manager = self.make_user(f'mgr_{name}', role=LAB_MANAGER)
        lab = LabProfile.objects.create(
            user=manager, lab_name=name, lab_mobile_number='0912',
            lab_address='آدرس', province='تهران', city='تهران',
        )
        manager.profile.lab = lab
        manager.profile.save()
        return lab, manager


class RegistrationTests(AuthBase):

    def test_register_lab_manager(self):
        response = self.client.post('/api/register/', {
            'username': 'labuser', 'password': 'pass12345',
            'role': LAB_MANAGER, 'first_name': 'علی',
            'lab_name': 'آزمایشگاه مرکزی', 'lab_mobile_number': '0912',
            'lab_address': 'تهران', 'province': 'تهران', 'city': 'تهران',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='labuser')
        self.assertTrue(hasattr(user, 'lab_profile'))
        self.assertTrue(user.lab_profile.lab_code)
        self.assertEqual(get_role(user), LAB_MANAGER)
        self.assertEqual(user.profile.lab, user.lab_profile)

    def test_register_technician_with_lab_code(self):
        lab, _ = self.make_lab()
        response = self.client.post('/api/register/', {
            'username': 'tech', 'password': 'pass12345',
            'role': TECHNICIAN, 'lab_code': lab.lab_code,
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='tech')
        self.assertEqual(get_role(user), TECHNICIAN)
        self.assertEqual(user.profile.lab_id, lab.id)

    def test_register_technician_invalid_lab_code(self):
        response = self.client.post('/api/register/', {
            'username': 'tech2', 'password': 'pass12345',
            'role': TECHNICIAN, 'lab_code': 'INVALID',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_register_factory_manager(self):
        response = self.client.post('/api/register/', {
            'username': 'factoryboss', 'password': 'pass12345',
            'role': FACTORY_MANAGER,
            'factory_name': 'کارخانه بتن پارس', 'factory_address': 'کرج',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='factoryboss')
        self.assertEqual(get_role(user), FACTORY_MANAGER)
        self.assertIsNotNone(user.factory)
        self.assertEqual(user.profile.factory_id, user.factory.id)

    def test_register_client(self):
        response = self.client.post('/api/register/', {
            'username': 'clientuser', 'password': 'pass12345', 'role': CLIENT,
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(get_role(User.objects.get(username='clientuser')), CLIENT)

    def test_register_admin_forbidden(self):
        response = self.client.post('/api/register/', {
            'username': 'hacker', 'password': 'pass12345', 'role': ADMIN,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_admin_command(self):
        from django.core.management import call_command
        call_command('create_admin', 'rootadmin', password='x12345678')
        user = User.objects.get(username='rootadmin')
        self.assertEqual(get_role(user), ADMIN)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class AdminUserManagementTests(AuthBase):

    def test_admin_creates_user_with_role(self):
        admin = self.make_user('theadmin', role=ADMIN)
        self.client.force_authenticate(admin)
        response = self.client.post('/api/users/', {
            'username': 'engineer1', 'password': 'pass12345', 'role': 'engineer',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(get_role(User.objects.get(username='engineer1')), 'engineer')

    def test_non_admin_forbidden(self):
        lab, manager = self.make_lab()
        self.client.force_authenticate(manager)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, 403)

    def test_admin_changes_role(self):
        admin = self.make_user('theadmin', role=ADMIN)
        client = self.make_user('plainclient', role=CLIENT)
        self.client.force_authenticate(admin)
        response = self.client.patch(f'/api/users/{client.id}/', {'role': SUPERVISOR}, format='json')
        self.assertEqual(response.status_code, 200)
        client.refresh_from_db()
        self.assertEqual(get_role(client), SUPERVISOR)
