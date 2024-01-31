import { render, screen } from '@testing-library/react';
import ViewUserProfile from './ViewUserProfile';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'fetch-mock';
import { AuthContext } from '../App.jsx';
import checkAuthentication from '../constants/checkAuthentication';

const API_URL = import.meta.env.VITE_API_URL;

describe('ViewUserProfile Component', () => {
  let originalCheckAuthentication;
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (function () {
      let store = {};
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    

    // Save the original function to restore it later
    originalCheckAuthentication = checkAuthentication.checkAuthentication;

    // Create a stub for checkAuthentication
    checkAuthentication.checkAuthentication = callback => {
      const refresh = localStorage.getItem('refreshToken');

      if (!refresh) {
        callback(false);
        return;
      }

      try {
        // Mock the behavior of setting the access token
        localStorage.setItem('accessToken', 'mockAccessToken');
        callback(true);
      } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        callback(false);
      }
    };

    fetchMock.reset();

    fetchMock.get(API_URL + 'users/63', () => {
      const profile = {
        id: 63,
        first_name: 'test',
        last_name: 'ing',
        email: '6@email.com',
        company: 'smu',
        interests: '-',
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
      value: 'userId=63',
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
    // Simulate setting a cookie with user profile data
    document.cookie = 'userId=63; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';

    // Check authentication
    await checkAuthentication(() => {});

    // Render the component
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: true, setIsAuthenticated: () => {} }}>
          <ViewUserProfile />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Check if the component renders the user profile based on the cookie
    expect(await screen.findByTestId('fullName')).toHaveTextContent('test ing');
    expect(screen.getByText('Email: 6@email.com')).toBeInTheDocument();
    expect(screen.getByText('Company: smu')).toBeInTheDocument();
    expect(screen.getByText('Interests: -')).toBeInTheDocument();
    expect(screen.getByText('Contact Number: 91299999')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Edit Profile');

    // Clean up the cookie and local storage after the test
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  });
});
