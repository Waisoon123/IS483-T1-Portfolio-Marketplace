import { screen, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../routes/Login.jsx';
import { test, expect, describe, beforeEach } from 'vitest';
import fetchMock from 'fetch-mock';
import { renderWithAuthContext } from '../utils/testUtils.jsx';
import * as paths from '../constants/paths.js';

const API_URL = import.meta.env.VITE_API_URL;

describe('Login Frontend Tests', () => {
  beforeEach(() => {
    const routes = [{ path: paths.LOGIN, element: <Login /> }];
    renderWithAuthContext(routes, [paths.LOGIN], false);
  });

  test('renders login page', async () => {
    await waitFor(() => {
      const headerWelcome = screen.getByRole('heading', { level: 1, name: /Welcome Back/i });
      expect(headerWelcome).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText(/Email/i);
      expect(emailInput).toBeInTheDocument();

      const passwordInput = screen.getByPlaceholderText(/Password/i);
      expect(passwordInput).toBeInTheDocument();

      const loginBtn = screen.getByRole('button', { name: /Login/i });
      expect(loginBtn).toBeInTheDocument();
    });
  });

  // test('Logins successfully', async () => {}); // Currently no modal is set up for successful login

  test('Invalid credentials, expects error modal', async () => {
    fetchMock.post(`${API_URL}login/`, 400);
    // Change the form inputs
    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText(/Email/i), 'invalid-email@example.com');
      userEvent.type(screen.getByPlaceholderText(/Password/i), 'invalid-password');
      const loginBtn = screen.getByRole('button', { name: /Login/i });
      expect(loginBtn).toBeInTheDocument();
      userEvent.click(loginBtn);
    });

    const errorModal = await screen.findByTestId('error-modal');
    expect(errorModal).toBeInTheDocument();

    const wrongCredentialsHeader = screen.getByRole('heading', { level: 3, name: /Wrong Credentials/i });
    expect(wrongCredentialsHeader).toBeInTheDocument();

    const errorMessage = screen.getByText(/Invalid username or password. Please try again./i);
    expect(errorMessage).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    expect(closeBtn).toBeInTheDocument();
  });
});
