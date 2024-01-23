from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from api.models import User


class UserViewSetTestCase(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.valid_payload = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@test.test',
            'password': 'Ab#45678',
            'company': 'Test Company',
            'interests': 'Test Interests',
            'contact_number': '+65 8888 7777',
        }
        csrf_response = self.client.get(reverse('csrf'))
        self.csrf_token = csrf_response.data['csrfToken']

    def post_user(self, payload):
        return self.client.post(
            reverse('user-list'),
            data=payload,
            HTTP_X_CSRFTOKEN=self.csrf_token
        )

    def create_user_and_assert_bad_request(self, field, value):
        payload = self.valid_payload.copy()
        payload[field] = value
        response = self.post_user(payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_valid_user(self):
        response = self.post_user(self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_user_with_invalid_first_name(self):
        self.create_user_and_assert_bad_request('first_name', 'T3st')

    def test_create_user_with_invalid_last_name(self):
        self.create_user_and_assert_bad_request('last_name', 'Us3r')

    def test_create_user_with_invalid_email(self):
        self.create_user_and_assert_bad_request('email', 'test@test')

    def test_create_user_with_duplicate_email(self):
        User.objects.create(
            first_name='Test',
            last_name='User',
            email='test@test.test',
            password='Ab#45678',
            company='Test Company',
            interests='Test Interests',
            contact_number='+65 8888 7777',
        )
        self.create_user_and_assert_bad_request('email', 'test@test.test')

    def test_create_user_with_password_missing_number(self):
        self.create_user_and_assert_bad_request('password', 'Ab#defgh')

    def test_create_user_with_password_missing_letter(self):
        self.create_user_and_assert_bad_request('password', '12#45678')

    def test_create_user_with_password_missing_uppercase(self):
        self.create_user_and_assert_bad_request('password', 'ab#45678')

    def test_create_user_with_password_missing_lowercase(self):
        self.create_user_and_assert_bad_request('password', 'AB#45678')

    def test_create_user_with_password_missing_special(self):
        self.create_user_and_assert_bad_request('password', 'Ab345678')

    def test_create_user_with_password_too_short(self):
        self.create_user_and_assert_bad_request('password', 'Ab#4567')

    def test_create_user_with_invalid_contact_number(self):
        self.create_user_and_assert_bad_request('contact_number', '+65 1888 7777')

    def test_create_user_with_empty_company(self):
        self.create_user_and_assert_bad_request('company', '')

    def test_create_user_with_empty_interests(self):
        self.create_user_and_assert_bad_request('interests', '')
