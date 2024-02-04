from rest_framework.test import APITestCase, APIClient
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from rest_framework import status
from api.models import User


class ViewUserTestCase(APITestCase):
    TEST_USERS_LIST = [
        {
            "id": 1,
            "email": "test@test.test",
            "first_name": "Test One",
            "last_name": "User One",
            "company": "Test Company",
            "interests": "Code",
            "profile_pic": None,
            "contact_number": "+65 9123 4567"
        },
        {
            "id": 2,
            "email": "test2@test.test",
            "first_name": "Test Two",
            "last_name": "User Two",
            "company": "Test Company",
            "interests": "Finance",
            "profile_pic": None,
            "contact_number": "+65 9123 9999"
        }
    ]

    def test_user_view(self):
        self.client = APIClient()

        # loop through the test user list and test the user view
        for user_data in self.TEST_USERS_LIST:
            user = User.objects.create(
                id=user_data['id'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                company=user_data['company'],
                interests=user_data['interests'],
                profile_pic=user_data['profile_pic'],
                contact_number=user_data['contact_number']
            )

            user_token = RefreshToken.for_user(user)
            user_access_token = str(user_token.access_token)

            user_response = self.client.get(
                reverse('user-detail', kwargs={'pk': user_data['id']}), HTTP_AUTHORIZATION='Bearer ' + user_access_token)

            self.assertEqual(user_response.status_code, status.HTTP_200_OK)
            self.assertEqual(user_response.data, user_data)
