import React, { useEffect, useState } from 'react';
import { Form } from 'react-router-dom';
//to navigate back to viewuserprofile
import { useNavigate } from 'react-router-dom';
//error validation
import { isValidName, isValidEmail, isValidPassword, isValidCompany, isValidInterest } from '../utils/validators';
//css
import styles from './EditUserProfile.module.css';
// import './EditUserProfile.module.css';
import PhoneInput from 'react-phone-number-input';
import Modal from '../components/Modal';
import * as paths from './constants/paths.js';
import { isValidNumber } from 'libphonenumber-js';
import {
  firstNameErrorMessage,
  lastNameErrorMessage,
  emailErrorMessage,
  passwordErrorMessageDict,
  companyErrorMessage,
  interestErrorMessage,
  contactNumberErrorMessage,
} from '../constants/errorMessages';
import { useLocation } from 'react-router-dom';

// fetch user data from API
// display user data in form
// allow user to edit data
// submit data to API
// successful submission
// redirect to viewuserprofile
// also remember to include link from viewuserprofile to edituserprofile

let FORM_DATA;

function EditUserProfile() {
  const navigate = useNavigate();
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [companyError, setCompanyError] = useState();
  const [interestError, setInterestError] = useState();
  const [phoneNumberError, setPhoneNumberError] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [csrfToken, setCsrfToken] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // for prepopulating form
  const location = useLocation();
  const userProfile = location.state;
  const [firstName, setFirstName] = useState(userProfile.first_name || '');
  const [lastName, setLastName] = useState(userProfile.last_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [company, setCompany] = useState(userProfile.company || '');
  const [interests, setInterests] = useState(userProfile.interests || '');
  const [contactNumber, setContactNumber] = useState(userProfile.contact_number || '');

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

  /////////////////////
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
        console.log(await response.text());
      }
    } else {
      console.log(await response.json());
      setIsModalOpen(true);
    }
  };

  const submitForm = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/49/', {
        method: 'PATCH',
        body: FORM_DATA,
        headers: {
          // 'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      console.log('working');

      await handleErrors(response);
    } catch (error) {
      console.log(error);
      //   navigate('/sign-up');
    }
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg'>
      <div className='w-50 border bg-slate-300 text-black p-5'>
        {/* later edit to follow sequencing from sign-up,viewuserprofile */}
        <Modal isOpen={isModalOpen}>
          <div>
            <p>Update was successful!</p>
            <button onClick={() => navigate(paths.VIEW_USER_PROFILE)}>Continue to View Profile</button>
          </div>
        </Modal>
        <Form onSubmit={handleSubmit}>
          <div>
            <label htmlFor={formFields.firstName}>First Name:</label>
            <input
              type='text'
              id={formFields.firstName}
              name={formFields.firstName}
              placeholder='First Name'
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            {/* value={values.first_name} onChange={e => setValues({...values,first_name:e.target.value})}/> */}
            <p className={styles.error}>{firstNameError}</p>
          </div>
          <div>
            <label htmlFor={formFields.lastName}>Last Name:</label>
            <input
              type='text'
              id={formFields.lastName}
              name={formFields.lastName}
              placeholder='Last Name'
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
            {/* // value={values.last_name} onChange={e => setValues({...values,last_name:e.target.value})}/> */}
            <p className={styles.error}>{lastNameError}</p>
          </div>
          <div>
            <label htmlFor={formFields.email}>Email:</label>
            <input
              type='text'
              id={formFields.email}
              name={formFields.email}
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {/* value={values.email} onChange={e => setValues({...values,email:e.target.value})}/> */}
            <p className={styles.error}>{emailError}</p>
          </div>
          <div>
            <label htmlFor={formFields.company}>Company:</label>
            <input
              type='text'
              id={formFields.company}
              name={formFields.company}
              placeholder='Company'
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
            {/* value={values.company} onChange={e => setValues({...values,company:e.target.value})}/> */}
            <p className={styles.error}>{companyError}</p>
          </div>
          <div>
            <label htmlFor={formFields.interests}>Interests:</label>
            <input
              type='text'
              id={formFields.interests}
              name={formFields.interests}
              placeholder='Interests'
              value={interests}
              onChange={e => setInterests(e.target.value)}
            />
            {/* value={values.interests} onChange={e => setValues({...values,interests:e.target.value})}/> */}
            <p className={styles.error}>{interestError}</p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber}>Contact Number:</label>
            {/* <input type="text" id="contactnumber" name="contactnumber" placeholder="Contact Number" /> */}
            <PhoneInput
              id={formFields.contactNumber}
              className={formFields.contactNumber}
              placeholder='Enter contact number'
              defaultCountry='SG'
              // value={phoneNumber} old one
              value={contactNumber}
              // onChange={setPhoneNumber} old one
              // onChange={(e) => setPhoneNumber(e.target.value)}
              onChange={value => setContactNumber(value)}
              name={formFields.contactNumber}
              international
            />
            {/* value={values.contact_number} onChange={e => setValues({...values,contact_number:e.target.value})}/> */}
            <p className={styles.error}>{phoneNumberError}</p>
          </div>
          <div>
            <label htmlFor={formFields.password}>Password:</label>
            <input type='password' id={formFields.password} name={formFields.password} placeholder='Password' />
            <p className={styles.error}>{passwordError}</p>
          </div>
          <br />
          <button type='submit' className='btn btn-info w-50 border bg-emerald-600 text-white p-3'>
            Update
          </button>
        </Form>
      </div>
    </div>
  );
}

export default EditUserProfile;
