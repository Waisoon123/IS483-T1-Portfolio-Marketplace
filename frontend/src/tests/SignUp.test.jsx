import { render, screen, waitFor } from '@testing-library/react';
import SignUp from '../routes/SignUp';
import { expect, test, describe, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import * as errorMessages from '../constants/errorMessages';
import * as FORM_LABEL_TEXTS from '../constants/formLabelTexts';
import { renderWithRouterAndAuth } from '../utils/testUtils.jsx';

const API_URL = import.meta.env.VITE_API_URL;

describe('SignUp Component', () => {
  beforeEach(() => {
    fetchMock.restore();

    // render(
    //   <MemoryRouter>
    //     <SignUp />
    //   </MemoryRouter>,
    // );
    renderWithRouterAndAuth(<SignUp />, { isAuthenticated: false });

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
          interests: '[2]',
          contactNumber: '+6591234567',
        }),
      },
      { overwriteRoutes: true },
    );
  });

  const createPayload = (overrides = {}) => ({
    [FORM_LABEL_TEXTS.FIRST_NAME]: 'test',
    [FORM_LABEL_TEXTS.LAST_NAME]: 'test',
    [FORM_LABEL_TEXTS.EMAIL]: 'test@test.test',
    [FORM_LABEL_TEXTS.PASSWORD]: 'Ab#45678',
    [FORM_LABEL_TEXTS.CONFIRM_PASSWORD]: 'Ab#45678',
    [FORM_LABEL_TEXTS.COMPANY]: 'SMU',
    [FORM_LABEL_TEXTS.INTERESTS]: '[1]',
    [FORM_LABEL_TEXTS.CONTACT_NUMBER]: '91234567',
    ...overrides,
  });

  const fillFormAndSubmit = async payload => {
    waitFor(() => {
      for (const label of Object.keys(payload)) {
        const field = screen.getByLabelText(label);
        if (label === FORM_LABEL_TEXTS.INTERESTS && payload[label] !== '') {
          waitFor(() => {
            userEvent.selectOptions(field, payload[label]);
          });
        } else if (label !== FORM_LABEL_TEXTS.INTERESTS) {
          userEvent.type(field, String(payload[label]));
        }
      }

      userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    });
  };

  test('Renders SignUp component successfully', () => {
    waitFor(() => {
      Object.keys(FORM_LABEL_TEXTS).forEach(key => {
        expect(screen.getByLabelText(FORM_LABEL_TEXTS[key])).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });

  test('User signs up successfully, and is able to see the modal', async () => {
    waitFor(() => {
      const payload = createPayload();
      fillFormAndSubmit(payload);

      waitFor(() => {
        expect(screen.getByTestId('success-modal')).toBeInTheDocument();
        expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
        expect(screen.getByText('Continue to Login')).toBeInTheDocument();
      });
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
      updateValue: '[]',
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
    test(`Create user with invalid ${testName}`, async () => {
      waitFor(() => {
        const payload = createPayload({ [fieldToUpdate]: updateValue });
        fillFormAndSubmit(payload);
        waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
      });
    });
  });
});
