from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from api.models import User
from ..constants import form_field_names


# Add form field names here
FIRST_NAME = form_field_names.FIRST_NAME
LAST_NAME = form_field_names.LAST_NAME
EMAIL = form_field_names.EMAIL
COMPANY = form_field_names.COMPANY
INTERESTS = form_field_names.INTERESTS
CONTACT_NUMBER = form_field_names.CONTACT_NUMBER
PASSWORD = form_field_names.PASSWORD


# Add optional test cases setup function here
def duplicate_email_setup():
    User.objects.create(
        first_name="Duplicate",
        last_name="User",
        email="duplicate@test.test",
        company="Test Company",
        interests="Test Interests",
        contact_number="+65 8888 7777"
    )


# Add test cases dictionary here with the following format:
# "Test name": {"field": "<input field name to change>", "value": "<value to change to>", "expected_response_status_code": "<expected response status code>", "expected_response": "<optional expected response>", "setup_function": "<optional setup function>"}
TEST_CASES_DICT = {
    "Create Valid User": {"field": FIRST_NAME, "value": "Test One", "expected_response_status_code": status.HTTP_201_CREATED},
    "Create User with Invalid First Name": {"field": FIRST_NAME, "value": "T3st", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"first_name": ["Name should not contain numbers or special characters."]}},
    "Create User with Invalid Last Name": {"field": LAST_NAME, "value": "U$er", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"last_name": ["Name should not contain numbers or special characters."]}},
    "Create User with Invalid Email": {"field": EMAIL, "value": "xxxx@xxxx", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"email": ["Enter a valid email address."]}},
    "Create User with Duplicate Email": {"field": EMAIL, "value": "duplicate@test.test", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"email": ["user with this email already exists."]}, "setup_function": duplicate_email_setup},
    "Create User with Empty Company": {"field": COMPANY, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"company": ["This field may not be blank."]}},
    "Create User with Empty Interests": {"field": INTERESTS, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"interests": ["This field may not be blank."]}},
    "Create User with Invalid Contact Number": {"field": CONTACT_NUMBER, "value": "+65 1888 7777", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"contact_number": ["Invalid contact number."]}},
    "Create User with Password Missing Number": {"field": PASSWORD, "value": "Ab#defgh", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 number.']"}},
    "Create User with Password Missing Letter": {"field": PASSWORD, "value": "12#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 letter.']"}},
    "Create User with Password Missing Uppercase": {"field": PASSWORD, "value": "ab#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 uppercase letter.']"}},
    "Create User with Password Missing Lowercase": {"field": PASSWORD, "value": "AB#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 lowercase letter.']"}},
    "Create User with Password Missing Special": {"field": PASSWORD, "value": "Ab345678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 special character: !@#$%^&*()_+']"}},
    "Create User with Password Too Short": {"field": PASSWORD, "value": "Ab#4567", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['This password is too short. It must contain at least 8 characters.']"}},
}


class CreateUserTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Initialize the test client and the payload
        cls.client = APIClient()
        cls.valid_payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@test.test",
            "password": "Ab#45678",
            "company": "Test Company",
            "interests": "Test Interests",
            "contact_number": "+65 8888 7777",
        }


def create_test_function(test_case):
    def test_function(self):
        # If a setup function is specified, run the setup function
        if "setup_function" in test_case:
            test_case["setup_function"]()

        # Create a payload with the field and value to edit
        payload = self.valid_payload.copy()
        payload[test_case["field"]] = test_case["value"]

        response = self.client.post(
            reverse("user-list"),
            data=payload,
        )

        self.assertEqual(response.status_code, test_case["expected_response_status_code"])
        if "expected_response" in test_case:
            self.assertEqual(response.data, test_case["expected_response"])

    return test_function


# Dynamically create test functions based on the test cases dictionary
for test_name, test_case in TEST_CASES_DICT.items():
    test_function = create_test_function(test_case)
    test_function.__name__ = f'test_{test_name.lower().replace(" ", "_")}'
    setattr(CreateUserTestCase, test_function.__name__, test_function)
