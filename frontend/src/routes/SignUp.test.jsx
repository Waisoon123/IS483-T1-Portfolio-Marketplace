import { render, screen, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import fireEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

describe('SignUp Component', () => {
  test('renders SignUp component successfully', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    // Check if all form fields are present
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Interests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();

    // Check if submit button is rendered
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  // User fills up all input fields and submits the form successfully, modal appears
  test('User signs up successfully, and is able to see the modal', async () => {
    // Mock a successful network request
    fetchMock.mock('/http://localhost:8000/api/users/', {
      status: 200,
      body: { success: true },
    });
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    // Fill in the form with valid data
    fireEvent.type(screen.getByLabelText(/First Name/i), 'John');
    fireEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
    fireEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    fireEvent.type(screen.getByTestId('password-input'), 'Abcd@1234');
    fireEvent.type(screen.getByTestId('confirm-password-input'), 'Abcd@1234');
    fireEvent.type(screen.getByLabelText(/Company/i), 'Singapore Management University');
    fireEvent.type(screen.getByLabelText(/Interests/i), 'Coding');
    fireEvent.type(screen.getByLabelText(/Contact Number/i), '+6591234567');

    // Trigger Form Submission
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Wait for the fetch call to be made
    await waitFor(() => {
      // Get the fetch calls
      const calls = fetchMock.calls('/http://localhost:8000/api/users/');

      // Check if a fetch call was made with the correct parameters
      expect(calls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            0: '/http://localhost:8000/api/users/',
            1: expect.objectContaining({
              method: 'POST',
              body: expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Abcd@1234',
                confirmPassword: 'Abcd@1234',
                company: 'Singapore Management University',
                interests: 'Coding',
                contactNumber: '+6591234567',
              }),
            }),
          }),
        ]),
      );
    });

    // Wait for the modal to be displayed
    await waitFor(
      () => {
        expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      },
      { timeout: 10000 }, // Wait up to 10000ms for the expectations to pass
    );

    // Cleanup: Restore fetch to its original implementation
    fetchMock.restore();
  });
});
