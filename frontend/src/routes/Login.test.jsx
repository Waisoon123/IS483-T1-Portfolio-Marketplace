import { render, screen } from '@testing-library/react';
import Login from './Login';
import { test, expect } from 'vitest';

test('renders login component', () => {
  render(<Login />);

  // Check if email input is rendered
  const emailInput = screen.getByLabelText('Email');
  expect(emailInput).toBeInTheDocument();
  expect(emailInput).toHaveAttribute('type', 'text');

  // Check if password input is rendered
  const passwordInput = screen.getByLabelText('Password');
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput).toHaveAttribute('type', 'password');

  // Check if submit button is rendered
  const submitButton = screen.getByRole('button', { name: 'Login' });
  expect(submitButton).toBeInTheDocument();
});
