import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import CompanyDetails from '../components/CompanyDetails';
import Directory from '../routes/Directory';
import { LandingHero } from '../components/LandingHero';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import AccordionSolutions from '../components/Accordion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
      tech_sector: ['Internet'],
      hq_main_office: '6',
      vertex_entity: ['6'],
      finance_stage: 'Seed',
      status: 'active',
      website: 'matchmade.io',
      products: 'products description',
      customers_partners: 'customers and partners description',
      pricings: 'pricings description',
      founders: 'founders description',
      facebook_url: 'www.facebook.com',
      twitter_url: 'www.twitter.com',
      linkedin_url: 'www.linkedin.com',
    };

    fetchMock.get(`${API_URL}companies/?company=${companyData.company}`, {
      status: 200,
      body: { count: 1, next: null, previous: null, results: [companyData] },
    });

    fetchMock.get(`${API_URL}companies/`, {
      status: 200,
      body: {
        count: 268,
        next: `${API_URL}companies/?page=2`,
        previous: null,
        results: [companyData],
      },
    });

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
    render(
      <Router>
        <LandingHero />
      </Router>,
    );

    // Check if the h1 header is rendered
    const header = screen.getByRole('heading', { level: 1, name: /Find what you need/i });
    expect(header).toBeInTheDocument();

    // Check if the search bar is rendered
    const searchBar = screen.getByPlaceholderText('What are you looking for?');
    expect(searchBar).toBeInTheDocument();

    // Check if the directory link is rendered
    const directoryLink = screen.getByRole('link', { name: /View Our Lists of Start-ups/i });
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
        /We have invested in over 300 companies. Here, you can search for Vertex companies by industry, region, company size, and more./i,
      );
      expect(description).toBeInTheDocument();
      // check if filter btn is rendered successfully.
      const filterButton = screen.getByTestId('filter-btn');
      expect(filterButton).toBeInTheDocument();
      expect(filterButton).not.toBeDisabled();
    });

    await waitFor(() => {
      const companyProfileCard = screen.getByRole('heading', { level: 4, name: 'MatchMade' });
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
        <Routes>
          <Route path='/directory/:companyName' element={<CompanyDetails />} />
          <Route path='/' element={<Directory />} />
        </Routes>
      </Router>,
    );

    // Wait for the page to load
    await waitFor(() => {
      // Check for link straight away since the above test case has already tested
      const companyProfileLink = screen.getByRole('link', { name: /MatchMade/i });
      expect(companyProfileLink).toBeInTheDocument();
      // Click on the card shown
      userEvent.click(companyProfileLink);
    });

    // Wait for page to load
    await waitFor(() => {
      // Check if the company name is rendered
      const companyName = screen.getByRole('heading', { level: 1, name: /MatchMade/i });
      expect(companyName).toBeInTheDocument();
      const companyDescription = screen.getByText(
        'MatchMade helps finance teams maintain ledgers from different sources in one please while automating various financial operation processes like transaction matching,parsing,reconciliation, and consolidation.',
      );
      expect(companyDescription).toBeInTheDocument();

      // Social Media Links
      const facebookLink = screen.getByTestId('facebook-link');
      expect(facebookLink).toBeInTheDocument();
      expect(facebookLink.getAttribute('href')).toBe('https://www.facebook.com');
      const twitterLink = screen.getByTestId('twitter-link');
      expect(twitterLink).toBeInTheDocument();
      expect(twitterLink.getAttribute('href')).toBe('https://www.twitter.com');
      const linkedinLink = screen.getByTestId('linkedin-link');
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink.getAttribute('href')).toBe('https://www.linkedin.com');
      const websiteLink = screen.getByTestId('website-link');
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink.getAttribute('href')).toBe('https://matchmade.io');

      // Check if contact button is rendered
      const contactbutton = screen.getByTestId('contact-button');
      expect(contactbutton).toBeInTheDocument();

      // Check for the accordion tabs
      const productTab = screen.getByTestId('tab-Product');
      const customersPartnersTab = screen.getByTestId('tab-Customers and Partners');
      const pricingTab = screen.getByTestId('tab-Pricing');
      const foundersTab = screen.getByTestId('tab-Founders');
      expect(productTab).toBeInTheDocument();
      expect(customersPartnersTab).toBeInTheDocument();
      expect(pricingTab).toBeInTheDocument();
      expect(foundersTab).toBeInTheDocument();

      // Check for Accordion Content
      const firstContent = screen.getByTestId('content-1');
      expect(firstContent).toBeInTheDocument();
      userEvent.click(customersPartnersTab);
      const thirdContent = screen.getByTestId('content-3');
      expect(thirdContent).toBeInTheDocument();
      userEvent.click(pricingTab);
      const fifthContent = screen.getByTestId('content-5');
      expect(fifthContent).toBeInTheDocument();
      userEvent.click(foundersTab);
      const seventhContent = screen.getByTestId('content-7');
      expect(seventhContent).toBeInTheDocument();
    });
  });

  test('renders error message when company is not found', async () => {
    const invalidCompany = 'randomcompany';
    const history = createMemoryHistory({
      initialEntries: [`/directory/${invalidCompany}`],
    });

    fetchMock.get(`${API_URL}companies/`, { results: [] }, { overwriteRoutes: true });

    render(
      <Router history={history}>
        <CompanyDetails />
      </Router>,
    );
    // Check if error message is rendered
    const errorMessage = await screen.findByText(/Company not found/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
