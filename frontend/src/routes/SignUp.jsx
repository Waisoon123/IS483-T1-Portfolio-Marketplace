import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';
import {
  isValidName,
  isValidEmail,
  isValidPassword,
  isValidConfirmPassword,
  isValidCompany,
  isValidInterest,
} from '../utils/validators';
import Modal from '../components/Modal';
import styles from './SignUp.module.css';
import * as errorMessages from '../constants/errorMessages';
import * as paths from '../constants/paths.js';
import * as fromLabels from '../constants/formLabelTexts.js';
import Button from '../components/Button.jsx';

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

export default function SignUp() {
  const {
    register,
    unregister,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

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

  useEffect(() => {
    register(formFields.contactNumber, { required: errorMessages.EMPTY_CONTACT_NUMBER_ERROR_MESSAGE });

    return () => {
      unregister(formFields.contactNumber);
    };
  }, [register, unregister, formFields.contactNumber]);

  const validateForm = (firstName, lastName, email, password, confirmPassword, company, interests, contactNumber) => {
    let isValid = true;
    if (!isValidName(firstName)) {
      setError(formFields.firstName, { message: errorMessages.FIRST_NAME_ERROR_MESSAGE });
      isValid = false;
    }
    if (!isValidName(lastName)) {
      setError(formFields.lastName, { message: errorMessages.LAST_NAME_ERROR_MESSAGE });
      isValid = false;
    }
    if (!isValidEmail(email)) {
      setError(formFields.email, { message: errorMessages.INVALID_EMAIL_ERROR_MESSAGE });
      isValid = false;
    }
    const { passwordIsValid, errorKey } = isValidPassword(password);
    if (!passwordIsValid) {
      setError(formFields.password, { message: errorMessages.PASSWORD_ERROR_MESSAGE_DICT[errorKey] });
      setValue(formFields.password, '');
      isValid = false;
    }
    if (!isValidConfirmPassword(password, confirmPassword)) {
      setError(formFields.confirmPassword, { message: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.notMatch });
      setValue(formFields.confirmPassword, '');
      isValid = false;
    }
    if (!isValidCompany(company)) {
      setError(formFields.company, { message: errorMessages.COMPANY_ERROR_MESSAGE });
      isValid = false;
    }
    if (!isValidInterest(interests)) {
      setError(formFields.interests, { message: errorMessages.INTERESTS_ERROR_MESSAGE });
      isValid = false;
    }
    if (!isValidNumber(contactNumber)) {
      setError(formFields.contactNumber, { message: errorMessages.CONTACT_NUMBER_ERROR_MESSAGE });
      isValid = false;
    }
    return isValid;
  };

  const handleBackendErrors = async response => {
    if (response.headers.get('content-type').includes('application/json')) {
      const error = await response.json(); // error = {key: [error message], ...}

      for (let key in error) {
        setError(formFields[key], { message: error[key] });
      }
    }
  };

  const handleSignUp = async data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const password = data.password;
    const confirmPassword = data.confirm_password;
    const company = data.company;
    const interests = data.interests;
    const contactNumber = data.contact_number;

    // form validation
    const isValid = validateForm(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      company,
      interests,
      contactNumber,
    );

    if (isValid) {
      FORM_DATA = new FormData();
      FORM_DATA.append(formFields.firstName, firstName);
      FORM_DATA.append(formFields.lastName, lastName);
      FORM_DATA.append(formFields.email, email);
      FORM_DATA.append(formFields.password, password);
      FORM_DATA.append(formFields.confirmPassword, confirmPassword);
      FORM_DATA.append(formFields.company, company);
      FORM_DATA.append(formFields.interests, interests);
      FORM_DATA.append(formFields.contactNumber, contactNumber);

      try {
        const response = await fetch(`${API_URL}users/`, {
          method: 'POST',
          body: FORM_DATA,
        });

        if (!response.ok) {
          await handleBackendErrors(response);
        } else {
          setIsSuccessModalOpen(true);
        }
      } catch (error) {
        console.log(error);
      }
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
            <label htmlFor={formFields.firstName} className={styles.hidden}>
              {fromLabels.FIRST_NAME}
            </label>
            <input
              type='text'
              id={formFields.firstName}
              className={styles.input}
              name={formFields.firstName}
              placeholder='First Name'
              {...register(formFields.firstName, { required: errorMessages.EMPTY_FIRST_NAME_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.firstName] ? errors[formFields.firstName].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.lastName} className={styles.hidden}>
              {fromLabels.LAST_NAME}
            </label>
            <input
              type='text'
              id={formFields.lastName}
              className={styles.input}
              name={formFields.lastName}
              placeholder='Last Name'
              {...register(formFields.lastName, { required: errorMessages.EMPTY_LAST_NAME_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>{errors[formFields.lastName] ? errors[formFields.lastName].message : ''}</p>
          </div>
          <div>
            <label htmlFor={formFields.email} className={styles.hidden}>
              {fromLabels.EMAIL}
            </label>
            <input
              type='text'
              id={formFields.email}
              className={styles.input}
              name={formFields.email}
              placeholder='Email'
              {...register(formFields.email, { required: errorMessages.EMPTY_EMAIL_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>{errors[formFields.email] ? errors[formFields.email].message : ''}</p>
          </div>
          <div>
            <label htmlFor={formFields.password} className={styles.hidden}>
              {fromLabels.PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.password}
              className={styles.input}
              name={formFields.password}
              placeholder='Password'
              data-testid='password-input'
              {...register(formFields.password, { required: errorMessages.EMPTY_PASSWORD_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>{errors[formFields.password] ? errors[formFields.password].message : ''}</p>
          </div>
          <div>
            <label htmlFor={formFields.confirmPassword} className={styles.hidden}>
              {fromLabels.CONFIRM_PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.confirmPassword}
              className={styles.input}
              name={formFields.confirmPassword}
              placeholder='Confirm Password'
              data-testid='confirm-password-input'
              {...register(formFields.confirmPassword, {
                required: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.empty,
              })}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.confirmPassword] ? errors[formFields.confirmPassword].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.company} className={styles.hidden}>
              {fromLabels.COMPANY}
            </label>
            <input
              type='text'
              id={formFields.company}
              className={styles.input}
              name={formFields.company}
              placeholder='Company'
              {...register(formFields.company, { required: errorMessages.EMPTY_COMPANY_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>{errors[formFields.company] ? errors[formFields.company].message : ''}</p>
          </div>
          <div>
            <label htmlFor={formFields.interests} className={styles.hidden}>
              {fromLabels.INTERESTS}
            </label>
            <input
              type='text'
              id={formFields.interests}
              className={styles.input}
              name={formFields.interests}
              placeholder='Interests'
              {...register(formFields.interests, { required: errorMessages.EMPTY_INTERESTS_ERROR_MESSAGE })}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.interests] ? errors[formFields.interests].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber} className={styles.hidden}>
              {fromLabels.CONTACT_NUMBER}
            </label>
            <Controller
              control={control}
              name={formFields.contactNumber}
              defaultValue=''
              rules={{ required: errorMessages.EMPTY_CONTACT_NUMBER_ERROR_MESSAGE }}
              render={({ field }) => (
                <PhoneInput
                  id={formFields.contactNumber}
                  className={`${formFields.contactNumber} ${styles.input}`}
                  placeholder='Enter contact number'
                  defaultCountry='SG'
                  international
                  {...field}
                />
              )}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.contactNumber] ? errors[formFields.contactNumber].message : ''}
            </p>
          </div>
          <div>
            <Button type='submit' className={styles.button}>
              Sign Up
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
