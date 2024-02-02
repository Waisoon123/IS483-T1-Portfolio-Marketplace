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
import { useLocation } from 'react-router-dom';
import checkAuthentication from '../utils/checkAuthentication.js';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelsText.js';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;
let FORM_DATA;

function EditUserProfile() {
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
  const [csrfToken, setCsrfToken] = useState('');
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
            'X-CSRFToken': csrfToken,
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
    }
    console.log('not valid');
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center'>
      <div className='w-50 rounded shadow-md bg-primary text-black px-8 pt-6 pb-8 mb-4'>
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
        <form onSubmit={handleSubmit(handleUpdate)}>
          <div className='my-2'>
            <label htmlFor={formFields.firstName} className='mr-2'>
              {fromLabels.FIRST_NAME}
            </label>
            <input
              {...register(formFields.firstName, { required: errorMessages.EMPTY_FIRST_NAME_ERROR_MESSAGE })}
              type='text'
              id={formFields.firstName}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.firstName}
              value={firstName}
              placeholder='First Name'
              onChange={e => setFirstName(e.target.value)}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.firstName] ? errors[formFields.firstName].message : ''}
            </p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.lastName} className='mr-2'>
              {fromLabels.LAST_NAME}
            </label>
            <input
              {...register(formFields.lastName, { required: errorMessages.EMPTY_LAST_NAME_ERROR_MESSAGE })}
              type='text'
              id={formFields.lastName}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.lastName}
              value={lastName}
              placeholder='Last Name'
              onChange={e => setLastName(e.target.value)}
            />
            <p className={styles.errorMsg}>{errors[formFields.lastName] ? errors[formFields.lastName].message : ''}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.email} className='mr-11'>
              {fromLabels.EMAIL}
            </label>
            <input
              {...register(formFields.email, { required: errorMessages.EMPTY_EMAIL_ERROR_MESSAGE })}
              type='text'
              id={formFields.email}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.email}
              value={email}
              placeholder='Email'
              onChange={e => setEmail(e.target.value)}
            />
            <p className={styles.errorMsg}>{errors[formFields.email] ? errors[formFields.email].message : ''}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.company} className='mr-3'>
              {fromLabels.COMPANY}
            </label>
            <input
              {...register(formFields.company, { required: errorMessages.EMPTY_COMPANY_ERROR_MESSAGE })}
              type='text'
              id={formFields.company}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.company}
              value={company}
              placeholder='Company'
              onChange={e => setCompany(e.target.value)}
            />
            <p className={styles.errorMsg}>{errors[formFields.company] ? errors[formFields.company].message : ''}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.interests} className='mr-5'>
              {fromLabels.INTERESTS}
            </label>
            <input
              {...register(formFields.interests, { required: errorMessages.EMPTY_INTERESTS_ERROR_MESSAGE })}
              type='text'
              id={formFields.interests}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.interests}
              value={interests}
              placeholder='Interests'
              onChange={e => setInterests(e.target.value)}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.interests] ? errors[formFields.interests].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber}>{fromLabels.CONTACT_NUMBER}</label>
            <Controller
              control={control}
              name={formFields.contactNumber}
              defaultValue={contactNumber}
              rules={{ required: errorMessages.EMPTY_CONTACT_NUMBER_ERROR_MESSAGE }}
              render={({ field }) => (
                <PhoneInput
                  id={formFields.contactNumber}
                  className={`${formFields.contactNumber} ${styles.input}`}
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
          <div className='my-2'>
            <input
              type='checkbox'
              id='updatePasswordCheckbox'
              checked={updatePassword}
              onChange={handlePasswordCheckboxChange}
              className='accent-green'
            />
            <label htmlFor='updatePasswordCheckbox'> Update Password</label>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.password} className='mr-5'>
              {fromLabels.PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.password}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.password}
              placeholder='Password'
              disabled={!updatePassword} // Disable if updatePassword is false
              {...register(formFields.password)}
            />
            <p className={styles.errorMsg}>{errors[formFields.password] ? errors[formFields.password].message : ''}</p>
          </div>
          <div className='mb-2 mr-14'>
            <label htmlFor={formFields.confirmPassword} className='mr-4'>
              {fromLabels.CONFIRM_PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.confirmPassword}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
              name={formFields.confirmPassword}
              placeholder='Confirm Password'
              disabled={!updatePassword} // Disable if updatePassword is false
              {...register(formFields.confirmPassword)}
            />
            <p className={styles.errorMsg}>
              {errors[formFields.confirmPassword] ? errors[formFields.confirmPassword].message : ''}
            </p>
          </div>
          <div className='mb-2'>
            <button
              type='button'
              className='inline-block align-baseline border bg-red hover:bg-button-hoverred text-white font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline'
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-block align-baseline border bg-green hover:bg-button-hovergreen text-white font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline'
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserProfile;
