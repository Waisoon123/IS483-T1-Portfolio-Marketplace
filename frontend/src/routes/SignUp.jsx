import { useState, useEffect } from 'react';
import { Form } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';
import { isValidName, isValidEmail, isValidPassword, isValidCompany, isValidInterest } from '../utils/validators';
import {
  firstNameErrorMessage,
  lastNameErrorMessage,
  emailErrorMessage,
  passwordErrorMessageDict,
  companyErrorMessage,
  interestErrorMessage,
  contactNumberErrorMessage,
} from '../constants/errorMessages';
import Modal from '../components/Modal';
import styles from './SignUp.module.css';

let FORM_DATA;

export default function SignUp() {
  const navigate = useNavigate();
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [companyError, setCompanyError] = useState();
  const [interestError, setInterestError] = useState();
  const [contactNumberError, setContactNumberError] = useState();
  const [contactNumber, setContactNumber] = useState();
  const [csrfToken, setCsrfToken] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/csrf_token/', {
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
      setFirstNameError(firstNameErrorMessage);
    } else {
      setFirstNameError('');
    }
  };

  const checkLastName = lastName => {
    if (!isValidName(lastName)) {
      setLastNameError(lastNameErrorMessage);
    } else {
      setLastNameError('');
    }
  };

  const checkEmail = email => {
    if (!isValidEmail(email)) {
      setEmailError(emailErrorMessage);
    } else {
      setEmailError('');
    }
  };

  const checkPassword = password => {
    const { passwordIsValid, errorKey } = isValidPassword(password);

    if (!passwordIsValid) {
      setPasswordError(passwordErrorMessageDict[errorKey]);
    } else {
      setPasswordError('');
    }
  };

  const checkConfirmPassword = confirmPassword => {
    if (confirmPassword !== FORM_DATA.get(formFields.password)) {
      setConfirmPasswordError("Passwords don't match");
    } else {
      setConfirmPasswordError('');
    }
  };

  const checkCompany = company => {
    if (!isValidCompany(company)) {
      setCompanyError(companyErrorMessage);
    } else {
      setCompanyError('');
    }
  };

  const checkInterest = interests => {
    if (!isValidInterest(interests)) {
      setInterestError(interestErrorMessage);
    } else {
      setInterestError('');
    }
  };

  const checkContactNumber = contactNumber => {
    if (!isValidNumber(contactNumber)) {
      setContactNumberError(contactNumberErrorMessage);
    } else {
      setContactNumberError('');
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();

    // form validation
    FORM_DATA = new FormData(event.target);
    const firstName = FORM_DATA.get(formFields.firstName);
    const lastName = FORM_DATA.get(formFields.lastName);
    const email = FORM_DATA.get(formFields.email);
    const password = FORM_DATA.get(formFields.password);
    const confirmPassword = FORM_DATA.get(formFields.confirmPassword);
    const company = FORM_DATA.get(formFields.company);
    const interests = FORM_DATA.get(formFields.interests);
    const contactNumber = FORM_DATA.get(formFields.contactNumber);

    checkFirstName(firstName);
    checkLastName(lastName);
    checkEmail(email);
    checkPassword(password);
    checkConfirmPassword(confirmPassword);
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
      const response = await fetch('http://localhost:8000/api/users/', {
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
        <div>
          <p>Sign up was successful!</p>
          <button onClick={() => navigate('/login')}>Continue to Login</button>
        </div>
      </Modal>
      <Modal isOpen={isErrorModalOpen}>
        <div>
          <p>Error Signing Up!</p>
          <button onClick={() => setIsErrorModalOpen(false)}>Close</button>
        </div>
      </Modal>
      <Form method='post' className={styles.form} onSubmit={handleSubmit}>
        <div>
          <label htmlFor={formFields.firstName}>First Name</label>
          <input type='text' id={formFields.firstName} className={styles.input} name={formFields.firstName} />
          <p className={styles.errorMsg}>{firstNameError}</p>
        </div>
        <div>
          <label htmlFor={formFields.lastName}>Last Name</label>
          <input type='text' id={formFields.lastName} className={styles.input} name={formFields.lastName} />
          <p className={styles.errorMsg}>{lastNameError}</p>
        </div>
        <div>
          <label htmlFor={formFields.email}>Email</label>
          <input type='text' id={formFields.email} className={styles.input} name={formFields.email} />
          <p className={styles.errorMsg}>{emailError}</p>
        </div>
        <div>
          <label htmlFor={formFields.password}>Password</label>
          <input type='password' id={formFields.password} className={styles.input} name={formFields.password} />
          <p className={styles.errorMsg}>{passwordError}</p>
        </div>
        <div>
          <label htmlFor={formFields.confirmPassword}>Confirm Password</label>
          <input
            type='password'
            id={formFields.confirmPassword}
            className={styles.input}
            name={formFields.confirmPassword}
          />
          <p className={styles.errorMsg}>{confirmPasswordError}</p>
        </div>
        <div>
          <label htmlFor={formFields.company}>Company</label>
          <input type='text' id={formFields.company} className={styles.input} name={formFields.company} />
          <p className={styles.errorMsg}>{companyError}</p>
        </div>
        <div>
          <label htmlFor={formFields.interests}>Interests</label>
          <input type='text' id={formFields.interests} className={styles.input} name={formFields.interests} />
          <p className={styles.errorMsg}>{interestError}</p>
        </div>
        <div>
          <label htmlFor={formFields.contactNumber}>Contact Number</label>
          <PhoneInput
            id={formFields.contactNumber}
            className={formFields.contactNumber}
            placeholder='Enter contact number'
            defaultCountry='SG'
            value={contactNumber}
            onChange={setContactNumber}
            name={formFields.contactNumber}
            international
          />
          <p className={styles.errorMsg}>{contactNumberError}</p>
        </div>
        <div>
          <button type='submit' className={styles.cfmSignUpButton}>
            Sign Up
          </button>
        </div>
      </Form>
    </>
  );
}
