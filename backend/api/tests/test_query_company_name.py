from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from api.models import Company, TechSector, MainOffice, Entity, FinanceStage


class CompanyQueryViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_companies = [
            {
                'company': 'Tech Innovations',
                'description': 'A tech company',
                'website': 'http://techinnovations.com',
                'tech_sectors': ['Software'],
                'entities': ['Entity1'],
                'finance_stage': 'Seed',
                'hq_name': 'New York',
            },
            {
                'company': 'Innovative Tech',
                'description': 'Another tech company',
                'website': 'http://innovativetech.com',
                'tech_sectors': ['Hardware'],
                'entities': ['Entity1'],
                'finance_stage': 'Seed',
                'hq_name': 'New York',
            },
            {
                'company': 'NonTech Company',
                'description': 'Not a tech company',
                'website': 'http://nontechcompany.com',
                'tech_sectors': [],
                'entities': [],
                'finance_stage': 'Seed',
                'hq_name': 'New York',
            }
        ]

        for company_data in self.test_companies:
            self.create_test_company(company_data)

    def create_test_company(self, company_data):
        tech_sectors = [TechSector.objects.get_or_create(sector_name=name)[0] for name in company_data['tech_sectors']]
        entities = [Entity.objects.get_or_create(entity_name=name)[0]
                    for name in company_data['entities']] if company_data.get('entities') else []
        finance_stage, _ = FinanceStage.objects.get_or_create(stage_name=company_data['finance_stage'])
        hq_main_office, _ = MainOffice.objects.get_or_create(hq_name=company_data['hq_name'])

        company = Company.objects.create(
            company=company_data['company'],
            description=company_data['description'],
            hq_main_office=hq_main_office,
            finance_stage=finance_stage,
            website=company_data['website']
        )

        for sector in tech_sectors:
            company.tech_sector.add(sector)
        for entity in entities:
            company.vertex_entity.add(entity)

    def test_query_by_company_name(self):
        url = reverse('company-list')
        # Test querying a single company by name
        response = self.client.get(url, {'company': 'Tech Innovations'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['company'], 'Tech Innovations')

        # Test querying multiple companies by names
        response = self.client.get(url, {'company': 'Tech Innovations,Innovative Tech'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 2)
        queried_companies = {company['company'] for company in response.data['results']}
        self.assertTrue({'Tech Innovations', 'Innovative Tech'}.issubset(queried_companies))

        # Test case-insensitive querying
        response = self.client.get(url, {'company': 'tech innovations'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(company['company'] == 'Tech Innovations' for company in response.data['results']))


    def test_fail_query_by_nonexistent_company(self):
        url = reverse('company-list')
        response = self.client.get(url, {'company': 'Ghost Company'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', [])), 0)
