import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';
import { isValidName, isValidEmail, isValidPassword, isValidCompany, isValidInterest } from '../utils/validators';
import {
  FIRST_NAME_ERROR_MESSAGE,
  LAST_NAME_ERROR_MESSAGE,
  INVALID_EMAIL_ERROR_MESSAGE,
  PASSWORD_ERROR_MESSAGE_DICT,
  CONFIRM_PASSWORD_ERROR_MESSAGE_DICT,
  COMPANY_ERROR_MESSAGE,
  INTERESTS_ERROR_MESSAGE,
  CONTACT_NUMBER_ERROR_MESSAGE,
} from '../constants/errorMessages';
import Modal from '../components/Modal';
import styles from './SignUp.module.css';
import * as paths from '../constants/paths.js';
import * as fromLabels from '../constants/formLabelsText.js';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;
let FORM_DATA;

export default function SignUp() {
  const { handleSubmit, register } = useForm();
  const navigate = useNavigate();
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [companyError, setCompanyError] = useState();
  const [interestError, setInterestError] = useState();
  const [contactNumberError, setContactNumberError] = useState();
  // const [contactNumber, setContactNumber] = useState();
  const [csrfToken, setCsrfToken] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(CSRF_TOKEN_URL, {
          credentials: 'include',
        });

        const data = await response.json();
        setCsrfToken(data.csrfToken);
        console.log(data.csrfToken);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCsrfToken();
  }, []);

  const formFields = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    password: 'password',
    confirmPassword: 'confirm_password',
    company: 'company',
    interests: 'interests',
    contactNumber: 'contact_number',
  };

  const checkFirstName = firstName => {
    if (!isValidName(firstName)) {
      setFirstNameError(FIRST_NAME_ERROR_MESSAGE);
    } else {
      setFirstNameError('');
    }
  };

  const checkLastName = lastName => {
    if (!isValidName(lastName)) {
      setLastNameError(LAST_NAME_ERROR_MESSAGE);
    } else {
      setLastNameError('');
    }
  };

  const checkEmail = email => {
    if (!isValidEmail(email)) {
      setEmailError(INVALID_EMAIL_ERROR_MESSAGE);
    } else {
      setEmailError('');
    }
  };

  const checkPassword = password => {
    const { passwordIsValid, errorKey } = isValidPassword(password);

    if (!passwordIsValid) {
      setPasswordError(PASSWORD_ERROR_MESSAGE_DICT[errorKey]);
    } else {
      setPasswordError('');
    }
  };

  const checkConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      setConfirmPasswordError(CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.empty);
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.notMatch);
    } else {
      setConfirmPasswordError('');
    }
  };

  const checkCompany = company => {
    if (!isValidCompany(company)) {
      setCompanyError(COMPANY_ERROR_MESSAGE);
    } else {
      setCompanyError('');
    }
  };

  const checkInterest = interests => {
    if (!isValidInterest(interests)) {
      setInterestError(INTERESTS_ERROR_MESSAGE);
    } else {
      setInterestError('');
    }
  };

  const checkContactNumber = contactNumber => {
    if (!isValidNumber(contactNumber)) {
      setContactNumberError(CONTACT_NUMBER_ERROR_MESSAGE);
    } else {
      setContactNumberError('');
    }
  };

  const handleContactNumberChange = value => {
    // Call the onChange function from react-hook-form with an event-like object
    register(formFields.contactNumber).onChange({
      target: {
        name: formFields.contactNumber,
        value,
      },
    });
  };

  const handleSignUp = data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const password = data.password;
    const confirmPassword = data.confirm_password;
    const company = data.company;
    const interests = data.interests;
    const contactNumber = data.contact_number;
    // form validation
    FORM_DATA = new FormData();
    FORM_DATA.append(formFields.firstName, firstName);
    FORM_DATA.append(formFields.lastName, lastName);
    FORM_DATA.append(formFields.email, email);
    FORM_DATA.append(formFields.password, password);
    FORM_DATA.append(formFields.confirmPassword, confirmPassword);
    FORM_DATA.append(formFields.company, company);
    FORM_DATA.append(formFields.interests, interests);
    FORM_DATA.append(formFields.contactNumber, contactNumber);

    checkFirstName(firstName);
    checkLastName(lastName);
    checkEmail(email);
    checkPassword(password);
    checkConfirmPassword(confirmPassword, password);
    checkCompany(company);
    checkInterest(interests);
    checkContactNumber(contactNumber);
  };

  useEffect(() => {
    if (
      firstNameError === '' &&
      lastNameError === '' &&
      emailError === '' &&
      passwordError === '' &&
      companyError === '' &&
      interestError === '' &&
      contactNumberError === '' &&
      confirmPasswordError === ''
    ) {
      submitForm();
    }
  }, [
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    companyError,
    interestError,
    contactNumberError,
    confirmPasswordError,
  ]);

  /* 
    handleErrors will retrieve error messages from the API and display them if frontend validation fails.
    If there are no errors, the user will be redirected to the login page.
  */
  const handleErrors = async response => {
    if (!response.ok) {
      if (response.headers.get('content-type').includes('application/json')) {
        const error = await response.json(); // error = {key: [error message], ...}
        const errorSetters = {
          [formFields.firstName]: setFirstNameError,
          [formFields.lastName]: setLastNameError,
          [formFields.email]: setEmailError,
          [formFields.password]: setPasswordError,
          [formFields.company]: setCompanyError,
          [formFields.interests]: setInterestError,
          [formFields.contactNumber]: setContactNumberError,
          [formFields.confirmPassword]: setConfirmPasswordError,
        };

        for (let key in error) {
          if (errorSetters.hasOwnProperty(key)) {
            errorSetters[key](error[key]);
          } else {
            errorSetters[key]('');
          }
        }
      } else {
        console.log(await response.text());
      }
    } else {
      console.log(await response.json());
      setIsSuccessModalOpen(true);
    }
  };

  const submitForm = async () => {
    try {
      const response = await fetch(`${API_URL}users/`, {
        method: 'POST',
        body: FORM_DATA,
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      await handleErrors(response);
    } catch (error) {
      console.log(error);
      setFirstNameError();
      setLastNameError();
      setEmailError();
      setPasswordError();
      setConfirmPasswordError();
      setCompanyError();
      setInterestError();
      setContactNumberError();
      setIsErrorModalOpen(true);
    }
  };

  return (
    <>
      <Modal isOpen={isSuccessModalOpen}>
        <div data-testid='success-modal'>
          <p>Sign up was successful!</p>
          <button onClick={() => navigate(paths.LOGIN)}>Continue to Login</button>
        </div>
      </Modal>
      <Modal isOpen={isErrorModalOpen}>
        <div data-testid='error-modal'>
          <p>Error Signing Up!</p>
          <button onClick={() => setIsErrorModalOpen(false)}>Close</button>
        </div>
      </Modal>
      <form method='post' className={styles.form} onSubmit={handleSubmit(handleSignUp)}>
        <div className={styles.container}>
          <div>
            <label htmlFor={formFields.firstName}>{fromLabels.FIRST_NAME}</label>
            <input
              type='text'
              id={formFields.firstName}
              className={styles.input}
              name={formFields.firstName}
              placeholder='First Name'
              {...register(formFields.firstName)}
            />
            <p className={styles.errorMsg}>{firstNameError}</p>
          </div>
          <div>
            <label htmlFor={formFields.lastName}>{fromLabels.LAST_NAME}</label>
            <input
              type='text'
              id={formFields.lastName}
              className={styles.input}
              name={formFields.lastName}
              placeholder='Last Name'
              {...register(formFields.lastName)}
            />
            <p className={styles.errorMsg}>{lastNameError}</p>
          </div>
          <div>
            <label htmlFor={formFields.email}>{fromLabels.EMAIL}</label>
            <input
              type='text'
              id={formFields.email}
              className={styles.input}
              name={formFields.email}
              placeholder='Email'
              {...register(formFields.email)}
            />
            <p className={styles.errorMsg}>{emailError}</p>
          </div>
          <div>
            <label htmlFor={formFields.password}>{fromLabels.PASSWORD}</label>
            <input
              type='password'
              id={formFields.password}
              className={styles.input}
              name={formFields.password}
              placeholder='Password'
              data-testid='password-input'
              {...register(formFields.password)}
            />
            <p className={styles.errorMsg}>{passwordError}</p>
          </div>
          <div>
            <label htmlFor={formFields.confirmPassword}>{fromLabels.CONFIRM_PASSWORD}</label>
            <input
              type='password'
              id={formFields.confirmPassword}
              className={styles.input}
              name={formFields.confirmPassword}
              placeholder='Confirm Password'
              data-testid='confirm-password-input'
              {...register(formFields.confirmPassword)}
            />
            <p className={styles.errorMsg}>{confirmPasswordError}</p>
          </div>
          <div>
            <label htmlFor={formFields.company}>{fromLabels.COMPANY}</label>
            <input
              type='text'
              id={formFields.company}
              className={styles.input}
              name={formFields.company}
              placeholder='Company'
              {...register(formFields.company)}
            />
            <p className={styles.errorMsg}>{companyError}</p>
          </div>
          <div>
            <label htmlFor={formFields.interests}>{fromLabels.INTERESTS}</label>
            <input
              type='text'
              id={formFields.interests}
              className={styles.input}
              name={formFields.interests}
              placeholder='Interests'
              {...register(formFields.interests)}
            />
            <p className={styles.errorMsg}>{interestError}</p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber}>{fromLabels.CONTACT_NUMBER}</label>
            <PhoneInput
              id={formFields.contactNumber}
              className={`${formFields.contactNumber} ${styles.input}`}
              placeholder='Enter contact number'
              defaultCountry='SG'
              // value={contactNumber}
              onChange={handleContactNumberChange}
              name={formFields.contactNumber}
              international
              // {...register(formFields.contactNumber)}
            />
            <p className={styles.errorMsg}>{contactNumberError}</p>
          </div>
          <div>
            <button type='submit' className={styles.button}>
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
