import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Directory from '../routes/Directory';
import { BrowserRouter as Router } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

let companyData;

describe('FilterCompany', () => {
  beforeEach(() => {
    companyData = [
      {
        id: 20,
        company: 'BeepKart',
        description:
          'A full-stack online retailer of used 2-wheelers BeepKart is building a platform to digitize and organize the used two-wheeler market.   The team has backgrounds in serial entrepreneurship, tech VC, mobility, software, and fast-scaling start-up operations.   The company is adequately seed-funded by the founders.',
        tech_sector: ['35'],
        hq_main_office: 5,
        vertex_entity: [6],
        finance_stage: '6',
        status: 'active',
        website: 'beepkart.com',
      },
      {
        id: 130,
        company: 'Kapiva Ayurveda',
        description:
          'Kapiva Ayurveda is a fast-growing Ayurvedic food brand Kapiva Ayurveda is a disruptive healthcare start-up in the fast-growing global Ayurveda market. Backed by the iconic Baidyanath Group, we at Kapiva are passionate about adapting traditional Ayurvedic knowledge to the needs of the modern consumer. Through our high-quality product range, our mission is to provide a new-age Ayurveda for a new-age customer. We make a range of Ayurvedic nutrition focused products like plant protein powders, A2 ghee, juices, herbal teas, flavoured honeys and more.  Kapiva was founded in early 2016, and currently has shelf presence in over 150 retail outlets, sells through multiple e-commerce portals like Amazon, 1mg, Big Basket to name a few and exports to international markets. We have been successfully doubling sales every quarter, and are excited to enter their next phase of growth.  We have also been fortunate to enjoy the trust and partnership of our strategic investors who have experience leading some of India’s most illustrious firs (including Reliance Capital, Lightspeed Ventures, Gits Foods & OYO Rooms).',
        tech_sector: ['35', '67'],
        hq_main_office: 5,
        vertex_entity: [6],
        finance_stage: '11',
        status: 'active',
        website: 'kapiva.in',
      },
    ];

    fetchMock.get(`${API_URL}companies/?page=1&tech_sectors=35&hq_main_offices=5`, {
      status: 200,
      body: {
        results: companyData,
      },
    });

    fetchMock.get(`${API_URL}companies/?page=1&hq_main_offices=5`, {
      status: 200,
      body: {
        results: companyData,
      },
    });

    fetchMock.get(`${API_URL}companies/?page=1`, {
      status: 200,
      body: {
        results: companyData,
      },
    });

    fetchMock.get(`${API_URL}main-offices/`, [
      {
        id: 5,
        hq_name: 'India',
      },
    ]);

    fetchMock.get(`${API_URL}tech-sectors/`, [
      {
        id: 35,
        sector_name: 'Consumer Products & Services',
      },
    ]);

    fetchMock.get(`${API_URL}?tech_sectors=35&hq_main_offices=5/`, [
      {
        id: 20,
        company: 'BeepKart',
        description:
          'A full-stack online retailer of used 2-wheelers BeepKart is building a platform to digitize and organize the used two-wheeler market. The team has backgrounds in serial entrepreneurship, tech VC, mobility, software, and fast-scaling start-up operations.   The company is adequately seed-funded by the founders.',
        tech_sector: ['35'],
        hq_main_office: 5,
        vertex_entity: [6],
        finance_stage: 6,
        status: 'active',
        website: 'beepkart.com',
      },
      {
        id: 130,
        company: 'Kapiva Ayurveda',
        description:
          'Kapiva Ayurveda is a fast-growing Ayurvedic food brand Kapiva Ayurveda is a disruptive healthcare start-up in the fast-growing global Ayurveda market. Backed by the iconic Baidyanath Group, we at Kapiva are passionate about adapting traditional Ayurvedic knowledge to the needs of the modern consumer. Through our high-quality product range, our mission is to provide a new-age Ayurveda for a new-age customer. We make a range of Ayurvedic nutrition focused products like plant protein powders, A2 ghee, juices, herbal teas, flavoured honeys and more.  Kapiva was founded in early 2016, and currently has shelf presence in over 150 retail outlets, sells through multiple e-commerce portals like Amazon, 1mg, Big Basket to name a few and exports to international markets. We have been successfully doubling sales every quarter, and are excited to enter their next phase of growth.  We have also been fortunate to enjoy the trust and partnership of our strategic investors who have experience leading some of India’s most illustrious firs (including Reliance Capital, Lightspeed Ventures, Gits Foods & OYO Rooms).',
        tech_sector: ['35', '67'],
        hq_main_office: 5,
        vertex_entity: [6],
        finance_stage: 11,
        status: 'active',
        website: 'kapiva.in',
      },
    ]);
    render(
      <Router>
        <Directory />
      </Router>,
    );
  });

  afterEach(() => {
    fetchMock.reset();
  });

  test('toggle Filter panel correctly', async () => {
    // Search for the filter button
    const filterButton = screen.getByTestId('filter-btn');
    expect(filterButton).toBeEnabled();
    expect(filterButton).toBeInTheDocument();

    // Click on the filter button to toggle the filter panel
    userEvent.click(filterButton);

    const filterPanel = screen.getByTestId('filter-panel');
    expect(filterPanel).toBeInTheDocument();

    // Check if filters header is present
    const filtersHeader = screen.getByText('Filters');
    expect(filtersHeader).toBeInTheDocument();

    // Check if clear filters button is present
    const clearFiltersButton = screen.getByRole('button', { name: 'Clear Filters' });
    expect(clearFiltersButton).toBeInTheDocument();

    // Check if country button is present
    const countryButton = screen.getByRole('button', { name: 'Country' });
    expect(countryButton).toBeInTheDocument();

    // Check if sector button is present
    const sectorButton = screen.getByRole('button', { name: 'Sector' });
    expect(sectorButton).toBeInTheDocument();

    // Check if country tab is present
    const countryTab = screen.getByText('Country');
    expect(countryTab).toBeInTheDocument();

    // Check if sector tab is present
    const sectorTab = screen.getByText('Sector');
    expect(sectorTab).toBeInTheDocument();

    // Check if country checkboxes are present
    userEvent.click(countryButton);
    // Check if header is present
    const countryHeader = screen.getByRole('heading', { level: 3, name: 'Country' });
    expect(countryHeader).toBeInTheDocument();
    // Now check the checkboxes
    const countryCheckboxes = await screen.findByRole('checkbox', { name: 'India' });
    expect(countryCheckboxes).toBeInTheDocument();

    // Check if sector checkboxes are present
    userEvent.click(sectorButton);
    // Check if header is present
    const sectorHeader = screen.getByRole('heading', { level: 3, name: 'Sector' });
    expect(sectorHeader).toBeInTheDocument();
    // Now check the checkboxes
    const sectorCheckboxes = await screen.findByRole('checkbox', { name: 'Consumer Products & Services' });
    expect(sectorCheckboxes).toBeInTheDocument();
  });

  test('Filter Checkboxes Reflected Correctly in Filter Panel and Directory, and Company Profile Cards displayed correctly', async () => {
    const filterButton = screen.getByTestId('filter-btn');
    userEvent.click(filterButton);

    const filterPanel = screen.getByTestId('filter-panel');
    expect(filterPanel).toBeInTheDocument();

    const countryButton = screen.getByRole('button', { name: 'Country' });
    userEvent.click(countryButton);
    const countryCheckboxes = await screen.findByRole('checkbox', { name: 'India' });
    userEvent.click(countryCheckboxes);

    // Shows the correct country in the filter selected
    await waitFor(() => {
      const indiaElement = screen.getByTestId('country-5');
      expect(indiaElement).toBeInTheDocument();
      expect(indiaElement).toHaveClass('rounded text-xs bg-secondary-300 p-1 text-white mr-1');
    });

    const sectorButton = screen.getByRole('button', { name: 'Sector' });
    userEvent.click(sectorButton);
    const sectorCheckboxes = await screen.findByRole('checkbox', { name: 'Consumer Products & Services' });
    userEvent.click(sectorCheckboxes);

    await waitFor(() => {
      const consumerProductsServicesElement = screen.getByTestId('sector-35');
      expect(consumerProductsServicesElement).toBeInTheDocument();
      expect(consumerProductsServicesElement).toHaveClass('rounded text-xs bg-secondary-300 p-1 text-white mr-1');
    });

    // Click on close button to close the filter panel
    const closeButton = screen.getByTestId('close-filter-panel');
    userEvent.click(closeButton);

    // Check if Country: India / Sector: Consumer Products & Services is displayed in directory
    const countryFilter = screen.getByTestId('filter-country-5');
    expect(countryFilter).toBeInTheDocument();
    const sectorFilter = screen.getByTestId('filter-sector-35');
    expect(sectorFilter).toBeInTheDocument();

    // See if we have the correct company profile cards displayed
    const filteredCompanyResult1 = await screen.findByRole('heading', { name: 'BeepKart' });
    expect(filteredCompanyResult1).toBeInTheDocument();
    const filteredCompanyResult2 = await screen.findByRole('heading', { name: 'Kapiva Ayurveda' });
    expect(filteredCompanyResult2).toBeInTheDocument();
  });

  test('Clear Filters Button Works Correctly', async () => {
    const filterButton = screen.getByTestId('filter-btn');
    userEvent.click(filterButton);

    const filterPanel = screen.getByTestId('filter-panel');
    expect(filterPanel).toBeInTheDocument();

    const countryButton = screen.getByRole('button', { name: 'Country' });
    userEvent.click(countryButton);
    const countryCheckboxes = await screen.findByRole('checkbox', { name: 'India' });
    userEvent.click(countryCheckboxes);

    // Shows the correct country in the filter selected
    await waitFor(() => {
      const indiaElement = screen.getByTestId('country-5');
      expect(indiaElement).toBeInTheDocument();
      expect(indiaElement).toHaveClass('rounded text-xs bg-secondary-300 p-1 text-white mr-1');
    });

    // Look for the clear filters button
    const clearFiltersButton = screen.getByRole('button', { name: 'Clear Filters' });
    userEvent.click(clearFiltersButton);

    await waitFor(() => {
      const indiaElement = screen.queryByTestId('country-5');
      expect(indiaElement).not.toBeInTheDocument();
    });
  });
});
