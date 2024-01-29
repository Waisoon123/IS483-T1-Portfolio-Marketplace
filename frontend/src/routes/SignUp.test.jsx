import { render, screen, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import {
  firstNameErrorMessage,
  lastNameErrorMessage,
  emailErrorMessage,
  passwordErrorMessageDict,
  companyErrorMessage,
  interestErrorMessage,
  contactNumberErrorMessage,
  confirmPasswordErrorMessageDict,
} from '../constants/errorMessages';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;

describe('SignUp Component', () => {
  beforeEach(() => {
    fetchMock.reset();

    fetchMock.get(CSRF_TOKEN_URL, {
      status: 200,
      body: JSON.stringify({
        csrfToken: 'random_csrf_token',
      }),
    });

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

  const formLabelTexts = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    company: 'Company',
    interests: 'Interests',
    contactNumber: 'Contact Number',
  };

  const dynamicPayload = {
    [formLabelTexts.firstName]: 'test',
    [formLabelTexts.lastName]: 'test',
    [formLabelTexts.email]: 'test@test.test',
    [formLabelTexts.password]: 'Ab#45678',
    [formLabelTexts.confirmPassword]: 'Ab#45678',
    [formLabelTexts.company]: 'SMU',
    [formLabelTexts.interests]: 'Coding',
    [formLabelTexts.contactNumber]: '91234567',
  };

  const testDynamicField = async (field, invalidValue, expectedErrorMessage) => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    dynamicPayload[field] = invalidValue;

    Object.keys(dynamicPayload).forEach(key => {
      userEvent.type(screen.getByLabelText(key), dynamicPayload[key]);
    });

    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
    });
  };

  test('renders SignUp component successfully', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    Object.keys(formLabelTexts).forEach(key => {
      expect(screen.getByLabelText(formLabelTexts[key])).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('User signs up successfully, and is able to see the modal', async () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );

    Object.keys(formLabelTexts).forEach(label => {
      const field = screen.getByLabelText(formLabelTexts[label]);
      userEvent.type(field, dynamicPayload[formLabelTexts[label]]);
    });

    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  test('Create user with invalid first name', async () => {
    await testDynamicField(formLabelTexts.firstName, 'T3st', firstNameErrorMessage);
  });

  test('Create user with invalid last name', async () => {
    await testDynamicField(formLabelTexts.lastName, 'T3st', lastNameErrorMessage);
  });

  test('Create user with invalid email', async () => {
    await testDynamicField(formLabelTexts.email, 'loremipsum@test', emailErrorMessage);
  });

  // test ('Create user with used email', async () => {
  //   // Need to create object with the corresponding data and then after that try again with the email to get the error
  //   await testDynamicField(formLabelTexts.email, '5@email.com', 'user with this email already exists.');
  // });

  test('Create user with invalid password (Not consisting of numbers)', async () => {
    await testDynamicField(formLabelTexts.password, 'Ab#cdefg', passwordErrorMessageDict.number);
  });

  test('Create user with invalid password (Not consisting of special characters)', async () => {
    await testDynamicField(formLabelTexts.password, 'Abcdefg1', passwordErrorMessageDict.special);
  });

  test('Create user with invalid password (Not consisting of uppercase letters)', async () => {
    await testDynamicField(formLabelTexts.password, 'ab#cdefg1', passwordErrorMessageDict.upperCase);
  });

  test('Create user with invalid password (Not consisting of lowercase letters)', async () => {
    await testDynamicField(formLabelTexts.password, 'AB#CDEFG1', passwordErrorMessageDict.lowerCase);
  });

  test('Create user with invalid password (Not of minimum length)', async () => {
    await testDynamicField(formLabelTexts.password, 'Ab#4567', passwordErrorMessageDict.minLength);
  });

  test('Create user with invalid confirm password (Not entered)', async () => {
    await testDynamicField(formLabelTexts.confirmPassword, '', confirmPasswordErrorMessageDict.empty);
  });

  test('Create user with invalid confirm password (Not matched)', async () => {
    await testDynamicField(formLabelTexts.confirmPassword, 'Ab#45679', confirmPasswordErrorMessageDict.notMatch);
  });

  test('Create user with invalid company (Not entered)', async () => {
    await testDynamicField(formLabelTexts.company, '', companyErrorMessage);
  });

  test('Create user with invalid interests (Not entered)', async () => {
    await testDynamicField(formLabelTexts.interests, '', interestErrorMessage);
  });

  test('Create user with invalid contact number (Entered but not valid)', async () => {
    await testDynamicField(formLabelTexts.contactNumber, '12345678', contactNumberErrorMessage);
  });
});
