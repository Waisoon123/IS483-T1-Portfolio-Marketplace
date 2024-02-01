import { render, screen, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import * as errorMessages from '../constants/errorMessages';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;
const FORM_LABEL_TEXTS = {};
const DYNAMIC_PAYLOAD = {};

describe('SignUp Component', () => {
  beforeEach(() => {
    fetchMock.restore();

    FORM_LABEL_TEXTS.firstName = 'First Name:';
    FORM_LABEL_TEXTS.lastName = 'Last Name:';
    FORM_LABEL_TEXTS.email = 'Email:';
    FORM_LABEL_TEXTS.password = 'Password:';
    FORM_LABEL_TEXTS.confirmPassword = 'Confirm Password:';
    FORM_LABEL_TEXTS.company = 'Company:';
    FORM_LABEL_TEXTS.interests = 'Interests:';
    FORM_LABEL_TEXTS.contactNumber = 'Contact Number:';

    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.firstName] = 'test';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.lastName] = 'test';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.email] = 'test@test.test';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.password] = 'Ab#45678';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.confirmPassword] = 'Ab#45678';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.company] = 'SMU';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.interests] = 'Coding';
    DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS.contactNumber] = '91234567';

    fetchMock.get(CSRF_TOKEN_URL, {
      status: 200,
      body: JSON.stringify({
        csrfToken: 'random_csrf_token',
      }),
    });

    fetchMock.post(
      `${API_URL}users/`,
      {
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
      },
      { overwriteRoutes: true },
    );
  });

  const testDynamicField = async (field, invalidValue, expectedErrorMessage) => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    DYNAMIC_PAYLOAD[field] = invalidValue;

    Object.keys(DYNAMIC_PAYLOAD).forEach(key => {
      userEvent.type(screen.getByLabelText(key), String(DYNAMIC_PAYLOAD[key]));
    });

    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
    });
  };

  test('renders SignUp nmponent successfully', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    Object.keys(FORM_LABEL_TEXTS).forEach(key => {
      expect(screen.getByLabelText(FORM_LABEL_TEXTS[key])).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('User signs up successfully, and is able to see the modal', async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    Object.keys(FORM_LABEL_TEXTS).forEach(label => {
      const field = screen.getByLabelText(FORM_LABEL_TEXTS[label]);
      userEvent.type(field, DYNAMIC_PAYLOAD[FORM_LABEL_TEXTS[label]]);
    });

    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  test('Create user with invalid first name', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.firstName, 'T3st', errorMessages.FIRST_NAME_ERROR_MESSAGE);
  });

  test('Create user with invalid last name', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.lastName, 'T3st', errorMessages.LAST_NAME_ERROR_MESSAGE);
  });

  test('Create user with invalid email', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.email, 'loremipsum@test', errorMessages.INVALID_EMAIL_ERROR_MESSAGE);
  });

  test('Create user with invalid password (Not consisting of numbers)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.password, 'Ab#cdefg', errorMessages.PASSWORD_ERROR_MESSAGE_DICT.number);
  });

  test('Create user with invalid password (Not consisting of special characters)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.password, 'Abcdefg1', errorMessages.PASSWORD_ERROR_MESSAGE_DICT.special);
  });

  test('Create user with invalid password (Not consisting of uppercase letters)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.password, 'ab#cdefg1', errorMessages.PASSWORD_ERROR_MESSAGE_DICT.upperCase);
  });

  test('Create user with invalid password (Not consisting of lowercase letters)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.password, 'AB#CDEFG1', errorMessages.PASSWORD_ERROR_MESSAGE_DICT.lowerCase);
  });

  test('Create user with invalid password (Not of minimum length)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.password, 'Ab#4567', errorMessages.PASSWORD_ERROR_MESSAGE_DICT.minLength);
  });

  test('Create user with invalid confirm password (Not entered)', async () => {
    await testDynamicField(
      FORM_LABEL_TEXTS.confirmPassword,
      '',
      errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.empty,
    );
  });

  test('Create user with invalid confirm password (Not matched)', async () => {
    await testDynamicField(
      FORM_LABEL_TEXTS.confirmPassword,
      'Ab#45679',
      errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.notMatch,
    );
  });

  test('Create user with invalid company (Not entered)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.company, '', errorMessages.EMPTY_COMPANY_ERROR_MESSAGE);
  });

  test('Create user with invalid interests (Not entered)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.interests, '', errorMessages.EMPTY_INTERESTS_ERROR_MESSAGE);
  });

  test('Create user with invalid contact number (Entered but not valid)', async () => {
    await testDynamicField(FORM_LABEL_TEXTS.contactNumber, '12345678', errorMessages.CONTACT_NUMBER_ERROR_MESSAGE);
  });
});
