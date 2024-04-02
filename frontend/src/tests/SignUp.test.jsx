import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import SignUp from '../routes/SignUp';
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import * as errorMessages from '../constants/errorMessages';
import * as FORM_LABEL_TEXTS from '../constants/formLabelTexts';
import * as paths from '../constants/paths.js';
import { renderWithAuthContext } from '../utils/testUtils.jsx';
import { act } from 'react-dom/test-utils';

beforeEach(() => {
  const routes = [{ path: paths.SIGN_UP, element: <SignUp /> }];
  renderWithAuthContext(routes, [paths.SIGN_UP], false);
});

afterEach(() => {
  fetchMock.restore();
  localStorage.clear();
});

const createPayload = (overrides = {}) => ({
  [FORM_LABEL_TEXTS.FIRST_NAME]: 'newFirstName',
  [FORM_LABEL_TEXTS.LAST_NAME]: 'newLastName',
  [FORM_LABEL_TEXTS.EMAIL]: 'newtestemail@test.com',
  [FORM_LABEL_TEXTS.PASSWORD]: 'P@ssword1',
  [FORM_LABEL_TEXTS.CONFIRM_PASSWORD]: 'P@ssword1',
  [FORM_LABEL_TEXTS.COMPANY]: 'testCompany',
  [FORM_LABEL_TEXTS.INTERESTS]: '2',
  [FORM_LABEL_TEXTS.CONTACT_NUMBER]: '+65 9237 8017',
  ...overrides,
});

const fillFormAndSubmit = async payload => {
  await waitFor(async() => {
    // Test if the user profile is updated successfully
    const firstNameInput = screen.getByTestId('first-name-input');
    userEvent.clear(firstNameInput);
    userEvent.type(firstNameInput, payload[FORM_LABEL_TEXTS.FIRST_NAME]);

    const lastNameInput = screen.getByTestId('last-name-input');
    userEvent.clear(lastNameInput);
    userEvent.type(lastNameInput, payload[FORM_LABEL_TEXTS.LAST_NAME]);

    const emailInput = screen.getByTestId('email-input');
    userEvent.clear(emailInput);
    userEvent.type(emailInput, payload[FORM_LABEL_TEXTS.EMAIL]);

    const passwordInput = screen.getByTestId('password-input');
    userEvent.clear(passwordInput);
    userEvent.type(passwordInput, payload[FORM_LABEL_TEXTS.PASSWORD]);

    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    userEvent.clear(confirmPasswordInput);
    if (payload[FORM_LABEL_TEXTS.CONFIRM_PASSWORD] !== '') {
      userEvent.type(confirmPasswordInput, payload[FORM_LABEL_TEXTS.CONFIRM_PASSWORD]);
    }

    const companyInput = screen.getByTestId('company-input');
    userEvent.clear(companyInput);
    if (payload[FORM_LABEL_TEXTS.COMPANY] !== '') {
      userEvent.type(companyInput, payload[FORM_LABEL_TEXTS.COMPANY]);
    }

    // INTERESTS DROPDOWN SELECTION
    if (payload[FORM_LABEL_TEXTS.INTERESTS]) {
      // Open the dropdown
      const dropdownIndicator = document.querySelector('.select__dropdown-indicator');
      fireEvent.mouseDown(dropdownIndicator);

      // Wait for the dropdown menu to be in the DOM
      const dropdownMenu = await screen.findByRole('listbox');

      // Find the option within the dropdown menu
      const option = await within(dropdownMenu).findByText('BA');

      // Click on the option
      userEvent.click(option);
    }

    // Phone Number
    const phoneNumberInput = screen.getByTestId('contact-number-input');
    userEvent.clear(phoneNumberInput);
    userEvent.type(phoneNumberInput, payload[FORM_LABEL_TEXTS.CONTACT_NUMBER]);

    // SIGN UP BUTTON
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    userEvent.click(signUpButton);
    // after click, success modal expected
  });
};
describe('Sign Up Test Cases', () => {
  test('fill form and submit function', async () => {
    const payload = createPayload();
    await fillFormAndSubmit(payload);
    await waitFor(() => {
      const successModal = screen.getByTestId('success-modal');
      expect(successModal).toBeInTheDocument();
      expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      expect(screen.getByText('Please login with your sign-up credentials.')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  const testCases = [
    {
      testName: 'Create user with invalid first name',
      fieldToUpdate: FORM_LABEL_TEXTS.FIRST_NAME,
      updateValue: 'T3st',
      errorMessage: errorMessages.FIRST_NAME_ERROR_MESSAGES.invalid,
    },
    {
      testName: 'Create user with invalid last name',
      fieldToUpdate: FORM_LABEL_TEXTS.LAST_NAME,
      updateValue: 'T3st',
      errorMessage: errorMessages.LAST_NAME_ERROR_MESSAGES.invalid,
    },
    {
      testName: 'Create user with invalid email',
      fieldToUpdate: FORM_LABEL_TEXTS.EMAIL,
      updateValue: 'loremipsum@test',
      errorMessage: errorMessages.EMAIL_ERROR_MESSAGES.invalid,
    },
    {
      testName: 'Create user with invalid password (Not consisting of numbers)',
      fieldToUpdate: FORM_LABEL_TEXTS.PASSWORD,
      updateValue: 'Ab#cdefg',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.number,
    },
    {
      testName: 'Create user with invalid password (Not consisting of special characters)',
      fieldToUpdate: FORM_LABEL_TEXTS.PASSWORD,
      updateValue: 'Abcdefg1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.special,
    },
    {
      testName: 'Create user with invalid password (Not consisting of uppercase letters)',
      fieldToUpdate: FORM_LABEL_TEXTS.PASSWORD,
      updateValue: 'ab#cdefg1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.upperCase,
    },
    {
      testName: 'Create user with invalid password (Not consisting of lowercase letters)',
      fieldToUpdate: FORM_LABEL_TEXTS.PASSWORD,
      updateValue: 'AB#CDEFG1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.lowerCase,
    },
    {
      testName: 'Create user with invalid password (Not of minimum length)',
      fieldToUpdate: FORM_LABEL_TEXTS.PASSWORD,
      updateValue: 'Ab#4567',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.minLength,
    },
    {
      testName: 'Create user with invalid confirm password (Not entered)',
      fieldToUpdate: FORM_LABEL_TEXTS.CONFIRM_PASSWORD,
      updateValue: '',
      errorMessage: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Create user with invalid confirm password (Not matched)',
      fieldToUpdate: FORM_LABEL_TEXTS.CONFIRM_PASSWORD,
      updateValue: 'Ab#45679',
      errorMessage: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch,
    },
    {
      testName: 'Create user with invalid company (Not entered)',
      fieldToUpdate: FORM_LABEL_TEXTS.COMPANY,
      updateValue: '',
      errorMessage: errorMessages.COMPANY_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Create user with invalid interests (Not entered)',
      fieldToUpdate: FORM_LABEL_TEXTS.INTERESTS,
      updateValue: '',
      errorMessage: errorMessages.INTERESTS_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Create user with invalid contact number (Entered but not valid)',
      fieldToUpdate: FORM_LABEL_TEXTS.CONTACT_NUMBER,
      updateValue: '12345678',
      errorMessage: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.invalid,
    },
  ];
  testCases.forEach(({ testName, fieldToUpdate, updateValue, errorMessage }) => {
    test(`${testName}`, async () => {
      const payload = createPayload({ [fieldToUpdate]: updateValue });
      fillFormAndSubmit(payload);
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});
