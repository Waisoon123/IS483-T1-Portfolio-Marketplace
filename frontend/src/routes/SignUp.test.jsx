import { render, screen, waitFor, fireEvent, getByTestId } from '@testing-library/react';
import SignUp from './SignUp';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;

describe('SignUp Component', () => {
  beforeEach(() => {
    fetchMock.reset();

    fetchMock.getOnce(
      CSRF_TOKEN_URL,
      {
        status: 200,
        body: JSON.stringify({
          csrfToken: 'random_csrf_token',
        }),
      },
      { repeat: Infinity },
    );

    fetchMock.post(API_URL + 'users/', {
      status: 201,
      ok: true,
      body: JSON.stringify({
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email: 'test@test.test',
        company: 'SMU',
        interests: 'Coding',
        contactNumber: '+6591234567',
      }),
    });
  });

  test('renders SignUp component successfully', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    // Check if all form fields are present
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Interests')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Number')).toBeInTheDocument();

    // Check if submit button is rendered
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('User signs up successfully, and is able to see the modal', async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    // Fill in the form with valid data
    userEvent.type(screen.getByLabelText('First Name'), 'test');
    userEvent.type(screen.getByLabelText('Last Name'), 'test');
    userEvent.type(screen.getByLabelText('Email'), 'test@test.test');
    userEvent.type(screen.getByLabelText('Password'), 'Ab#45678');
    userEvent.type(screen.getByLabelText('Confirm Password'), 'Ab#45678');
    userEvent.type(screen.getByLabelText('Company'), 'SMU');
    userEvent.type(screen.getByLabelText('Interests'), 'Coding');
    userEvent.type(screen.getByLabelText('Contact Number'), '91234567');

    // Trigger Form Submission
    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Wait for the modal to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });
});
