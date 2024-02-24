import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import CompanyDetails from '../components/CompanyDetails';
import Directory from '../routes/Directory';
import { LandingHero } from '../components/LandingHero';
import * as paths from '../constants/paths';
import { renderWithRouterAndAuth } from '../utils/testUtils';

const API_URL = import.meta.env.VITE_API_URL;

let companyData;

describe('ViewCompanyProfile', () => {
  beforeEach(() => {
    // Mock API Call to fetch data
    companyData = {
      id: 104,
      company: 'EverAfter',
      description:
        'Allows CSMs to build personalized hubs for every user directly inside product Get on the same page with your customer. Literally.  EverAfter lets CSMs build personalized hubs for every user directly inside your product. No code required.',
      tech_sector: 'Enterprise Software, SaaS',
      hq_main_office: 'Israel',
      vertex_entity: 'Vertex Ventures Israel (VVIL)',
      finance_stage: 'Series A',
      status: 'active',
      website: 'everafter.ai',
    };

    fetchMock.get(`${API_URL}companies/`, {
      count: 268,
      next: 'http://localhost:8000/api/companies/?page=2',
      previous: null,
      results: [companyData],
    });
  });

  afterEach(() => {
    fetchMock.reset();
  });

  test('renders LandingHero without errors', () => {
    renderWithRouterAndAuth(<LandingHero />);

    // Check if the h1 header is rendered
    const header = screen.getByRole('heading', { name: /Find what you need/i });
    expect(header).toBeInTheDocument();

    // Check if the search bar is rendered
    const searchBar = screen.getByPlaceholderText('Type something...');
    expect(searchBar).toBeInTheDocument();

    // Check if the directory link is rendered
    const directoryLink = screen.getByRole('link', { name: /Directory/i });
    expect(directoryLink).toBeInTheDocument();
    expect(directoryLink.getAttribute('href')).toBe('/directory');
  });

  test('renders company profile card after directory link is clicked', async () => {
    renderWithRouterAndAuth(<Directory />, { initialEntries: [paths.DIRECTORY] });

    // Check if the h1 header is rendered
    const header = await screen.getByRole('heading', { name: /Backed by Vertex/i });
    expect(header).toBeInTheDocument();

    // Check if Directory's page description is rendered
    const description = await screen.getByText(
      /As of 2023, we have invested in over 300 companies. Here, you can search for Vertex companies by industry, region, company size and more./i,
    );
    expect(description).toBeInTheDocument();

    // check if filter btn is rendered successfully.
    const filterButton = screen.getByTestId('filter-btn');
    expect(filterButton).toBeInTheDocument();

    // Check if company profile card is rendered
    const companyProfileCard = await screen.findByText(companyData.company);
    expect(companyProfileCard).toBeInTheDocument();

    // Check if company description is present
    const companyDescription = await screen.findByText(new RegExp(companyData.description.slice(0, 20), 'i'));
    expect(companyDescription).toHaveTextContent(companyData.description.replace(/\s\s+/g, ' '));
  });

  test('renders company details after company profile card is clicked', async () => {
    renderWithRouterAndAuth(<Directory />);

    // Check if company profile card is rendered
    const companyProfileCard = await screen.findByText(companyData.company);
    expect(companyProfileCard).toBeInTheDocument();
    userEvent.click(companyProfileCard);

    waitFor(() => {
      // Check if company name is rendered
      const companyName = screen.getByText(companyData.company);
      expect(companyName).toBeInTheDocument();
      // Check if social media icons are rendered
      const facebookLink = screen.getByTestId('facebook-link');
      expect(facebookLink).toBeInTheDocument();
      const twitterLink = screen.getByTestId('twitter-link');
      expect(twitterLink).toBeInTheDocument();
      const linkedinLink = screen.getByTestId('linkedin-link');
      expect(linkedinLink).toBeInTheDocument();
      const whatsappLink = screen.getByTestId('whatsapp-link');
      expect(whatsappLink).toBeInTheDocument();
      const websiteLink = screen.getByText(companyData.website);
      expect(websiteLink).toBeInTheDocument();
      // Check if company details is rendered
      const companyDetails = screen.getByText(companyData.description);
      expect(companyDetails).toBeInTheDocument();

      // Check for the various links
      const priceLink = screen.getByRole('link', { name: /Pricing/i });
      expect(priceLink).toBeInTheDocument();
      const usageLink = screen.getByRole('link', { name: /Usage/i });
      expect(usageLink).toBeInTheDocument();
      const supportLink = screen.getByRole('link', { name: /Support Information/i });
      expect(supportLink).toBeInTheDocument();
      const awsLink = screen.getByRole('link', { name: /Link to AWS\/Google Marketplace/i });
      expect(awsLink).toBeInTheDocument();
      const customerLink = screen.getByRole('link', { name: /Current customer/i });
      expect(customerLink).toBeInTheDocument();
    });
  });

  test('renders error message when company is not found', async () => {
    const invalidCompany = 'randomcompany';

    fetchMock.get(`${API_URL}companies/${invalidCompany}`, 404);

    renderWithRouterAndAuth(<CompanyDetails />, { initialEntries: ['/directory/${invalidCompany}'] });

    // Check if error message is rendered
    waitFor(() => {
      const errorMessage = screen.findByText(/Company not found/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
