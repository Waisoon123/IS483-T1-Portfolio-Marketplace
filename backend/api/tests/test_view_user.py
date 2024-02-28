from rest_framework.test import APITestCase, APIClient
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from rest_framework import status
from api.models import User, Interest


class ViewUserTestCase(APITestCase):
    TEST_USERS_LIST = [
        {
            "id": 1,
            "email": "test@test.test",
            "first_name": "Test One",
            "last_name": "User One",
            "company": "Test Company",
            "interests": [{"id": 1, "name": "Test Interest 1"}],
            "profile_pic": None,
            "contact_number": "+65 9123 4567"
        },
        {
            "id": 2,
            "email": "test2@test.test",
            "first_name": "Test Two",
            "last_name": "User Two",
            "company": "Test Company",
            "interests": [{"id": 2, "name": "Test Interest 2"}],
            "profile_pic": None,
            "contact_number": "+65 9123 9999"
        }
    ]

    def test_user_view(self):
        self.client = APIClient()

        self.interests = [
            Interest.objects.create(id=1, name="Test Interest 1"),
            Interest.objects.create(id=2, name="Test Interest 2"),
            Interest.objects.create(id=3, name="Test Interest 3"),
        ]
        # loop through the test user list and test the user view
        for user_data in self.TEST_USERS_LIST:
            user = User.objects.create(
                id=user_data['id'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                company=user_data['company'],
                profile_pic=user_data['profile_pic'],
                contact_number=user_data['contact_number']
            )

            interests_data = user_data['interests']
            interest_ids = [interest['id'] for interest in interests_data]
            existing_interests = Interest.objects.filter(id__in=interest_ids)
            user.interests.set(existing_interests)
            user.save()

            user_token = RefreshToken.for_user(user)
            user_access_token = str(user_token.access_token)

            user_response = self.client.get(
                reverse('user-detail', kwargs={'pk': user_data['id']}), HTTP_AUTHORIZATION='Bearer ' + user_access_token)

            self.assertEqual(user_response.status_code, status.HTTP_200_OK)
            self.assertEqual(user_response.data, user_data)
