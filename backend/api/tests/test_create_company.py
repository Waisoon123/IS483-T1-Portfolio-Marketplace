from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from api.models import TechSector, MainOffice, Entity, FinanceStage, Company
from ..constants import company_field_names  # Assuming you have similar constants for company

# Add form field names here
COMPANY_NAME = company_field_names.COMPANY_NAME
DESCRIPTION = company_field_names.DESCRIPTION
TECH_SECTOR = company_field_names.TECH_SECTOR
HQ_MAIN_OFFICE = company_field_names.HQ_MAIN_OFFICE
ENTITY = company_field_names.ENTITY
FINANCE_STAGE = company_field_names.FINANCE_STAGE
STATUS = company_field_names.STATUS
WEBSITE = company_field_names.WEBSITE

# Add test cases dictionary here
TEST_CASES_DICT = {
    "Create Valid Company": {"field": COMPANY_NAME, "value": "Valid Test Company", "expected_response_status_code": status.HTTP_201_CREATED},
    
    # TEST CASE WITH EMPTY INPUT
    "Create Company with Empty Name": {"field": COMPANY_NAME, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {COMPANY_NAME: ["This field may not be blank."]}},
    "Create Company with Empty Description": {"field": DESCRIPTION, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {DESCRIPTION: ["This field may not be blank."]}},
    # <<< No need for test for Tech_Sector as it can be EMPTY >>>
    "Create Company with Empty Main Office": {"field": HQ_MAIN_OFFICE, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {HQ_MAIN_OFFICE: ["This field may not be null."]}},
    "Create Company with Empty Entity": {"field": ENTITY, "value": [], "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {ENTITY: ["This field is required."]}},
    "Create Company with Empty Finance Stage": {"field": FINANCE_STAGE, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {FINANCE_STAGE: ["This field may not be null."]}},
    "Create Company with Empty Status": {"field": STATUS, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {STATUS: ['"" is not a valid choice.']}},
    "Create Company with Empty Website": {"field": WEBSITE, "value": "", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {WEBSITE: ["This field may not be blank."]}},
    
    # TEST CASE WITH INVALID INPUT THAT DOES NOT EXIST
    # <<< No need for test for Name as there is no invalid company name >>>
    # <<< No need for test for Description as there is no invalid company description >>>
    "Create Company with Invalid Tech Sector": {"field": TECH_SECTOR, "value": [2], "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {TECH_SECTOR: ['Invalid pk "2" - object does not exist.']}},
    "Create Company with Invalid Main Office": {"field": HQ_MAIN_OFFICE, "value": 2, "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {HQ_MAIN_OFFICE: ['Invalid pk "2" - object does not exist.']}},
    "Create Company with Invalid Entity": {"field": ENTITY, "value": [2], "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {ENTITY: ['Invalid pk "2" - object does not exist.']}},
    "Create Company with Invalid Finance Stage": {"field": FINANCE_STAGE, "value": 2, "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {FINANCE_STAGE: ['Invalid pk "2" - object does not exist.']}},
    "Create Company with Invalid Status": {"field": STATUS, "value": "invalid choice", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {STATUS: ['"invalid choice" is not a valid choice.']}},
    "Create Company with Invalid Website": {"field": WEBSITE, "value": "invalid website", "expected_response_status_code": status.HTTP_400_BAD_REQUEST, "expected_response": {WEBSITE: ['Enter a valid URL.']}},
}

class CreateCompanyTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Initialize the test client and the payload
        cls.client = APIClient()
        cls.tech_sector = TechSector.objects.create(sector_name="Test Sector")
        cls.hq_main_office = MainOffice.objects.create(hq_name="Test HQ")
        cls.entity = Entity.objects.create(entity_name="Test Entity")
        cls.finance_stage = FinanceStage.objects.create(stage_name="Test Stage")

        cls.valid_payload = {
            "company": "Test Company",
            "description": "Test Description",
            "tech_sector": [cls.tech_sector.id],
            "hq_main_office": cls.hq_main_office.id,
            "vertex_entity": [cls.entity.id],
            "finance_stage": cls.finance_stage.id,
            "status": "active",
            "website": "https://test.test"
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
            reverse("company-list"),
            data=payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, test_case["expected_response_status_code"])
        # New logic for comparing error messages, extract the messages from the response and compare them to the expected messages
        if "expected_response" in test_case:
            for field, messages in test_case["expected_response"].items():
                actual_messages = [str(detail) for detail in response.data.get(field, [])]
                self.assertEqual(actual_messages, messages, f"Field '{field}' messages do not match.")

    return test_function

# Dynamically create test functions based on the test cases dictionary
for test_name, test_case in TEST_CASES_DICT.items():
    test_function = create_test_function(test_case)
    test_function.__name__ = f'test_{test_name.lower().replace(" ", "_")}'
    setattr(CreateCompanyTestCase, test_function.__name__, test_function)
