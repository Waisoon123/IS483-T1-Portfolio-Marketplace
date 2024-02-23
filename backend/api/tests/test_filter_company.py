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
    "Valid Filter No Filter": {"tech_sector_field": TECH_SECTOR, "value_tech_sector_field": 1, 
                               "hq_main_office_field": HQ_MAIN_OFFICE, "value_hq_main_office_field": 2, 
                               "expected_response_status_code": status.HTTP_201_CREATED},
}

# 1) Create companies, 2 from China, 1 from Inda, 1 from Singapore
# 2) retrieve the companies from China

class FilterCompanyTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Initialize the test client and the payload
        cls.client = APIClient()
        
        cls.tech_sector = TechSector.objects.create(sector_name="Test Sector")
        # Increase Tech Sector later
        cls.hq_main_office_1 = MainOffice.objects.create(hq_name="Test HQ China")
        cls.hq_main_office_2 = MainOffice.objects.create(hq_name="Test HQ India")
        cls.hq_main_office_3 = MainOffice.objects.create(hq_name="Test HQ Singapore")
        
        # Not required to change BELOW
        cls.entity = Entity.objects.create(entity_name="Test Entity")
        cls.finance_stage = FinanceStage.objects.create(stage_name="Test Stage")
        
        cls.TEST_COMPANIES_LIST = [
            {
                "company": "Test Company China 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector.id],
                "hq_main_office": cls.hq_main_office_1.id,
                "vertex_entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company China 2",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector.id],
                "hq_main_office": cls.hq_main_office_1.id,
                "vertex_entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company India 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector.id],
                "hq_main_office": cls.hq_main_office_2.id,
                "vertex_entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company Singapore 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector.id],
                "hq_main_office": cls.hq_main_office_3.id,
                "vertex_entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
        ]

def create_test_function(test_case):
    def test_function(self):
        # If a setup function is specified, run the setup function
        if "setup_function" in test_case:
            test_case["setup_function"]()
            
        for company_data in self.TEST_COMPANIES_LIST:
            Company.objects.create(
                company=company_data["company"],
                description=company_data["description"],
                tech_sector=TechSector.objects.get(id=company_data["tech_sector"]),
                hq_main_office=MainOffice.objects.get(id=company_data["hq_main_office"]),
                vertex_entity=Entity.objects.get(id=company_data["vertex_entity"]),
                finance_stage=FinanceStage.objects.get(id=company_data["finance_stage"]),
                status=company_data["status"],
                website=company_data["website"]
            )
        
        # Create a payload with the field and value to edit
        payload = {
            test_case["tech_sector_field"]: test_case["value_tech_sector_field"],
            test_case["hq_main_office_field"]: test_case["value_hq_main_office_field"]
        }
        
        url = reverse("company-list")
        response = self.client.get(f"{url}?tech_sectors=1&hq_main_offices=1")

        
        self.assertEqual(response.status_code, test_case["expected_response_status_code"])
        # New logic for comparing error messages, extract the messages from the response and compare them to the expected messages
        if "expected_response" in test_case:
            for field, messages in test_case["expected_response"].items():
                actual_messages = [str(detail) for detail in response.data.get(field, [])]
                self.assertEqual(actual_messages, messages, f"Field '{field}' messages do not match.")
                
    return test_function    

# Dynamically create test functions based on the test cases dictionary
for test_name, test_case in TEST_CASES_DICT.items():
    test_func = create_test_function(test_case)
    if test_func:  # Check if a function was actually created
        test_func.__name__ = f'test_{test_name.lower().replace(" ", "_")}'
        setattr(FilterCompanyTestCase, test_func.__name__, test_func)
    else:
        raise ValueError(f"The test case {test_name} did not create a test function")
