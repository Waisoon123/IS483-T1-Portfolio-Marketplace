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

    // Create a dynamic payload with an invalid value for the specified field
    dynamicPayload[field] = invalidValue;

    // Fill in the form with the dynamic payload
    Object.keys(dynamicPayload).forEach(key => {
      userEvent.type(screen.getByLabelText(key), dynamicPayload[key]);
    });

    // Trigger Form Submission
    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Wait for the error message to be displayed
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

    // Check if all form fields are present
    // Check the loop for the keys if all form fields are present
    Object.keys(formLabelTexts).forEach(key => {
      expect(screen.getByLabelText(formLabelTexts[key])).toBeInTheDocument();
    });

    // Check if submit button is rendered
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
      // console.log(field.value);
    });

    // Trigger Form Submission
    userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Wait for the modal to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  // Test for invalid first name
  test('Create user with invalid first name', async () => {
    await testDynamicField(formLabelTexts.firstName, 'T3st', firstNameErrorMessage);
  });

  // Test for invalid last name
  test ('Create user with invalid last name', async () => {
    await testDynamicField(formLabelTexts.lastName, 'T3st', lastNameErrorMessage);
  });

  // Test for invalid email
  test ('Create user with invalid email', async () => {
    await testDynamicField(formLabelTexts.email, 'loremipsum@test', emailErrorMessage);
  });

  // Test for invalid password (Not consisting of numbers)
  test ('Create user with invalid password (Not consisting of numbers)', async () => {
    await testDynamicField(formLabelTexts.password, 'Ab#cdefg', passwordErrorMessageDict.number);
  });

  // Test for invalid password (Not consisting of special characters)
  test ('Create user with invalid password (Not consisting of special characters)', async () => {
    await testDynamicField(formLabelTexts.password, 'Abcdefg1', passwordErrorMessageDict.special);
  });

  // Test for invalid password (Not consisting of uppercase letters)
  test ('Create user with invalid password (Not consisting of uppercase letters)', async () => {
    await testDynamicField(formLabelTexts.password, 'ab#cdefg1', passwordErrorMessageDict.upperCase);
  });

  // Test for invalid password (Not consisting of lowercase letters)
  test ('Create user with invalid password (Not consisting of lowercase letters)', async () => {
    await testDynamicField(formLabelTexts.password, 'AB#CDEFG1', passwordErrorMessageDict.lowerCase);
  });

  // Test for invalid password (Not of minimum length)
  test ('Create user with invalid password (Not of minimum length)', async () => {
    await testDynamicField(formLabelTexts.password, 'Ab#4567', passwordErrorMessageDict.minLength);
  });

  // test for confirm password (Not entered)
  test ('Create user with invalid confirm password (Not entered)', async () => {
    await testDynamicField(formLabelTexts.confirmPassword, '', confirmPasswordErrorMessageDict.empty);
  });

  // test for confirm password (Not matched)
  test ('Create user with invalid confirm password (Not matched)', async () => {
    await testDynamicField(formLabelTexts.confirmPassword, 'Ab#45679', confirmPasswordErrorMessageDict.notMatch);
  });

  // test for company (Ensure that it is entered)
  test ('Create user with invalid company (Not entered)', async () => {
    await testDynamicField(formLabelTexts.company, '', companyErrorMessage);
  });

  // test for interests (Ensure that is is entered)
  test ('Create user with invalid interests (Not entered)', async () => {
    await testDynamicField(formLabelTexts.interests, '', interestErrorMessage);
  });

  // Contact number (Ensure that it is entered with the correct format)
  test ('Create user with invalid contact number (Entered but not valid)', async () => {
    await testDynamicField(formLabelTexts.contactNumber, '12345678', contactNumberErrorMessage);
  });
});