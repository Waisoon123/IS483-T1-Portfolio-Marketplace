import { screen, waitFor } from '@testing-library/react';
import Login from '../routes/Login.jsx';
import { test, expect } from 'vitest';
import { renderWithRouterAndAuth } from '../utils/testUtils.jsx';

test('renders login component', () => {
  renderWithRouterAndAuth(<Login />, { isAuthenticated: false });

  waitFor(() => {
    // Check if email input is rendered
    const emailInput = screen.getByLabelText('Email:');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'text');

    // Check if password input is rendered
    const passwordInput = screen.getByLabelText('Password:');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check if submit button is rendered
    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).toBeInTheDocument();
  });
});
