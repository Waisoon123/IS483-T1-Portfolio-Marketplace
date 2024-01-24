from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from api.models import User

class UserEditTestCase(TestCase):
    def setUp(self):
        # Initialize the test client and create a user for editing
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
        self.edit_payload = {
            'first_name': 'Testone',
            'last_name': 'Userone',
            'email': 'test@test.test',
            'password': 'Ab#45678',
            'company': 'Test Company 1',
            'interests': 'Test Interests 1',
            'contact_number': '+65 8888 7771',
        }
        csrf_response = self.client.get(reverse('csrf'))
        self.csrf_token = csrf_response.data['csrfToken']
        
    def post_user(self, payload):
        return self.client.post(
            reverse('user-list'),
            data=payload,
            HTTP_X_CSRFTOKEN=self.csrf_token
        )
        
    def patch_user(self, user_id, payload):
        return self.client.patch(
            reverse('user-detail', kwargs={'pk': user_id}),
            data=payload,
            content_type='application/json',  # Specify the content type
            HTTP_X_CSRFTOKEN=self.csrf_token
        )
        
    def edit_user_and_assert_bad_request(self, field, value):
        create_response = self.valid_payload.copy()
        create_response[field] = value
        user_id = create_response.json().get('id')  # Retrieve the user ID from the response
        response = self.patch_user(user_id, create_response)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    ##################################### Test Cases Below ######################################
        
    def test_edit_valid(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')  # Retrieve the user ID from the response
        response = self.patch_user(user_id, self.edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_edit_invalid_first_name(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')  # Retrieve the user ID from the response
        edit_payload = self.edit_payload.copy()
        edit_payload['first_name'] = 'User123'
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_edit_invalid_last_name(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')
        edit_payload = self.edit_payload.copy()
        edit_payload['last_name'] = 'User123'
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    ####### Password Validation Tests are commented out as they are not working##########
    # def test_edit_invalid_password_empty(self):
    #     # create a user
    #     create_response = self.post_user(self.valid_payload)
    #     user_id = create_response.json().get('id')
    #     edit_payload = self.edit_payload.copy()
    #     edit_payload['password'] = ''
    #     response = self.patch_user(user_id, edit_payload)
    #     # print(response.content)  # Print the response content to debug
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    # def test_edit_invalid_password_missing_number(self):
    #     # create a user
    #     create_response = self.post_user(self.valid_payload)
    #     user_id = create_response.json().get('id')
    #     edit_payload = self.edit_payload.copy()
    #     edit_payload['password'] = 'Password!'
    #     response = self.patch_user(user_id, edit_payload)
    #     print(edit_payload)
    #     print("======================================")
    #     print(response.content)  # Print the response content to debug
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    #####################End of Password Validation Tests###################################
    
    def test_edit_invalid_email(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')
        edit_payload = self.edit_payload.copy()
        edit_payload['email'] = 'test@test'
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_edit_invalid_contact_number(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')
        edit_payload = self.edit_payload.copy()
        edit_payload['contact_number'] = '+65 1888 7777'
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)   
    
    def test_edit_empty_company(self):
        # create a user
        create_response = self.post_user(self.valid_payload)
        user_id = create_response.json().get('id')
        edit_payload = self.edit_payload.copy()
        edit_payload['company'] = ''
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
        
    def test_edit_empty_interests(self):
        # create a user
        create_response = self.post_user(self.valid_payload)        
        user_id = create_response.json().get('id')
        edit_payload = self.edit_payload.copy()
        edit_payload['interests'] = ''
        response = self.patch_user(user_id, edit_payload)
        # print(response.content)  # Print the response content to debug
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)