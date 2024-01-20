from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status


class CSRFTokenTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_get_csrf_token(self):
        response = self.client.get(reverse('csrf'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('csrfToken' in response.data)
