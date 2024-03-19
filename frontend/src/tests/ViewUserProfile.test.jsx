import { screen } from '@testing-library/react';
import ViewUserProfile from '../routes/ViewUserProfile.jsx';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fetchMock from 'fetch-mock';
import checkAuthentication from '../utils/checkAuthentication.js';
import { renderWithAuthContext } from '../utils/testUtils.jsx';
import * as paths from '../constants/paths.js';

const API_URL = import.meta.env.VITE_API_URL;

describe('ViewUserProfile Component', () => {
  let originalCheckAuthentication;

  beforeEach(() => {
    const routes = [{ path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> }];
    renderWithAuthContext(routes, [paths.VIEW_USER_PROFILE], true);
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
    // Check if the component renders the user profile based on the cookie
    expect(await screen.findByTestId('fullName')).toHaveTextContent('test ing');
    expect(screen.getByText('6@email.com')).toBeInTheDocument();
    expect(screen.getByText('smu')).toBeInTheDocument();
    expect(screen.getByTestId('fintech')).toHaveTextContent('fintech');
    expect(screen.getByText('+65 9129 9999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
  });
});
