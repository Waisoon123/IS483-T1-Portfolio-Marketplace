import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect } from 'vitest';
import Navbar from '../components/Navbar.jsx';
import { renderWithRouterAndAuth } from '../utils/test-utils';
import * as paths from '../constants/paths.js';

test('Navbar renders with login and sign up buttons on page load', () => {
  renderWithRouterAndAuth({ isAuthenticated: false });

  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Sign Up')).toBeInTheDocument();
});

test('Clicking on Login button navigates to LOGIN page with input fields', () => {
  renderWithRouterAndAuth({ isAuthenticated: false });

  waitFor(() => {
    const loginButton = screen.getByText('Login');
    userEvent.click(loginButton);

    waitFor(() => {
      expect(window.location.pathname).toBe(paths.LOGIN);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});

test('Upon successful authentication, Navbar changes to show profile and logout buttons', () => {
  renderWithRouterAndAuth(<Navbar />);

  // Expectations for authenticated state
  waitFor(() => {
    expect(screen.getByText('View User Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});

test('Clicking on View User Profile button navigates to VIEW_USER_PROFILE page with user profile fields', () => {
  renderWithRouterAndAuth();

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const viewUserProfileButton = screen.getByText('View User Profile');
    userEvent.click(viewUserProfileButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(window.location.pathname).toBe(paths.VIEW_USER_PROFILE);

      // Check for the presence of user profile fields
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Company')).toBeInTheDocument();
      expect(screen.getByLabelText('Interests')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Number')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });
});

test('Clicking on Edit button that is inside container in the ViewUserProfile page navigates to EDIT_USER_PROFILE page with edit fields', async () => {
  renderWithRouterAndAuth({ initialEntries: [paths.VIEW_USER_PROFILE] });

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const editProfileButton = screen.getByText('Edit Profile');
    userEvent.click(editProfileButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(window.location.pathname).toBe(paths.EDIT_USER_PROFILE);
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Company')).toBeInTheDocument();
      expect(screen.getByLabelText('Interests')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Number')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
});

test('Clicking on Update button shows success message and navigates back to VIEW_USER_PROFILE page', () => {
  renderWithRouterAndAuth({ initialEntries: [paths.EDIT_USER_PROFILE] });

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const updateButton = screen.getByText('Update');
    userEvent.click(updateButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(screen.getByText('Update was successful')).toBeInTheDocument();

      const continueToViewProfileButton = screen.getByText('Continue to view profile');
      userEvent.click(continueToViewProfileButton);

      expect(window.location.pathname).toBe(paths.VIEW_USER_PROFILE);
    });
  });
});

test('Going back to EDIT_USER_PROFILE page upon clicking on cancel button navigates back to VIEW_USER_PROFILE page', () => {
  renderWithRouterAndAuth({ initialEntries: [paths.EDIT_USER_PROFILE] });

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const updateButton = screen.getByText('Cancel');
    userEvent.click(updateButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(window.location.pathname).toBe(paths.VIEW_USER_PROFILE);
    });
  });
});

test('Clicking on Logout button navigates back to page with login and sign up buttons', () => {
  renderWithRouterAndAuth();

  waitFor(() => {
    const logoutButton = screen.getByText('Logout');
    userEvent.click(logoutButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });
});

test('Clicking on Sign Up button navigates to SIGN_UP page with sign up fields', () => {
  renderWithRouterAndAuth({ isAuthenticated: false });

  waitFor(() => {
    const signUpButton = screen.getByText('Sign Up');
    userEvent.click(signUpButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(window.location.pathname).toBe(paths.SIGN_UP);
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });
});

test('Sign up submission Button in Signup page shows success modal and success modal Continue to login button navigates to LOGIN page with login fields', () => {
  renderWithRouterAndAuth({ initialEntries: [paths.SIGN_UP] });

  waitFor(() => {
    // Simulate filling out the form
    userEvent.type(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    userEvent.type(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    userEvent.type(screen.getByPlaceholderText('Email'), { target: { value: '123@email.com' } });
    userEvent.type(screen.getByTestId('password-input'), { target: { value: '1234!ABcd' } });
    userEvent.type(screen.getByTestId('confirm-password-input'), { target: { value: '1234!ABcd' } });
    userEvent.type(screen.getByPlaceholderText('Company'), { target: { value: 'Apple' } });
    userEvent.type(screen.getByPlaceholderText('Interests'), { target: { value: 'Code' } });
    userEvent.type(screen.getByPlaceholderText('Enter contact number'), { target: { value: '91239999' } });

    // Simulate clicking on the Sign Up button
    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
  });
  // Wait for the modal to appear
  waitFor(() => {
    expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
    expect(screen.getByText('Continue to login')).toBeInTheDocument();
  });

  waitFor(() => {
    const continueToLoginButton = screen.getByText('Continue to Login');
    userEvent.click(continueToLoginButton);

    waitFor(() => {
      expect(window.location.pathname).toBe(paths.LOGIN);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});
