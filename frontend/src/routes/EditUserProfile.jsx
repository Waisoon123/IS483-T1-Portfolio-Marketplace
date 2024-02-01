import React, { useEffect, useState, useContext } from 'react';
import { Form } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { isValidName, isValidEmail, isValidPassword, isValidCompany, isValidInterest } from '../utils/validators';
import styles from './EditUserProfile.module.css';
import PhoneInput from 'react-phone-number-input';
import Modal from '../components/Modal';
import * as paths from '../constants/paths.js';
import { isValidNumber } from 'libphonenumber-js';
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
import { useLocation } from 'react-router-dom';
import checkAuthentication from '../utils/checkAuthentication.js';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelsText.js';

const API_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN_URL = import.meta.env.VITE_CSRF_TOKEN_URL;
let FORM_DATA;

function EditUserProfile() {
  const navigate = useNavigate();

  const { setIsAuthenticated } = useContext(AuthContext);
  const [isAlertModalOpen, setIsErrorModalOpen] = useState(false);

  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [companyError, setCompanyError] = useState();
  const [interestError, setInterestError] = useState();
  const [contactNumberError, setContactNumberError] = useState();
  const [csrfToken, setCsrfToken] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  // for password non-mandatory fields
  const [updatePassword, setUpdatePassword] = useState(false);

  // Prepoluate form with user profile data
  const location = useLocation();
  const userProfile = location.state || {}; // Use an empty object as a fallback
  console.log('location.state:', location.state);

  const [firstName, setFirstName] = useState(userProfile.first_name || '');
  const [lastName, setLastName] = useState(userProfile.last_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [company, setCompany] = useState(userProfile.company || '');
  const [interests, setInterests] = useState(userProfile.interests || '');
  const [contactNumber, setContactNumber] = useState(userProfile.contact_number || '');
  // retrieve userId from ViewUserProfile
  const userId = userProfile.id;

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
        // navigate(paths.LOGIN);
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
  //Error messages
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
    if (updatePassword) {
      const { passwordIsValid, errorKey } = isValidPassword(password);

      if (!passwordIsValid) {
        setPasswordError(PASSWORD_ERROR_MESSAGE_DICT[errorKey]);
      } else {
        setPasswordError('');
      }
    } else {
      // Clear any previous error messages when password update is not requested
      setPasswordError('');
    }
  };

  const checkConfirmPassword = (confirmPassword, password) => {
    if (!updatePassword) {
      setConfirmPasswordError('');
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.empty);
      return;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError(CONFIRM_PASSWORD_ERROR_MESSAGE_DICT.notMatch);
      return;
    }
    setConfirmPasswordError('');
  };

  // add checkbox for password fields
  const handlePasswordCheckboxChange = () => {
    setUpdatePassword(!updatePassword);
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

  const handleCancel = () => {
    navigate(paths.VIEW_USER_PROFILE);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    FORM_DATA = new FormData(event.target);
    const firstName = FORM_DATA.get(formFields.firstName);
    const lastName = FORM_DATA.get(formFields.lastName);
    const email = FORM_DATA.get(formFields.email);
    const company = FORM_DATA.get(formFields.company);
    const interests = FORM_DATA.get(formFields.interests);
    const contactNumber = FORM_DATA.get(formFields.contactNumber);
    const password = FORM_DATA.get(formFields.password);
    const confirmPassword = FORM_DATA.get(formFields.confirmPassword);

    checkFirstName(firstName);
    checkLastName(lastName);
    checkEmail(email);
    checkCompany(company);
    checkInterest(interests);
    checkContactNumber(contactNumber);
    checkPassword(password);
    checkConfirmPassword(confirmPassword, password);
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

  const handleErrors = async response => {
    if (!response.ok) {
      if (response.headers.get('content-type').includes('application/json')) {
        const error = await response.json();
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
      setIsModalOpen(true);
    }
  };

  // Submit Form:Patch request to update user profile
  const submitForm = async () => {
    try {
      const formData = new FormData();

      // Append form fields to FormData
      formData.append(formFields.firstName, FORM_DATA.get(formFields.firstName));
      formData.append(formFields.lastName, FORM_DATA.get(formFields.lastName));
      formData.append(formFields.email, FORM_DATA.get(formFields.email));
      formData.append(formFields.company, FORM_DATA.get(formFields.company));
      formData.append(formFields.interests, FORM_DATA.get(formFields.interests));
      formData.append(formFields.contactNumber, FORM_DATA.get(formFields.contactNumber));

      // Check if password should be updated
      const hasPassword =
        updatePassword && FORM_DATA.get(formFields.password) && FORM_DATA.get(formFields.confirmPassword);

      if (hasPassword) {
        formData.append(formFields.password, FORM_DATA.get(formFields.password));
        formData.append(formFields.confirmPassword, FORM_DATA.get(formFields.confirmPassword));
      }

      // Submit the form only if there are no validation errors
      if (
        firstNameError === '' &&
        lastNameError === '' &&
        emailError === '' &&
        companyError === '' &&
        interestError === '' &&
        contactNumberError === '' &&
        (!updatePassword || hasPassword) // Only check passwordError if password update is requested
      ) {
        const response = await fetch(`${API_URL}users/${userId}/`, {
          method: 'PATCH',
          body: formData,
          headers: {
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });

        await handleErrors(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center'>
      <div className='w-50 rounded shadow-md bg-primary text-black px-8 pt-6 pb-8 mb-4'>
        <Modal isOpen={isAlertModalOpen}>
          <div>
            <p>Please Login to Continue</p>
            <button onClick={() => navigate(paths.LOGIN)}>Login</button>
          </div>
        </Modal>
        <Modal isOpen={isModalOpen}>
          <div>
            <p>Update was successful!</p>
            <button onClick={() => navigate(paths.VIEW_USER_PROFILE)}>Continue to View Profile</button>
          </div>
        </Modal>
        <Form onSubmit={handleSubmit}>
          <div className='my-2'>
            <label htmlFor={formFields.firstName} className='mr-2'>
              {fromLabels.FIRST_NAME}
            </label>
            <input
              type='text'
              id={formFields.firstName}
              name={formFields.firstName}
              placeholder='First Name'
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{firstNameError}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.lastName} className='mr-2'>
              {fromLabels.LAST_NAME}
            </label>
            <input
              type='text'
              id={formFields.lastName}
              name={formFields.lastName}
              placeholder='Last Name'
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{lastNameError}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.email} className='mr-11'>
              {fromLabels.EMAIL}
            </label>
            <input
              type='text'
              id={formFields.email}
              name={formFields.email}
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{emailError}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.company} className='mr-3'>
              {fromLabels.COMPANY}
            </label>
            <input
              type='text'
              id={formFields.company}
              name={formFields.company}
              placeholder='Company'
              value={company}
              onChange={e => setCompany(e.target.value)}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{companyError}</p>
          </div>
          <div className='mb-2'>
            <label htmlFor={formFields.interests} className='mr-5'>
              {fromLabels.INTERESTS}
            </label>
            <input
              type='text'
              id={formFields.interests}
              name={formFields.interests}
              placeholder='Interests'
              value={interests}
              onChange={e => setInterests(e.target.value)}
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{interestError}</p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber}>{fromLabels.CONTACT_NUMBER}</label>
            <PhoneInput
              id={formFields.contactNumber}
              className={formFields.contactNumber}
              placeholder='Enter contact number'
              defaultCountry='SG'
              value={contactNumber}
              onChange={value => setContactNumber(value)}
              name={formFields.contactNumber}
              international
            />
            <p className='text-red font-bold text-l'>{contactNumberError}</p>
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
              name={formFields.password}
              placeholder='Password'
              disabled={!updatePassword} // Disable if updatePassword is false
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{passwordError}</p>
          </div>
          <div className='mb-2 mr-14'>
            <label htmlFor={formFields.confirmPassword} className='mr-4'>
              {fromLabels.CONFIRM_PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.confirmPassword}
              name={formFields.confirmPassword}
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={!updatePassword} // Disable if updatePassword is false
              className='shadow appearance-none rounded w-50 py-2 px-3 leading-tight focus:shadow-outline'
            />
            <p className='text-red font-bold text-l'>{confirmPasswordError}</p>
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
        </Form>
      </div>
    </div>
  );
}

export default EditUserProfile;
