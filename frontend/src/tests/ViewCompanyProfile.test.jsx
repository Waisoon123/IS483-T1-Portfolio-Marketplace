import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import CompanyDetails from '../components/CompanyDetails';
import Directory from '../routes/Directory';
import { LandingHero } from '../components/LandingHero';
import * as paths from '../constants/paths';
import { renderWithRouterAndAuth } from '../utils/testUtils';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { wait } from '@testing-library/user-event/dist/utils';

const API_URL = import.meta.env.VITE_API_URL;

let companyData;

describe('ViewCompanyProfile', () => {
  beforeEach(() => {
    // Mock API Call to fetch data
    companyData = {
      id: 1,
      company: 'MatchMade',
      description:
        'MatchMade helps finance teams maintain ledgers from different sources in one please while automating various financial operation processes like transaction matching,parsing,reconciliation, and consolidation.',
      tech_sector: 79,
      hq_main_office: 6,
      vertex_entity: [6],
      finance_stage: 5,
      status: 'active',
      website: 'matchmade.io',
    };

    fetchMock.get(`${API_URL}companies/?page=1`, {
      status: 200,
      body: {
        count: 268,
        next: `${API_URL}companies/?page=2`,
        previous: null,
        results: [companyData],
      },
    });

    fetchMock.getOnce(`${API_URL}main-offices/`, {
      body: {
        // Mock data for the /main-offices/ endpoint
        results: ['Office 1', 'Office 2', 'Office 3'],
      },
      status: 200,
    });

    fetchMock.getOnce(`${API_URL}tech-sectors/`, {
      body: {
        // Mock data for the /tech-sectors/ endpoint
        results: ['Sector 1', 'Sector 2', 'Sector 3'],
      },
      status: 200,
    });

    afterEach(() => {
      fetchMock.reset();
    });
  });

  test('renders LandingHero without errors', () => {
    renderWithRouterAndAuth(<LandingHero />);

    // Check if the h1 header is rendered
    const header = screen.getByRole('heading', { level: 1, name: /Find what you need/i });
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
    render(
      <Router>
        <Directory />
      </Router>,
    );

    // Wait for the page to load
    await waitFor(() => {
      // Check if the h1 header is rendered
      const header = screen.getByRole('heading', { level: 2, name: /Backed by Vertex/i });
      expect(header).toBeInTheDocument();

      // Check if Directory's page description is rendered
      const description = screen.getByText(
        /As of 2023, we have invested in over 300 companies. Here, you can search for Vertex companies by industry, region, company size, and more./i,
      );
      expect(description).toBeInTheDocument();
      // check if filter btn is rendered successfully.
      const filterButton = screen.getByTestId('filter-btn');
      expect(filterButton).toBeInTheDocument();
      expect(filterButton).not.toBeDisabled();
    });

    await waitFor(() => {
      const companyProfileCard = screen.getByText('MatchMade');
      expect(companyProfileCard).toBeInTheDocument();
      const companyProfileCardDesc = screen.getByText(
        'MatchMade helps finance teams maintain ledgers from different sources in one please while automating various financial operation processes like transaction matching,parsing,reconciliation, and consolidation.',
      );
      expect(companyProfileCardDesc).toBeInTheDocument();
      const companyProfileLink = screen.getByRole('link', { name: /MatchMade/i });
      expect(companyProfileLink).toBeInTheDocument();
    });
  });

  test('renders company details after company profile card is clicked', async () => {
    render(
      <Router>
        <Directory />
      </Router>,
    );

    // Wait for the page to load
    await waitFor(() => {
      // Check for link straight away since the above test case has already tested
      const companyProfileLink = screen.getByRole('link', { name: /MatchMade/i });
      expect(companyProfileLink).toBeInTheDocument();
      // Click on the company profile link
      userEvent.click(companyProfileLink);
    });

    waitFor(() => {
      // check social media if its present
      const facebookLink = screen.getByTestId('facebook-link');
      expect(facebookLink).toBeInTheDocument();
      const twitterLink = screen.getByTestId('twitter-link');
      expect(twitterLink).toBeInTheDocument();
      const linkedinLink = screen.getByTestId('linkedin-link');
      expect(linkedinLink).toBeInTheDocument();
      const whatsappLink = screen.getByTestId('whatsapp-link');
      expect(whatsappLink).toBeInTheDocument();
      const websiteLink = screen.getByTestId('website-link');
      expect(websiteLink).toBeInTheDocument();
      //Check if Links are present
      const pricing = screen.getByRole('link', { name: /Pricing/i });
      expect(pricing).toBeInTheDocument();
      const usage = screen.getByRole('link', { name: /Usage/i });
      expect(usage).toBeInTheDocument();
      const supportInformation = screen.getByRole('link', { name: /Support Information/i });
      expect(supportInformation).toBeInTheDocument();
      const linkToAWSGoogleMarketplace = screen.getByRole('link', { name: /Link to AWS\/Google Marketplace/i });
      expect(linkToAWSGoogleMarketplace).toBeInTheDocument();
      const currentCustomer = screen.getByRole('link', { name: /Current customer/i });
      expect(currentCustomer).toBeInTheDocument();
    });
  });

  test('renders error message when company is not found', async () => {
    const invalidCompany = 'randomcompany';

    fetchMock.get(`${API_URL}companies/`, { results: [] }, { overwriteRoutes: true });

    renderWithRouterAndAuth(<CompanyDetails />, { initialEntries: [`/directory/${invalidCompany}`] });

    // Check if error message is rendered
    waitFor(() => {
      const errorMessage = screen.getByText(/Company not found/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
