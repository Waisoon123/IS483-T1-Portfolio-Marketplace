import { render, screen } from '@testing-library/react';
import Login from './Login';
import { test, expect } from 'vitest';
import { AuthContext } from '../App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

test('renders login component', () => {
  render(
    <Router>
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <Login />
      </AuthContext.Provider>
    </Router>,
  );
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
