import { render, screen } from '@testing-library/react';
import ViewUserProfile from './ViewUserProfile';
import { describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'fetch-mock';

const API_URL = import.meta.env.VITE_API_URL;

describe('SignUp Component', () => {
  beforeEach(() => {
    fetchMock.reset();

    fetchMock.get(API_URL + 'users/63', {
      status: 200,
      body: JSON.stringify({
        id: 63,
        first_name: 'test',
        last_name: 'ing',
        email: '6@email.com',
        company: 'smu',
        interests: '-',
        contact_number: '91299999',
      }),
    });
  });

  test('renders ViewUserProfile component with user profile data from cookie', async () => {
    // Simulate setting a cookie with user profile data
    document.cookie = 'userId=63; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';

    // Render the component
    render(
      <MemoryRouter>
        <ViewUserProfile />
      </MemoryRouter>,
    );

    // Check if the component renders the user profile based on the cookie
    expect(await screen.findByTestId('fullName')).toHaveTextContent('test ing');
    expect(screen.getByText('Email: 6@email.com')).toBeInTheDocument();
    expect(screen.getByText('Company: smu')).toBeInTheDocument();
    expect(screen.getByText('Interests: -')).toBeInTheDocument();
    expect(screen.getByText('Contact Number: 91299999')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Edit Profile');

    // Clean up the cookie after the test
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    // Restore fetch to its original state
    fetchMock.restore();
  });

});
