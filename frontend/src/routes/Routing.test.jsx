import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter as Router, MemoryRouter, Routes } from 'react-router-dom';
import App, { AuthContext } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import ViewUserProfile from './ViewUserProfile.jsx';
import EditUserProfile from './EditUserProfile.jsx';
import * as paths from '../constants/paths.js';

test('Navbar renders with login and sign up buttons on page load', () => {
  render(
    <Router>
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <App />
      </AuthContext.Provider>
    </Router>,
  );
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Sign Up')).toBeInTheDocument();
});

test('Clicking on Login button navigates to LOGIN page with input fields', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  waitFor(() => {
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    waitFor(() => {
      expect(window.location.pathname).toBe(paths.LOGIN);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});

test('Upon successful authentication, Navbar changes to show profile and logout buttons', () => {
  // Simulate successful authentication
  render(
    <MemoryRouter initialEntries={['/']}>
      {' '}
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        {' '}
        <Navbar />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  // Expectations for authenticated state
  expect(screen.getByText('View User Profile')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('Clicking on View User Profile button navigates to VIEW_USER_PROFILE page with user profile fields', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const viewUserProfileButton = screen.getByText('View User Profile');
    fireEvent.click(viewUserProfileButton);

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
  render(
    <MemoryRouter initialEntries={[paths.VIEW_USER_PROFILE]}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const editProfileButton = screen.getByText('Edit Profile');
    fireEvent.click(editProfileButton);

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
  render(
    <MemoryRouter initialEntries={[paths.EDIT_USER_PROFILE]}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(screen.getByText('Update was successful')).toBeInTheDocument();

      const continueToViewProfileButton = screen.getByText('Continue to view profile');
      fireEvent.click(continueToViewProfileButton);

      expect(window.location.pathname).toBe(paths.VIEW_USER_PROFILE);
    });
  });
});

test('Going back to EDIT_USER_PROFILE page upon clicking on cancel button navigates back to VIEW_USER_PROFILE page', () => {
  render(
    <MemoryRouter initialEntries={[paths.EDIT_USER_PROFILE]}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  // Wait for the component to finish rendering before accessing the button
  waitFor(() => {
    const updateButton = screen.getByText('Cancel');
    fireEvent.click(updateButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(window.location.pathname).toBe(paths.VIEW_USER_PROFILE);
    });
  });
});

test('Clicking on Logout button navigates back to page with login and sign up buttons', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  waitFor(() => {
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Use the waitFor function to wait for the navigation to occur
    waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });
});

test('Clicking on Sign Up button navigates to SIGN_UP page with sign up fields', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  waitFor(() => {
    const signUpButton = screen.getByText('Sign Up');
    fireEvent.click(signUpButton);

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
  render(
    <MemoryRouter initialEntries={[paths.SIGN_UP]}>
      <SignUp />
    </MemoryRouter>,
  );

  // Simulate filling out the form
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: '123@email.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234!ABcd' } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '1234!ABcd' } });
  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Apple' } });
  fireEvent.change(screen.getByLabelText('Interests'), { target: { value: 'Coding' } });
  fireEvent.change(screen.getByLabelText('Contact Number'), { target: { value: '91239999' } });

  // Simulate clicking on the Sign Up button
  fireEvent.click(screen.getByText('Sign Up'));

  // Wait for the modal to appear
  waitFor(() => {
    expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
    expect(screen.getByText('Continue to login')).toBeInTheDocument();
  });

  waitFor(() => {
    const continueToLoginButton = screen.getByText('Continue to Login');
    fireEvent.click(continueToLoginButton);

    waitFor(() => {
      expect(window.location.pathname).toBe(paths.LOGIN);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});
