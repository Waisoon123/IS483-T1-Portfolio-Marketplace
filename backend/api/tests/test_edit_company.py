from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from api.models import TechSector, MainOffice, Entity, FinanceStage, Company, Interest
from rest_framework import status
from ..constants import company_field_names


# Add form field names here
COMPANY_NAME = company_field_names.COMPANY_NAME
DESCRIPTION = company_field_names.DESCRIPTION
TECH_SECTOR = company_field_names.TECH_SECTOR
HQ_MAIN_OFFICE = company_field_names.HQ_MAIN_OFFICE
ENTITY = company_field_names.ENTITY
FINANCE_STAGE = company_field_names.FINANCE_STAGE
STATUS = company_field_names.STATUS
WEBSITE = company_field_names.WEBSITE

# Retrieve the custom User mode
User = get_user_model()

TEST_CASES_DICT = {
    "Valid Edit Company Name": {"field": COMPANY_NAME, "value": "Updated Company Name", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company Description": {"field": DESCRIPTION, "value": "Updated Company Description", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company Status": {"field": STATUS, "value": "inactive", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company Website": {"field": WEBSITE, "value": "UpdatedWeb.test", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company TechSector": {"field": TECH_SECTOR, "value": "tech_sector_2", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company MainOffice": {"field": HQ_MAIN_OFFICE, "value": "hq_main_office_2", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company Entity": {"field": ENTITY, "value": "new_entity", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},
    "Valid Edit Company FinanceStage": {"field": FINANCE_STAGE, "value": "new_finance_stage", "expected_response_status_code": status.HTTP_302_FOUND, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": True},

    # No Invalid Edit Company Name
    # No Invalid Edit Company Description
    "Invalid Edit Company Entity Does Not Exist": {"field": ENTITY, "value": [3], "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {ENTITY: ["Select a valid choice. 3 is not one of the available choices."]}},
    "Invalid Edit Company Status Does Not Exist": {"field": STATUS, "value": "Non Existent Option", "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {STATUS: ["Select a valid choice. Non Existent Option is not one of the available choices."]}},
    "Invalid Edit Company Website Does Not Exist": {"field": WEBSITE, "value": "wwwtestwebsite", "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {WEBSITE: ["Enter a valid URL."]}},
    "Invalid Edit Company TechSector Does Not Exist": {"field": TECH_SECTOR, "value": [9999], "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {TECH_SECTOR: ["Select a valid choice. 9999 is not one of the available choices."]}},
    "Invalid Edit Company MainOffice Does Not Exist": {"field": HQ_MAIN_OFFICE, "value": 9999, "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {HQ_MAIN_OFFICE: ["Select a valid choice. That choice is not one of the available choices."]}},
    "Invalid Edit Company FinanceStage Does Not Exist": {"field": FINANCE_STAGE, "value": 9999, "expected_response_status_code": status.HTTP_200_OK, "expected_target_status_code": status.HTTP_200_OK, "should_redirect": False, "expected_error": {FINANCE_STAGE: ["Select a valid choice. That choice is not one of the available choices."]}},
}


class EditCompanyAdminTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create interests objects for the ManyToMany field
        interest_ids = [Interest.objects.create(name='Test Interest').id]
        # Create a superuser to access the admin
        cls.superuser = User.objects.create_superuser(
            email='admin@test.com',
            password='P@ssword1',
            first_name='Admin',
            last_name='User',
            company='AdminCo',
            contact_number='+65 91234567',
            # Pass interest IDs to the UserManager
            interests=interest_ids
        )

        # Create instances for the company and its relations
        cls.tech_sector_1 = TechSector.objects.create(sector_name="Test Sector 1")
        cls.tech_sector_2 = TechSector.objects.create(sector_name="Test Sector 2")

        cls.hq_main_office_1 = MainOffice.objects.create(hq_name="Test HQ 1")
        cls.hq_main_office_2 = MainOffice.objects.create(hq_name="Test HQ 2")
        cls.vertex_entity = Entity.objects.create(entity_name="Test Entity")
        cls.finance_stage = FinanceStage.objects.create(stage_name="Test Stage")
        cls.company = Company.objects.create(
            company="Test Company",
            description="Test Description",
            hq_main_office=cls.hq_main_office_1,
            finance_stage=cls.finance_stage,
            status="active",
            website="https://test.com"
        )

        cls.company.tech_sector.set([cls.tech_sector_1])  # Use add for ManyToManyField
        cls.company.vertex_entity.set([cls.vertex_entity])

        cls.updated_data = {
            "company": "Test Company",
            "description": "Test Description",
            "tech_sector": [cls.tech_sector_1.pk],
            "hq_main_office": cls.hq_main_office_1.pk,
            "vertex_entity": [cls.vertex_entity.pk],
            "finance_stage": cls.finance_stage.pk,
            "status": "active",
            "website": "https://test.com"
        }


def create_test_function(test_case):
    def test_function(self):
        # Log in as superuser
        self.client.login(email='admin@test.com', password='P@ssword1')

        # Setup payload for the test
        payload = self.updated_data.copy()
        field_name = test_case["field"]
        test_value = test_case["value"]

        # Resolve dynamic values for foreign key fields and many to many fields
        if field_name == TECH_SECTOR and isinstance(test_value, str) and hasattr(self, test_value):
            test_value = [getattr(self, test_value).pk]
        elif field_name == HQ_MAIN_OFFICE and isinstance(test_value, str) and hasattr(self, test_value):
            test_value = getattr(self, test_value).pk
        elif field_name == ENTITY and isinstance(test_value, str) and test_value == "new_entity":
            test_value = [Entity.objects.create(entity_name="New Entity").pk]
        elif field_name == FINANCE_STAGE and isinstance(test_value, str) and test_value == "new_finance_stage":
            test_value = FinanceStage.objects.create(stage_name="New Stage").pk
        else:
            test_value = test_case["value"]

        payload[test_case["field"]] = test_value

        # Submit the form
        change_url = reverse('admin:api_company_change', args=(self.company.pk,))
        response = self.client.post(change_url, payload, follow=True)

        # Handle expected redirection or form errors based on the test case
        if test_case.get("should_redirect", False):
            # When a redirect is expected, use assertRedirects
            expected_redirect_url = reverse('admin:api_company_changelist')
            self.assertRedirects(response, expected_redirect_url,
                                 status_code=test_case["expected_response_status_code"],
                                 target_status_code=test_case["expected_target_status_code"])
        else:
            # When a redirect is not expected, typically due to form errors, check for a 200 OK response
            self.assertEqual(response.status_code, test_case.get("expected_response_status_code", 200),
                             "Expected a 200 OK response indicating form errors.")
            if 'adminform' in response.context:
                form_errors = response.context['adminform'].form.errors
                # Check for expected errors for each field
                for field, messages in test_case.get("expected_error", {}).items():
                    self.assertIn(field, form_errors,
                                  f"Expected errors for field '{field}', but didn't find any.")
                    # For each expected error message, check if it's present
                    for message in messages:
                        self.assertIn(
                            message, form_errors[field],
                            f"Expected error message '{message}' not found in errors for field '{field}'.")
            else:
                self.fail("No admin form was found in the response context, but one was expected.")

        # Refresh the model instance and perform further assertions as needed
        self.company.refresh_from_db()

    return test_function


# Dynamically create test functions based on the test cases dictionary
for test_name, test_case in TEST_CASES_DICT.items():
    test_function = create_test_function(test_case)
    test_function.__name__ = f'test_{test_name.lower().replace(" ", "_")}'
    setattr(EditCompanyAdminTestCase, test_function.__name__, test_function)
