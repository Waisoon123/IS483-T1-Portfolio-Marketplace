from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from api.models import User


class UserViewSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
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

    def create_user_and_assert_bad_request(self, field, value, expected_response):
        payload = self.valid_payload.copy()
        payload[field] = value
        response = self.post_user(payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, expected_response)

    def test_create_valid_user(self):
        response = self.post_user(self.valid_payload)
        expected_response = {
            'id': 1,
            'email': 'test@test.test',
            'first_name': 'Test',
            'last_name': 'User',
            'company': 'Test Company',
            'interests': 'Test Interests',
            'profile_pic': None,
            'contact_number': '+65 8888 7777'
        }
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, expected_response)

    def test_create_user_with_invalid_first_name(self):
        expected_response = {
            "first_name": [
                "Name should not contain numbers or special characters."
            ]
        }
        self.create_user_and_assert_bad_request('first_name', 'T3st', expected_response)

    def test_create_user_with_invalid_last_name(self):
        expected_response = {
            "last_name": [
                "Name should not contain numbers or special characters."
            ]
        }
        self.create_user_and_assert_bad_request('last_name', 'Us3r', expected_response)

    def test_create_user_with_invalid_email(self):
        expected_response = {
            "email": [
                "Enter a valid email address."
            ]
        }
        self.create_user_and_assert_bad_request('email', 'test@test', expected_response)

    def test_create_user_with_duplicate_email(self):
        User.objects.create(
            id="101",
            first_name='Test',
            last_name='User',
            email='test@test.duplicate',
            password='Ab#45678',
            company='Test Company',
            interests='Test Interests',
            contact_number='+65 8888 7777',
        )
        expected_response = {
            "email": [
                "user with this email already exists."
            ]
        }
        self.create_user_and_assert_bad_request('email', 'test@test.duplicate', expected_response)

    def test_create_user_with_password_missing_number(self):
        expected_response = {
            "detail": "['Password must contain at least 1 number.']"
        }
        self.create_user_and_assert_bad_request('password', 'Ab#defgh', expected_response)

    def test_create_user_with_password_missing_letter(self):
        expected_response = {
            "detail": "['Password must contain at least 1 letter.']"
        }
        self.create_user_and_assert_bad_request('password', '12#45678', expected_response)

    def test_create_user_with_password_missing_uppercase(self):
        expected_response = {
            "detail": "['Password must contain at least 1 uppercase letter.']"
        }
        self.create_user_and_assert_bad_request('password', 'ab#45678', expected_response)

    def test_create_user_with_password_missing_lowercase(self):
        expected_response = {
            "detail": "['Password must contain at least 1 lowercase letter.']"
        }
        self.create_user_and_assert_bad_request('password', 'AB#45678', expected_response)

    def test_create_user_with_password_missing_special(self):
        expected_response = {
            "detail": "['Password must contain at least 1 special character: !@#$%^&*()_+']"
        }
        self.create_user_and_assert_bad_request('password', 'Ab345678', expected_response)

    def test_create_user_with_password_too_short(self):
        expected_response = {
            "detail": "['This password is too short. It must contain at least 8 characters.']"
        }
        self.create_user_and_assert_bad_request('password', 'Ab#4567', expected_response)

    def test_create_user_with_invalid_contact_number(self):
        expected_response = {
            "contact_number": [
                "Invalid contact number."
            ]
        }
        self.create_user_and_assert_bad_request('contact_number', '+65 1888 7777', expected_response)

    def test_create_user_with_empty_company(self):
        expected_response = {
            "company": [
                "This field may not be blank."
            ]
        }
        self.create_user_and_assert_bad_request('company', '', expected_response)

    def test_create_user_with_empty_interests(self):
        expected_response = {
            "interests": [
                "This field may not be blank."
            ]
        }
        self.create_user_and_assert_bad_request('interests', '', expected_response)
