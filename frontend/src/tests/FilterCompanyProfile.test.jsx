import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import CompanyDetails from '../components/CompanyDetails';
import Directory from '../routes/Directory';
import { MemoryRouter } from 'react-router-dom';
import { LandingHero } from '../components/LandingHero';
import * as paths from '../constants/paths';

const API_URL = import.meta.env.VITE_API_URL;

let companyData;

