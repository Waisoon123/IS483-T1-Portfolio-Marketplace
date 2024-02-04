import React, { useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  isValidName,
  isValidEmail,
  isValidPassword,
  isValidConfirmPassword,
  isValidCompany,
  isValidInterest,
} from '../utils/validators';
import styles from './EditUserProfile.module.css';
import PhoneInput from 'react-phone-number-input';
import Modal from '../components/Modal';
import * as paths from '../constants/paths.js';
import { isValidNumber } from 'libphonenumber-js';
import * as errorMessages from '../constants/errorMessages';
import * as storageKeys from '../constants/storageKeys';
import { useLocation } from 'react-router-dom';
import checkAuthentication from '../utils/checkAuthentication.js';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelTexts.js';
import Button from '../components/Button.jsx';

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

function EditUserProfile() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);

  // Prepoluate form with user profile data
  const location = useLocation();
  const userProfile = location.state || {}; // Use an empty object as a fallback
  console.log('location.state:', location.state);
  // retrieve userId from ViewUserProfile
  const userId = userProfile.id;
  const [updatePassword, setUpdatePassword] = useState(false);
  const [firstName, setFirstName] = useState(userProfile.first_name || '');
  const [lastName, setLastName] = useState(userProfile.last_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [company, setCompany] = useState(userProfile.company || '');
  const [interests, setInterests] = useState(userProfile.interests || '');
  const [contactNumber, setContactNumber] = useState(userProfile.contact_number || '');

  useEffect(() => {
    // Redirect to login if not authenticated
    checkAuthentication(auth => {
      setIsAuthenticated(auth);

      if (auth) {
        console.log('Authenticated');
        // Redirect to ViewUserProfile if no user profile data is passed in
        if (!location.state) {
          navigate(paths.VIEW_USER_PROFILE);
        }
      } else {
        console.log('Not authenticated');
        setIsErrorModalOpen(true);
      }
    });
  }, [location.state, navigate]);

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

  // add checkbox for password fields
  const handlePasswordCheckboxChange = () => {
    setUpdatePassword(!updatePassword);
  };

  const validateForm = (firstName, lastName, email, company, interests, contactNumber, password, confirmPassword) => {
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
    if (updatePassword) {
      const { passwordIsValid, errorKey } = isValidPassword(password);
      if (!passwordIsValid) {
        setError(formFields.password, { message: errorMessages.PASSWORD_ERROR_MESSAGE_DICT[errorKey] });
        setValue(formFields.password, '');
        isValid = false;
      }
      if (confirmPassword) {
        if (!isValidConfirmPassword(password, confirmPassword)) {
          setError(formFields.confirmPassword, { message: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.notMatch });
          setValue(formFields.confirmPassword, '');
          isValid = false;
        }
      } else {
        setError(formFields.confirmPassword, { message: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.empty });
        isValid = false;
      }
    }
    return isValid;
  };

  const handleCancel = () => {
    navigate(paths.VIEW_USER_PROFILE);
  };

  const handleBackendErrors = async response => {
    if (response.headers.get('content-type').includes('application/json')) {
      const error = await response.json(); // error = {key: [error message], ...}

      for (let key in error) {
        setError(formFields[key], { message: error[key] });
        setValue(formFields[key], '');
        // also clear confirm password input if the key is password.
        if (key === 'password') {
          setValue(formFields.confirmPassword, '');
        }
      }
    }
  };

  const handleUpdate = async data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const company = data.company;
    const interests = data.interests;
    const contactNumber = data.contact_number;
    const password = data.password;
    const confirmPassword = data.confirm_password;

    // form validation
    const isValid = validateForm(
      firstName,
      lastName,
      email,
      company,
      interests,
      contactNumber,
      password,
      confirmPassword,
    );

    if (isValid) {
      FORM_DATA = new FormData();
      FORM_DATA.append(formFields.firstName, firstName);
      FORM_DATA.append(formFields.lastName, lastName);
      FORM_DATA.append(formFields.email, email);
      FORM_DATA.append(formFields.company, company);
      FORM_DATA.append(formFields.interests, interests);
      FORM_DATA.append(formFields.contactNumber, contactNumber);
      if (updatePassword) {
        FORM_DATA.append(formFields.password, password);
        FORM_DATA.append(formFields.confirmPassword, confirmPassword);
      }

      try {
        const response = await fetch(`${API_URL}users/${userId}/`, {
          method: 'PATCH',
          body: FORM_DATA,
          headers: {
            authorization: `Bearer ${localStorage.getItem(storageKeys.ACCESS_TOKEN)}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          await handleBackendErrors(response);
        } else {
          setIsSuccessModalOpen(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('not valid');
    }
  };

  return (
    <div className={styles.container}>
      <Modal isOpen={isErrorModalOpen}>
        <div>
          <p>Please Login to Continue</p>
          <button onClick={() => navigate(paths.LOGIN)}>Login</button>
        </div>
      </Modal>
      <Modal isOpen={isSuccessModalOpen}>
        <div>
          <p>Update was successful!</p>
          <button onClick={() => navigate(paths.VIEW_USER_PROFILE)}>Continue to View Profile</button>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor={formFields.firstName} className={styles.title}>
            {fromLabels.FIRST_NAME}
          </label>
          <input
            {...register(formFields.firstName, { required: errorMessages.EMPTY_FIRST_NAME_ERROR_MESSAGE })}
            type='text'
            id={formFields.firstName}
            className={styles.input}
            name={formFields.firstName}
            value={firstName}
            placeholder='First Name'
            onChange={e => setFirstName(e.target.value)}
          />
          <p className={styles.errorMsg}>{errors[formFields.firstName] ? errors[formFields.firstName].message : ''}</p>

          <label htmlFor={formFields.lastName} className={styles.title}>
            {fromLabels.LAST_NAME}
          </label>
          <input
            {...register(formFields.lastName, { required: errorMessages.EMPTY_LAST_NAME_ERROR_MESSAGE })}
            type='text'
            id={formFields.lastName}
            className={styles.input}
            name={formFields.lastName}
            value={lastName}
            placeholder='Last Name'
            onChange={e => setLastName(e.target.value)}
          />
          <p className={styles.errorMsg}>{errors[formFields.lastName] ? errors[formFields.lastName].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.email} className={styles.title}>
            {fromLabels.EMAIL}
          </label>
          <input
            {...register(formFields.email, { required: errorMessages.EMPTY_EMAIL_ERROR_MESSAGE })}
            type='text'
            id={formFields.email}
            className={styles.input}
            name={formFields.email}
            value={email}
            placeholder='Email'
            onChange={e => setEmail(e.target.value)}
          />
          <p className={styles.errorMsg}>{errors[formFields.email] ? errors[formFields.email].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.company} className={styles.title}>
            {fromLabels.COMPANY}
          </label>
          <input
            {...register(formFields.company, { required: errorMessages.EMPTY_COMPANY_ERROR_MESSAGE })}
            type='text'
            id={formFields.company}
            className={styles.input}
            name={formFields.company}
            value={company}
            placeholder='Company'
            onChange={e => setCompany(e.target.value)}
          />
          <p className={styles.errorMsg}>{errors[formFields.company] ? errors[formFields.company].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.interests} className={styles.title}>
            {fromLabels.INTERESTS}
          </label>
          <input
            {...register(formFields.interests, { required: errorMessages.EMPTY_INTERESTS_ERROR_MESSAGE })}
            type='text'
            id={formFields.interests}
            className={styles.input}
            name={formFields.interests}
            value={interests}
            placeholder='Interests'
            onChange={e => setInterests(e.target.value)}
          />
          <p className={styles.errorMsg}>{errors[formFields.interests] ? errors[formFields.interests].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.contactNumber} className={styles.title}>
            {fromLabels.CONTACT_NUMBER}
          </label>
          <Controller
            control={control}
            name={formFields.contactNumber}
            defaultValue={contactNumber}
            rules={{ required: errorMessages.EMPTY_CONTACT_NUMBER_ERROR_MESSAGE }}
            render={({ field }) => (
              <PhoneInput
                id={formFields.contactNumber}
                className={`${formFields.contactNumber} ${styles.phoneinput}`}
                value={field.value}
                onChange={value => {
                  setContactNumber(value);
                  field.onChange(value);
                }}
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

        <div className={styles.field}>
          <input
            type='checkbox'
            id='updatePasswordCheckbox'
            checked={updatePassword}
            onChange={handlePasswordCheckboxChange}
            className={styles.checkbox}
          />
          <label htmlFor='updatePasswordCheckbox' className={styles.title}>
            {' '}
            Update Password
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.password} className={styles.title}>
            {fromLabels.PASSWORD}
          </label>
          <input
            type='password'
            id={formFields.password}
            className={styles.input}
            name={formFields.password}
            placeholder='Password'
            disabled={!updatePassword} // Disable if updatePassword is false
            {...register(formFields.password)}
          />
          <p className={styles.errorMsg}>{errors[formFields.password] ? errors[formFields.password].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFields.confirmPassword} className={styles.title}>
            {fromLabels.CONFIRM_PASSWORD}
          </label>
          <input
            type='password'
            id={formFields.confirmPassword}
            className={styles.input}
            name={formFields.confirmPassword}
            placeholder='Confirm Password'
            disabled={!updatePassword} // Disable if updatePassword is false
            {...register(formFields.confirmPassword)}
          />
          <p className={styles.errorMsg}>
            {errors[formFields.confirmPassword] ? errors[formFields.confirmPassword].message : ''}
          </p>
        </div>

        <div>
          <button type='submit' className={styles.cfmButton}>
            Update
          </button>
        </div>
        <div>
          <Button type='button' className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditUserProfile;
