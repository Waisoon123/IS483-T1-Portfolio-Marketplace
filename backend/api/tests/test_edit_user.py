from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
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
# "Test name": {"field": "<input field name to edit>", "value": "<value to edit to>", "expected_response_status_code": "<expected response status code>", "expected_response": "<optional expected response>", "setup_function": "<optional setup function>"}
TEST_CASES_DICT = {
    "Edit with valid first name": {"field": FIRST_NAME, "value": "Test One", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid first name": {"field": FIRST_NAME, "value": "T3st", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"first_name": ["Name should not contain numbers or special characters."]}},
    "Edit with valid last name": {"field": LAST_NAME, "value": "User One", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid last name": {"field": LAST_NAME, "value": "U$er", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"last_name": ["Name should not contain numbers or special characters."]}},
    "Edit with valid email": {"field": EMAIL, "value": "test1@test.test", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid email": {"field": EMAIL, "value": "test@test", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"email": ["Enter a valid email address."]}},
    "Edit with duplicate email": {"field": EMAIL, "value": "duplicate@test.test", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"email": ["user with this email already exists."]}, "setup_function": duplicate_email_setup},
    "Edit with valid company": {"field": COMPANY, "value": "Test Company One", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid empty company": {"field": COMPANY, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"company": ["This field may not be blank."]}},
    "Edit with valid interests": {"field": INTERESTS, "value": "Test Interests One", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid empty interests": {"field": INTERESTS, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"interests": ["This field may not be blank."]}},
    "Edit with valid contact number": {"field": CONTACT_NUMBER, "value": "+65 9123 4567", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid contact number": {"field": CONTACT_NUMBER, "value": "+65 1123 9999", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"contact_number": ["Invalid contact number."]}},
    "Edit with valid password": {"field": PASSWORD, "value": "Ab#456789", "expected_response_status_code": status.HTTP_200_OK},
    "Edit with invalid current password": {"field": PASSWORD, "value": "Ab#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"password": ["New password must be different from the current one."]}},
    "Edit with invalid empty password": {"field": PASSWORD, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"password": ["This field may not be blank."]}},
    "Edit with invalid password missing number": {"field": PASSWORD, "value": "Ab#defgh", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 number.']"}},
    "Edit with invalid password missing letter": {"field": PASSWORD, "value": "12#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 letter.']"}},
    "Edit with invalid password missing uppercase": {"field": PASSWORD, "value": "ab#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 uppercase letter.']"}},
    "Edit with invalid password missing lowercase": {"field": PASSWORD, "value": "AB#45678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 lowercase letter.']"}},
    "Edit with invalid password missing special": {"field": PASSWORD, "value": "Ab345678", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['Password must contain at least 1 special character: !@#$%^&*()_+']"}},
    "Edit with invalid password too short": {"field": PASSWORD, "value": "Ab#4567", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {"detail": "['This password is too short. It must contain at least 8 characters.']"}},
}


class EditUserTestCase(APITestCase):
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
        # edit_payload to avoid unnecessary password validation unless needed.
        cls.edit_payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@test.test",
            "password": "Ab#456789",
            "company": "Test Company",
            "interests": "Test Interests",
            "contact_number": "+65 8888 7777",
        }

        # Create a user for editing
        cls.user = User.objects.create(
            first_name=cls.valid_payload["first_name"],
            last_name=cls.valid_payload["last_name"],
            email=cls.valid_payload["email"],
            company=cls.valid_payload["company"],
            interests=cls.valid_payload["interests"],
            contact_number=cls.valid_payload["contact_number"]
        )
        cls.user.set_password(cls.valid_payload["password"])
        cls.user.save()

        cls.user_id = cls.user.id
        cls.user_token = RefreshToken.for_user(cls.user)
        cls.user_access_token = str(cls.user_token.access_token)


def create_test_function(test_case):
    def test_function(self):
        # If a setup function is specified, run the setup function
        if "setup_function" in test_case:
            test_case["setup_function"]()

        # Create a payload with the field and value to edit
        payload = self.edit_payload.copy()
        payload[test_case["field"]] = test_case["value"]

        response = self.client.patch(
            reverse("user-detail", kwargs={"pk": self.user_id}),
            data=payload,
            HTTP_AUTHORIZATION="Bearer " + self.user_access_token
        )

        self.assertEqual(response.status_code, test_case["expected_response_status_code"])
        if "expected_response" in test_case:
            self.assertEqual(response.data, test_case["expected_response"])

    return test_function


# Dynamically create test functions based on the test cases dictionary
for test_name, test_case in TEST_CASES_DICT.items():
    test_function = create_test_function(test_case)
    test_function.__name__ = f'test_{test_name.lower().replace(" ", "_")}'
    setattr(EditUserTestCase, test_function.__name__, test_function)
