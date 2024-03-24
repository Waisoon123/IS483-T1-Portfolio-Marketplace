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


class FilterCompanyTestCase(APITestCase):
    # Initialize the test client
    client = APIClient()

    # Define test cases dictionary at the class level
    TEST_CASES_DICT = {
        # Test cases will be populated in setUpTestData
    }

    @classmethod
    def setUpTestData(cls):
        cls.tech_sector_1 = TechSector.objects.create(sector_name="Test Sector 1")
        cls.tech_sector_2 = TechSector.objects.create(sector_name="Test Sector 2")

        cls.hq_main_office_1 = MainOffice.objects.create(hq_name="Test HQ China")
        cls.hq_main_office_2 = MainOffice.objects.create(hq_name="Test HQ India")
        cls.hq_main_office_3 = MainOffice.objects.create(hq_name="Test HQ Singapore")

        cls.entity = Entity.objects.create(entity_name="Test Entity")
        cls.finance_stage = FinanceStage.objects.create(stage_name="Test Stage")

        cls.TEST_COMPANIES_LIST = [
            {
                "company": "Test Company China 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector_1.id],
                "hq_main_office": cls.hq_main_office_1.id,
                "entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company China 2",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector_2.id],
                "hq_main_office": cls.hq_main_office_1.id,
                "entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company India 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector_1.id],
                "hq_main_office": cls.hq_main_office_2.id,
                "entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
            {
                "company": "Test Company Singapore 1",
                "description": "Test Description",
                "tech_sector": [cls.tech_sector_1.id],
                "hq_main_office": cls.hq_main_office_3.id,
                "entity": [cls.entity.id],
                "finance_stage": cls.finance_stage.id,
                "status": "active",
                "website": "https://test.test"
            },
        ]

        # Populate the test companies in the database
        for company_data in cls.TEST_COMPANIES_LIST:
            company = Company.objects.create(
                name=company_data["company"],
                description=company_data["description"],
                hq_main_office=MainOffice.objects.get(id=company_data["hq_main_office"]),
                finance_stage=FinanceStage.objects.get(id=company_data["finance_stage"]),
                status=company_data["status"],
                website=company_data["website"]
            )

            company.tech_sector.set(TechSector.objects.filter(id__in=company_data["tech_sector"]))
            company.entity.set(Entity.objects.filter(id__in=company_data["entity"]))

        # Now populate the TEST_CASES_DICT with the specific test cases
        cls.TEST_CASES_DICT.update({
            "Valid Filter No Filter": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": "",
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": "",
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 4  # Adjust based on your test data
            },
            "Valid Filter Both Filter": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": cls.tech_sector_2.id,
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": cls.hq_main_office_3.id,
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 0
            },
            "Valid Filter TechSector Filter": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": cls.tech_sector_1.id,
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": "",
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 3  # Adjust based on your test data
            },
            "Valid Filter MainOffice Filter": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": "",
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": cls.hq_main_office_1.id,
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 2  # Adjust based on your test data
            },
            "Invalid Filter TechSector Does Not Exist": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": 0,
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": 1,
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 0
            },
            "Invalid Filter MainOffice Does Not Exist": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": 2,
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": 0,
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 0
            },
            "Invalid Filter TechSector & MainOffice Do Not Exist": {
                "tech_sector_field": TECH_SECTOR,
                "value_tech_sector_field": 0,
                "hq_main_office_field": HQ_MAIN_OFFICE,
                "value_hq_main_office_field": 0,
                "expected_response_status_code": status.HTTP_200_OK,
                "count": 0
            },
        })

    @staticmethod
    def create_test_function(test_case):
        def test_function(self):
            url = reverse('company-list')
            response = self.client.get(url)
            self.assertEqual(response.status_code, test_case["expected_response_status_code"])
            self.assertEqual(response.data['count'], test_case["count"])

            # Add additional assertions as needed based on the test_case definition
        return test_function

    @classmethod
    def generate_test_functions(cls):
        for test_name, test_case in cls.TEST_CASES_DICT.items():
            test_func = cls.create_test_function(test_case)
            setattr(cls, f'test_{test_name.lower().replace(" ", "_")}', test_func)


FilterCompanyTestCase.generate_test_functions()
