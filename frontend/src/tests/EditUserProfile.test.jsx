import { screen, waitFor, act, within, fireEvent } from '@testing-library/react';
import EditUserProfile from '../routes/EditUserProfile.jsx';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fetchMock from 'fetch-mock';
import checkAuthentication from '../utils/checkAuthentication.js';
import * as storageKeys from '../constants/storageKeys.js';
import userEvent from '@testing-library/user-event';
import * as fromLabels from '../constants/formLabelTexts.js';
import * as errorMessages from '../constants/errorMessages.js';
import * as paths from '../constants/paths.js';
import ViewUserProfile from '../routes/ViewUserProfile.jsx';
import { renderWithAuthContext } from '../utils/testUtils.jsx';

const API_URL = import.meta.env.VITE_API_URL;

let originalCheckAuthentication;

beforeEach(() => {
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

afterEach(() => {
  // Restore the original function after each test
  checkAuthentication.checkAuthentication = originalCheckAuthentication;

  // Restore fetch to its original state
  fetchMock.restore();
  fetchMock.reset();

  // Clear localStorage
  localStorage.clear();

  // Clean up the cookie
  document.cookie = `${storageKeys.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  window.location.reload();
});

const createPayload = (overrides = {}) => ({
  [fromLabels.FIRST_NAME]: 'newFirstName',
  [fromLabels.LAST_NAME]: 'newLastName',
  [fromLabels.EMAIL]: 'newtestemail@test.com',
  [fromLabels.PASSWORD]: 'newPassword123!',
  [fromLabels.CONFIRM_PASSWORD]: 'newPassword123!',
  [fromLabels.COMPANY]: 'newCompany',
  [fromLabels.INTERESTS]: '2',
  [fromLabels.CONTACT_NUMBER]: '+65 9111 1111',
  ...overrides,
});

const fillFormAndSubmit = async payload => {
  // Test if the user profile is updated successfully
  const firstNameInput = await screen.getByLabelText('First Name*');
  userEvent.clear(firstNameInput);
  await userEvent.type(firstNameInput, payload[fromLabels.FIRST_NAME]);

  const lastNameInput = await screen.getByLabelText('Last Name*');
  userEvent.clear(lastNameInput);
  await userEvent.type(lastNameInput, payload[fromLabels.LAST_NAME]);

  const emailInput = await screen.getByLabelText('Email*');
  userEvent.clear(emailInput);
  await userEvent.type(emailInput, payload[fromLabels.EMAIL]);

  const companyInput = await screen.getByLabelText('Company*');
  userEvent.clear(companyInput);
  if (payload[fromLabels.COMPANY] !== '') {
    await userEvent.type(companyInput, payload[fromLabels.COMPANY]);
  }

  // INTERESTS DROPDOWN SELECTION
  const removeAllInterests = async () => {
    // Find Remove Button which is tagged by "Remove INTERESTS_NAME"
    // Since the above mocked is one value, don't need to use for loop
    const removeButton = await screen.getByLabelText(/Remove/i);
    userEvent.click(removeButton);
  };

  // Only interact with the interests dropdown if removeAllInterests is true or if there's a new interest to be added
  if (payload.removeAllInterests || payload[fromLabels.INTERESTS]) {
    const selectControl = document.querySelector('.select__dropdown-indicator');
    fireEvent.mouseDown(selectControl);

    if (payload.removeAllInterests) {
      await removeAllInterests();
    }

    if (payload[fromLabels.INTERESTS]) {
      const dropdownMenu = await screen.findByRole('listbox');

      // Find the option with the text 'BA' and select it
      const option = await within(dropdownMenu).findByText('BA');
      userEvent.click(option);
    }
  }

  // Phone Number
  await waitFor(() => {
    const phoneNumberInput = screen.getByLabelText('Contact Number*');
    userEvent.clear(phoneNumberInput);
    userEvent.type(phoneNumberInput, payload[fromLabels.CONTACT_NUMBER]);
  });

  await waitFor(() => {
    const updatePasswordCheckbox = screen.getByLabelText('Change Password?');
    userEvent.click(updatePasswordCheckbox);
  });

  await waitFor(() => {
    const passwordInput = screen.getByLabelText('Password*');
    userEvent.clear(passwordInput);
    userEvent.type(passwordInput, payload[fromLabels.PASSWORD]);

    const confirmPasswordInput = screen.getByLabelText('Confirm Password*');
    userEvent.clear(confirmPasswordInput);
    if (payload[fromLabels.CONFIRM_PASSWORD] !== '') {
      userEvent.type(confirmPasswordInput, payload[fromLabels.CONFIRM_PASSWORD]);
    }
  });

  // Update BUTTON
  const updateButton = await screen.getByRole('button', { name: /Save/i });
  userEvent.click(updateButton);
  // after click, success modal expected
};
describe('Edit User Profile Test Cases', () => {
  test('renders EditUserProfile component with user profile data from cookie', async () => {
    // Now that the fetch has completed, check the input's value
    await waitFor(() => expect(screen.findByLabelText('First Name*')).resolves.toHaveValue('test'), { timeout: 5000 });
    expect(screen.getByLabelText('Last Name*')).toHaveValue('ing');
    expect(screen.getByLabelText('Email*')).toHaveValue('6@email.com');
    expect(screen.getByLabelText('Company*')).toHaveValue('smu');
    // Expect fintech interest to be in field
    const interestSelect = screen.getByText('fintech');
    const optionSelectWithoutButton = interestSelect.childNodes[0].nodeValue.trim();
    expect(optionSelectWithoutButton).toBe('fintech');
    expect(screen.getByLabelText('Contact Number*')).toHaveValue('+65 9129 9999');
    expect(screen.queryByLabelText('Change Password?')).not.toBeChecked();
  });

  test('Successfully update user profile', async () => {
    const payload = createPayload();
    await fillFormAndSubmit(payload);
    // Wait for the API call to complete
    await waitFor(() => expect(fetchMock.called(API_URL + 'users/63/')).toBeTruthy());

    const modal = await screen.getByTestId('successful-modal');
    expect(modal).toBeInTheDocument();

    // Click on Continue to View Profile
    const continueButton = screen.getByRole('button', { name: /Continue to View Profile/i });
    userEvent.click(continueButton);
  });
  const testCases = [
    {
      testName: 'Update user with invalid first name (Not entered)',
      fieldToUpdate: fromLabels.FIRST_NAME,
      updateValue: '',
      errorMessage: errorMessages.FIRST_NAME_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid last name (Not entered)',
      fieldToUpdate: fromLabels.LAST_NAME,
      updateValue: '',
      errorMessage: errorMessages.LAST_NAME_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid email (Not entered)',
      fieldToUpdate: fromLabels.EMAIL,
      updateValue: '',
      errorMessage: errorMessages.EMAIL_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid company (Not entered)',
      fieldToUpdate: fromLabels.COMPANY,
      updateValue: '',
      errorMessage: errorMessages.COMPANY_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid contact number (Not entered)',
      fieldToUpdate: fromLabels.CONTACT_NUMBER,
      updateValue: '',
      errorMessage: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid password (Not consisting of numbers)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: 'Ab#cdefg',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.number,
    },
    {
      testName: 'Update user with invalid password (Not consisting of letters)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: '1234567!',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.letter,
    },
    {
      testName: 'Update user with invalid password (Not consisting of special characters)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: 'Abcdefg1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.special,
    },
    {
      testName: 'Update user with invalid password (Not consisting of uppercase letters)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: 'abc#defg1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.upperCase,
    },
    {
      testName: 'Update user with invalid password (Not consisting of lowercase letters)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: 'ABC#DEFG1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.lowerCase,
    },
    {
      testName: 'Update user with invalid password (Not at least 8 characters long)',
      fieldToUpdate: fromLabels.PASSWORD,
      updateValue: 'Ab#1',
      errorMessage: errorMessages.PASSWORD_ERROR_MESSAGES.minLength,
    },
    {
      testName: 'Update user with invalid password (Not matching with confirm password)',
      fieldToUpdate: fromLabels.CONFIRM_PASSWORD,
      updateValue: 'Ab#45679',
      errorMessage: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch,
    },
    {
      testName: 'Update user with invalid password (Not Entered)',
      fieldToUpdate: fromLabels.CONFIRM_PASSWORD,
      updateValue: '',
      errorMessage: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty,
    },
    {
      testName: 'Update user with invalid email (Invalid format)',
      fieldToUpdate: fromLabels.EMAIL,
      updateValue: 'xxxxxxxxxx@xxxx',
      errorMessage: errorMessages.EMAIL_ERROR_MESSAGES.invalid,
    },
  ];
  testCases.forEach(({ testName, fieldToUpdate, updateValue, errorMessage }) => {
    test(`${testName}`, async () => {
      const payload = createPayload({ [fieldToUpdate]: updateValue });
      await act(async () => {
        fillFormAndSubmit(payload);
      });
      await waitFor(() => {
        screen.debug(screen.getByLabelText(fieldToUpdate));
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});
