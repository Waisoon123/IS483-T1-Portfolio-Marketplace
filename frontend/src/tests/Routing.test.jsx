import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { test, expect, describe } from 'vitest';
import { renderWithAuthContext } from '../utils/testUtils.jsx';
import * as paths from '../constants/paths.js';
import App from '../App.jsx';
import Login from '../routes/Login.jsx';
import SignUp from '../routes/SignUp';
import ViewUserProfile from '../routes/ViewUserProfile.jsx';
import EditUserProfile from '../routes/EditUserProfile.jsx';
import Directory from '../routes/Directory.jsx';

describe('Testing Routing', () => {
  test('Navbar renders with login and sign up buttons on page load', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.LOGIN, element: <Login /> },
    ];
    await waitFor(() => {
      renderWithAuthContext(routes, ['/'], false);
    });

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
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
      expect(screen.getByRole('link', { name: 'View User Profile' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
      const header = screen.getByRole('heading', { level: 1, name: /Find what you need/i });
      expect(header).toBeInTheDocument();
    });
  });

  test('Footer is rendered with links to Home and Directory', async () => {
    const routes = [{ path: '/', element: <App /> }];
    await waitFor(() => {
      renderWithAuthContext(routes, ['/'], false);
    });

    await waitFor(() => {
      //specify that it is footer
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();

      //check headers
      const header_entities = screen.getByRole('heading', { level: 5, name: /ENTITIES/i });
      expect(header_entities).toBeInTheDocument();

      const header_links = screen.getByRole('heading', { level: 5, name: /QUICK LINKS/i });
      expect(header_links).toBeInTheDocument();

      const header_contact = screen.getByRole('heading', { level: 5, name: /CONTACT US/i });
      expect(header_contact).toBeInTheDocument();
      // check links
      expect(screen.getByTestId('footer-home')).toBeInTheDocument();
      expect(screen.getByTestId('footer-directory')).toBeInTheDocument();
    });
  }); 

  test('Clicking on Footer Directory link navigates to Directory', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.DIRECTORY, element: <Directory /> },
    ];

    await waitFor(() => {
      renderWithAuthContext(routes, ['/'], false);
    });

    await waitFor(() => {
      const directButton = screen.getByTestId('footer-directory');
      userEvent.click(directButton);
    });
    await waitFor(() => {
      const header_directory = screen.getByRole('heading', { level: 2, name: /Backed by Vertex/i });
      expect(header_directory).toBeInTheDocument();
      const p_directory = screen.getByText('We have invested in over 300 companies. Here, you can search for Vertex companies by industry, region, company size, and more.');
      expect(p_directory).toBeInTheDocument();
    });
  });

  test('Clicking on View User Profile button navigates to VIEW_USER_PROFILE page with user profile fields', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
    ];
    renderWithAuthContext(routes, ['/'], true);

    await waitFor(() => {
      const viewUserProfileButton = screen.getByText('View User Profile');
      userEvent.click(viewUserProfileButton);
    });

    await waitFor(() => {
      // Check for the presence of user profile fields
      expect(screen.getByTestId('fullName')).toHaveTextContent('test ing');
      expect(screen.getByTestId('email')).toHaveTextContent('6@email.com');
      expect(screen.getByTestId('company')).toHaveTextContent('smu');
      expect(screen.getByTestId('contact-number')).toHaveTextContent('+65 9129 9999');
      expect(screen.getByTestId('fintech')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
    });
  });

  test('Clicking on Edit button that is inside container in the ViewUserProfile page navigates to EDIT_USER_PROFILE page with edit fields', async () => {
    const routes = [
      { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
      { path: paths.EDIT_USER_PROFILE, element: <EditUserProfile /> },
    ];
    renderWithAuthContext(routes, [paths.VIEW_USER_PROFILE], true);
    await waitFor(() => {
      const editProfileButton = screen.getByRole('button', 'Edit Profile');
      userEvent.click(editProfileButton);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('First Name*')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name*')).toBeInTheDocument();
      expect(screen.getByLabelText('Company*')).toBeInTheDocument();
      expect(screen.getByText('Interests*')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Number*')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
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

    await waitFor(() => {
      const updateButton = screen.getByRole('button', { name: /Save/i });
      userEvent.click(updateButton);
    });
    const successModal = screen.getByTestId('successful-modal');
    expect(successModal).toBeInTheDocument();
    expect(screen.getByText('Update was successful!')).toBeInTheDocument();
    const continueToViewProfileButton = screen.getByText('Continue to View Profile');
    userEvent.click(continueToViewProfileButton);

    await waitFor(() => {
      expect(screen.getByTestId('fullName')).toHaveTextContent('test ing');
      expect(screen.getByTestId('email')).toHaveTextContent('6@email.com');
      expect(screen.getByTestId('company')).toHaveTextContent('smu');
      expect(screen.getByTestId('contact-number')).toHaveTextContent('+65 9129 9999');
      expect(screen.getByTestId('fintech')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
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
      expect(screen.getByTestId('fullName')).toHaveTextContent('test ing');
      expect(screen.getByTestId('email')).toHaveTextContent('6@email.com');
      expect(screen.getByTestId('company')).toHaveTextContent('smu');
      expect(screen.getByTestId('contact-number')).toHaveTextContent('+65 9129 9999');
      expect(screen.getByTestId('fintech')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
    });
  });

  test('Clicking on Logout button navigates back to page with login and sign up buttons', async () => {
    const routes = [{ path: '/', element: <App /> }];
    renderWithAuthContext(routes, ['/'], true);
    await waitFor(() => {
      const logoutButton = screen.getByRole('link', { name: 'Logout' });
      userEvent.click(logoutButton);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });

  test('Clicking on Sign Up button navigates to SIGN_UP page with sign up fields', async () => {
    const routes = [
      { path: '/', element: <App /> },
      { path: paths.SIGN_UP, element: <SignUp /> },
    ];
    renderWithAuthContext(routes, ['/'], true);

    await waitFor(() => {
      const signUpButton = screen.getByRole('link', { name: 'Sign Up' });
      userEvent.click(signUpButton);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('First Name*')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name*')).toBeInTheDocument();
      expect(screen.getByLabelText('Email*')).toBeInTheDocument();
      expect(screen.getByLabelText('Password*')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password*')).toBeInTheDocument();
      expect(screen.getByLabelText('Company*')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Number*')).toBeInTheDocument();
      expect(screen.getByText('Interests*')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });

  test('Sign up submission Button in Signup page shows success modal and success modal Continue to login button navigates to LOGIN page with login fields', async () => {
    const routes = [
      { path: paths.SIGN_UP, element: <SignUp /> },
      { path: paths.LOGIN, element: <Login /> },
    ];
    renderWithAuthContext(routes, [paths.SIGN_UP], false);

    const firstNameInput = screen.getByTestId('first-name-input');
    userEvent.clear(firstNameInput);
    userEvent.type(firstNameInput, 'newFirstName');
    expect(firstNameInput).toHaveValue('newFirstName');

    const lastNameInput = screen.getByTestId('last-name-input');
    userEvent.clear(lastNameInput);
    userEvent.type(lastNameInput, 'newLastName');
    expect(lastNameInput).toHaveValue('newLastName');

    const emailInput = screen.getByTestId('email-input');
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

    const companyInput = screen.getByTestId('company-input');
    userEvent.clear(companyInput);
    userEvent.type(companyInput, 'testCompany');
    expect(companyInput).toHaveValue('testCompany');

    // INTERESTS DROPDOWN SELECTION
    // Open the dropdown
    const dropdownIndicator = document.querySelector('.select__dropdown-indicator');
    fireEvent.mouseDown(dropdownIndicator);

    // Wait for the dropdown menu to be in the DOM
    const dropdownMenu = await screen.findByRole('listbox');

    // Find the option within the dropdown menu
    const option = await within(dropdownMenu).findByText('BA');

    // Click on the option
    userEvent.click(option);

    // SIGN UP BUTTON
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    // console.log(signUpButton);

    // Phone Number
    const phoneNumberInput = screen.getByTestId('contact-number-input');
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
