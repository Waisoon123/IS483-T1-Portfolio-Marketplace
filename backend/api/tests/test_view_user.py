from rest_framework.test import APITestCase, APIClient
from rest_framework.response import Response
from django.urls import reverse
from rest_framework import status
from api.models import User

class TestUserView(APITestCase):
    def test_user_view(self):
        
        self.client=APIClient()

        #Populating test server with data for testing.
        User.objects.create(
            id="1",
            first_name='wenhai',
            last_name='oh',
            email='wen@hai.oh',
            password='Ab#45678',
            company='smu',
            interests='-',
            profile_pic=None,
            contact_number='-',
        )

        User.objects.create(
            id="62",
            first_name='test',
            last_name='ing',
            email='5@email.com',
            password='Ab#45678',
            company='smu',
            interests='alan',
            profile_pic=None,
            contact_number='+65 9123 9999',
        )

        #querying the test server for user details based on ID
        response = self.client.get(reverse('user-detail', kwargs={'pk': "1"}))
        response1 = self.client.get(reverse('user-detail', kwargs={'pk': 62}))

        #Checking to see if the HTTP requst is successful.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        #Creating the expected response from the query to compare with the actual response.
        expected_data_response = {
            "id": 1,
            "email": "wen@hai.oh",
            "first_name": "wenhai",
            "last_name": "oh",
            "company": "smu",
            "interests": "-",
            "profile_pic": None,
            "contact_number": "-"
            }
        
        expected_data_response1 = {
            "id": 62,
            "email": "5@email.com",
            "first_name": "test",
            "last_name": "ing",
            "company": "smu",
            "interests": "alan",
            "profile_pic": None,
            "contact_number": "+65 9123 9999"
            }
        
        #Comparing the expected response with the actual response.
        self.assertEqual(response.data, expected_data_response)
        self.assertEqual(response1.data, expected_data_response1)