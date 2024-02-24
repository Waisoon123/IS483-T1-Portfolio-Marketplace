import { waitFor, screen } from '@testing-library/react';
import ViewUserProfile from '../routes/ViewUserProfile.jsx';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fetchMock from 'fetch-mock';
import checkAuthentication from '../utils/checkAuthentication.js';
import * as storageKeys from '../constants/storageKeys.js';
import { renderWithRouterAndAuth } from '../utils/testUtils.jsx';

const API_URL = import.meta.env.VITE_API_URL;

describe('ViewUserProfile Component', () => {
  let originalCheckAuthentication;
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    originalCheckAuthentication = checkAuthentication.checkAuthentication;
    checkAuthentication.checkAuthentication = () => Promise.resolve(true);
    localStorageMock = (function () {
      let store = {};
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value;
        },
        removeItem: function (key) {
          delete store[key];
        },
        clear: function () {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    fetchMock.reset();

    fetchMock.get(API_URL + 'users/63', () => {
      const profile = {
        id: 63,
        first_name: 'test',
        last_name: 'ing',
        email: '6@email.com',
        company: 'smu',
        interests: [
          {
            id: 1,
            name: 'fintech',
          },
        ],
        contact_number: '91299999',
      };

      console.log('Fetched profile:', profile);

      return {
        status: 200,
        body: JSON.stringify(profile),
      };
    });

    // Mock document.cookie to return a specific user ID
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `${storageKeys.USER_ID}=63`,
    });
  });

  afterEach(() => {
    // Restore the original function after each test
    checkAuthentication.checkAuthentication = originalCheckAuthentication;

    // Restore fetch to its original state
    fetchMock.restore();

    // Clear localStorage
    localStorage.clear();
  });

  test('renders ViewUserProfile component with user profile data from cookie', async () => {
    localStorage.setItem('refreshToken', 'mockRefreshToken');

    fetchMock.post(`${API_URL}token/refresh/`, {
      ok: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        access: 'mockAccessToken',
      },
    });

    // Simulate setting a cookie with user profile data
    // document.cookie = 'userID=63; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';

    // Render the component
    renderWithRouterAndAuth(<ViewUserProfile />);

    waitFor(() => {
      // Check if the component renders the user profile based on the cookie
      expect(screen.findByTestId('fullName')).toHaveTextContent('test ing');
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('6@email.com')).toBeInTheDocument();
      expect(screen.getByText('Company:')).toBeInTheDocument();
      expect(screen.getByText('smu')).toBeInTheDocument();
      expect(screen.getByText('Interests:')).toBeInTheDocument();
      expect(screen.getByTestId('fintech')).toHaveTextContent('fintech');
      expect(screen.getByText('Contact Number:')).toBeInTheDocument();
      expect(screen.getByText('91299999')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Edit Profile');

      // Clean up the cookie and local storage after the test
      document.cookie = `${storageKeys.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
    });
  });
});
