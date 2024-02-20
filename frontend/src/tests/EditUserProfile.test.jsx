import { render, screen, waitFor } from '@testing-library/react';
import EditUserProfile from '../routes/EditUserProfile';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'fetch-mock';
import { AuthContext } from '../App.jsx';
import checkAuthentication from '../utils/checkAuthentication';
import * as storageKeys from '../constants/storageKeys.js';

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

    fetchMock.get(API_URL + 'interests/', () => {
      const interests = [
        {
          id: 1,
          name: 'fintech',
        },
        {
          id: 2,
          name: 'BA',
        },
      ];

      console.log('Fetched interests:', interests);

      return {
        status: 200,
        body: JSON.stringify(interests),
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

  test('renders EditUserProfile component with user profile data from cookie', async () => {
    // Set up mock responses
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

    let isAuthenticated = true;
    const setIsAuthenticated = value => {
      isAuthenticated = value;
    };

    // Render the component
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/',
            state: {
              from: 'profile',
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
            },
          },
        ]}
      >
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
          <EditUserProfile userId='63' />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Now that the fetch has completed, check the input's value
    await waitFor(() => expect(screen.findByLabelText('First Name:')).resolves.toHaveValue('test'), { timeout: 5000 });
    expect(screen.getByLabelText('Last Name:')).toHaveValue('ing');
    expect(screen.getByLabelText('Email:')).toHaveValue('6@email.com');
    expect(screen.getByLabelText('Company:')).toHaveValue('smu');
    expect(screen.getByTestId('fintech')).toHaveTextContent('fintech');
    expect(screen.getByLabelText('Contact Number:')).toHaveValue('91299999');
    expect(screen.queryByLabelText('Update Password')).not.toBeChecked();
    expect(screen.getByLabelText('Password:')).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password:')).toBeDisabled();

    // Clean up the cookie and local storage after the test
    document.cookie = `${storageKeys.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  });
});
