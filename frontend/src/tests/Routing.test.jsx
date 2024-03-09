import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect } from 'vitest';
import { renderWithAuthContext } from '../utils/testUtils.jsx';
import * as paths from '../constants/paths.js';
import App from '../App.jsx';
import Login from '../routes/Login.jsx';
import SignUp from '../routes/SignUp';
import React from 'react';
import ViewUserProfile from '../routes/ViewUserProfile.jsx';
import EditUserProfile from '../routes/EditUserProfile.jsx';
import fetchMock from 'fetch-mock';

describe('Testing Routing', () => {
  test('Navbar renders with login and sign up buttons on page load', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.LOGIN, element: <Login /> },
    ];
    await waitFor(() => {
      renderWithAuthContext(routes, ['/'], false);
    });

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('Clicking on Login button navigates to LOGIN page with input fields', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.LOGIN, element: <Login /> },
    ];
    await waitFor(() => {
      renderWithAuthContext(routes, ['/'], false);
    });

    await waitFor(() => {
      const loginButton = screen.getByText('Login');
      userEvent.click(loginButton);
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
  });

  test('Upon successful authentication, Navbar changes to show profile and logout buttons', async () => {
    const routes = [{ path: '/', element: <App /> }];
    renderWithAuthContext(routes, ['/'], true);

    await waitFor(() => {
      screen.debug();
      expect(screen.getByText('View User Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  test('Clicking on View User Profile button navigates to VIEW_USER_PROFILE page with user profile fields', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
    ];
    renderWithAuthContext(routes, ['/'], true);

    await waitFor(() => {
      screen.debug();
    });

    const viewUserProfileButton = screen.getByText('View User Profile');
    userEvent.click(viewUserProfileButton);

    await waitFor(() => {
      // Check for the presence of user profile fields
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Company:')).toBeInTheDocument();
      expect(screen.getByText('Interests:')).toBeInTheDocument();
      expect(screen.getByText('Contact Number:')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  test('Clicking on Edit button that is inside container in the ViewUserProfile page navigates to EDIT_USER_PROFILE page with edit fields', async () => {
    const routes = [
      { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
      { path: paths.EDIT_USER_PROFILE, element: <EditUserProfile /> },
    ];
    renderWithAuthContext(routes, [paths.VIEW_USER_PROFILE], true);
    await waitFor(() => {
      const editProfileButton = screen.getByText('Edit Profile');
      userEvent.click(editProfileButton);
    });
    await waitFor(() => {
      screen.debug();
      expect(screen.getByLabelText('First Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Company:')).toBeInTheDocument();
      expect(screen.getByLabelText('Interests:')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Number:')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('Clicking on Update button shows success message and navigates back to VIEW_USER_PROFILE page', async () => {
    await waitFor(() => {
      const routes = [
        { path: paths.EDIT_USER_PROFILE, element: <EditUserProfile /> },
        { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
      ];
      renderWithAuthContext(
        routes,
        [
          {
            pathname: paths.EDIT_USER_PROFILE,
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
              contact_number: '+65 9129 9999',
            },
          },
        ],
        true,
      );
    });

    const firstNameInput = await screen.getByTestId('select-interest');
    // expect(firstNameInput).toHaveValue('test');
    await waitFor(() => {
      const updateButton = screen.getByText('Update');
      userEvent.click(updateButton);
    });
    await waitFor(() => {
      const successModal = screen.getByTestId('successful-modal');
      expect(successModal).toBeInTheDocument();
      expect(screen.getByText('Update was successful!')).toBeInTheDocument();
    });
    const continueToViewProfileButton = screen.getByText('Continue to View Profile');
    userEvent.click(continueToViewProfileButton);

    await waitFor(() => {
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Company:')).toBeInTheDocument();
    });
  });

  test('Going back to EDIT_USER_PROFILE page upon clicking on cancel button navigates back to VIEW_USER_PROFILE page', async () => {
    const routes = [
      { path: paths.EDIT_USER_PROFILE, element: <EditUserProfile /> },
      { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
    ];
    renderWithAuthContext(routes, [paths.EDIT_USER_PROFILE], true);
    await waitFor(() => {
      const updateButton = screen.getByText('Cancel');
      userEvent.click(updateButton);
    });
    await waitFor(() => {
      screen.debug();
      expect(screen.getByText('Contact Number:')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  test('Clicking on Logout button navigates back to page with login and sign up buttons', async () => {
    const routes = [{ path: '/', element: <App /> }];
    renderWithAuthContext(routes, ['/'], true);
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      userEvent.click(logoutButton);
    });
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  test('Clicking on Sign Up button navigates to SIGN_UP page with sign up fields', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.SIGN_UP, element: <SignUp /> },
    ];
    renderWithAuthContext(routes, ['/'], true);

    screen.debug();

    await waitFor(() => {
      const signUpButton = screen.getByText('Sign Up');
      userEvent.click(signUpButton);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('First Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    });
  });

  test('Sign up submission Button in Signup page shows success modal and success modal Continue to login button navigates to LOGIN page with login fields', async () => {
    const routes = [
      { path: paths.SIGN_UP, element: <SignUp /> },
      { path: paths.LOGIN, element: <Login /> },
    ];
    renderWithAuthContext(routes, [paths.SIGN_UP], false);

    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    userEvent.clear(firstNameInput);
    userEvent.type(firstNameInput, 'newFirstName');
    expect(firstNameInput).toHaveValue('newFirstName');

    const lastNameInput = screen.getByPlaceholderText(/Last Name/i);
    userEvent.clear(lastNameInput);
    userEvent.type(lastNameInput, 'newLastName');
    expect(lastNameInput).toHaveValue('newLastName');

    const emailInput = screen.getByPlaceholderText(/Email/i);
    userEvent.clear(emailInput);
    userEvent.type(emailInput, 'newtestemail@test.com');
    expect(emailInput).toHaveValue('newtestemail@test.com');

    const passwordInput = screen.getByTestId('password-input');
    userEvent.clear(passwordInput);
    userEvent.type(passwordInput, 'P@ssword1');
    expect(passwordInput).toHaveValue('P@ssword1');

    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    userEvent.clear(confirmPasswordInput);
    userEvent.type(confirmPasswordInput, 'P@ssword1');
    expect(confirmPasswordInput).toHaveValue('P@ssword1');

    const companyInput = screen.getByPlaceholderText(/Company/i);
    userEvent.clear(companyInput);
    userEvent.type(companyInput, 'testCompany');
    expect(companyInput).toHaveValue('testCompany');

    // INTERESTS DROPDOWN SELECTION
    // Wait for the 'interests' options to be loaded and find "fintech" option
    const fintechOption = await screen.findByText('BA');

    // Retrieve the <select> tag
    const interestSelect = screen.getByTestId('select-interest');

    // Select the "fintech" option in the <select> tag
    userEvent.selectOptions(interestSelect, [fintechOption.value]);

    // After selecting "fintech", "fintech" is now test id of the <option> with "fintech"
    const optionSelect = screen.getByTestId('BA');

    // Remove the X button so that we can check "fintech" is selected
    const optionSelectWithoutButton = optionSelect.childNodes[0].nodeValue.trim();
    expect(optionSelectWithoutButton).toBe('BA');

    // SIGN UP BUTTON
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    // console.log(signUpButton);

    // Phone Number
    const phoneNumberInput = screen.getByPlaceholderText(/Enter contact number/i);
    userEvent.clear(phoneNumberInput);
    userEvent.type(phoneNumberInput, '+65 9237 8017');
    expect(phoneNumberInput).toHaveValue('+65 9237 8017');

    userEvent.click(signUpButton);

    await waitFor(() => {
      const successModal = screen.getByTestId('success-modal');
      expect(successModal).toBeInTheDocument();

      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });

    const continueToLoginButton = await screen.getByText('Continue to Login');
    userEvent.click(continueToLoginButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
    fetchMock.restore();
    localStorage.clear();
  });
});
