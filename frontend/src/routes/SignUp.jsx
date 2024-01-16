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
} from '../utils/errorMessages';

import styles from './SignUp.module.css';

let FORM_DATA;

export default function SignUp() {
  const navigate = useNavigate();
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [companyError, setCompanyError] = useState();
  const [interestError, setInterestError] = useState();
  const [phoneNumberError, setPhoneNumberError] = useState();
  const [phoneNumber, setPhoneNumber] = useState();

  const formFields = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    password: 'password',
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
      setPhoneNumberError(contactNumberErrorMessage);
    } else {
      setPhoneNumberError('');
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
    const company = FORM_DATA.get(formFields.company);
    const interests = FORM_DATA.get(formFields.interests);
    const contactNumber = FORM_DATA.get(formFields.contactNumber);

    checkFirstName(firstName);
    checkLastName(lastName);
    checkEmail(email);
    checkPassword(password);
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
      phoneNumberError === ''
    ) {
      submitForm();
    }
  }, [firstNameError, lastNameError, emailError, passwordError, companyError, interestError, phoneNumberError]);

  const submitForm = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        body: FORM_DATA,
      });

      if (!response.ok) {
        // Display backend errors if any
        const error = await response.json(); // error = {key: [error message], ...}
        const errorSetters = {
          [formFields.firstName]: setFirstNameError,
          [formFields.lastName]: setLastNameError,
          [formFields.email]: setEmailError,
          [formFields.password]: setPasswordError,
          [formFields.company]: setCompanyError,
          [formFields.interests]: setInterestError,
          [formFields.contactNumber]: setPhoneNumberError,
        };

        for (let key in error) {
          if (errorSetters.hasOwnProperty(key)) {
            errorSetters[key](error[key]);
          } else {
            errorSetters[key]('');
          }
        }
      } else {
        console.log(response.json());
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      navigate('/sign-up');
    }
  };

  return (
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
          placeholder='Enter phone number'
          defaultCountry='SG'
          value={phoneNumber}
          onChange={setPhoneNumber}
          name='contact_number'
          international
        />
        <p className={styles.errorMsg}>{phoneNumberError}</p>
      </div>
      <div>
        <button type='submit' className={styles.cfmSignUpButton}>
          Sign Up
        </button>
      </div>
    </Form>
  );
}
