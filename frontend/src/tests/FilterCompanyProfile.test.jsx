import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import CompanyDetails from '../components/CompanyDetails';
import Directory from '../routes/Directory';
import { MemoryRouter } from 'react-router-dom';
import { FilterPanel } from '../routes/FilterPanel';
import * as paths from '../constants/paths';

const API_URL = import.meta.env.VITE_API_URL;

let companyData;

describe('EditUserProfile', () => {
    beforeEach(() => {
      companyData = [{
        "id": 20,
        "company": "BeepKart",
        "description": "A full-stack online retailer of used 2-wheelers BeepKart is building a platform to digitize and organize the used two-wheeler market.   The team has backgrounds in serial entrepreneurship, tech VC, mobility, software, and fast-scaling start-up operations.   The company is adequately seed-funded by the founders.",
        "tech_sector": [
            35
        ],
        "hq_main_office": 5,
        "vertex_entity": [
            6
        ],
        "finance_stage": 6,
        "status": "active",
        "website": "beepkart.com"
    },
    {
        "id": 130,
        "company": "Kapiva Ayurveda",
        "description": "Kapiva Ayurveda is a fast-growing Ayurvedic food brand Kapiva Ayurveda is a disruptive healthcare start-up in the fast-growing global Ayurveda market. Backed by the iconic Baidyanath Group, we at Kapiva are passionate about adapting traditional Ayurvedic knowledge to the needs of the modern consumer. Through our high-quality product range, our mission is to provide a new-age Ayurveda for a new-age customer. We make a range of Ayurvedic nutrition focused products like plant protein powders, A2 ghee, juices, herbal teas, flavoured honeys and more.  Kapiva was founded in early 2016, and currently has shelf presence in over 150 retail outlets, sells through multiple e-commerce portals like Amazon, 1mg, Big Basket to name a few and exports to international markets. We have been successfully doubling sales every quarter, and are excited to enter their next phase of growth.  We have also been fortunate to enjoy the trust and partnership of our strategic investors who have experience leading some of India’s most illustrious firs (including Reliance Capital, Lightspeed Ventures, Gits Foods & OYO Rooms).",
        "tech_sector": [
            35,
            67
        ],
        "hq_main_office": 5,
        "vertex_entity": [
            6
        ],
        "finance_stage": 11,
        "status": "active",
        "website": "kapiva.in"
    }];
    });

    fetchMock.get(`${API_URL}?tech_sectors=35&hq_main_offices=5/`, {
      count: 2,
      next: null,
      previous: null,
      results: companyData,
    });

    afterEach(() => {
        fetchMock.reset();
      });

    test('renders Filter without errors', () => {
    render(
        <MemoryRouter>
        <FilterPanel />
        </MemoryRouter>,
    );   
    // Check if the sector tabs is rendered
    

    // Check if the filter indicators is rendered
    

    // Check if the clear button is rendered

    // Check if the checkboxes is rendered
    });

}); 