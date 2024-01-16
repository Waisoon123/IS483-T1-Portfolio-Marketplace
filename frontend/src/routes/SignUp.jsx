import { useState } from 'react';
import { Form } from 'react-router-dom';
import { redirect } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';

import styles from './SignUp.module.css';

export default function SignUp() {
  const [nameErrors, setNameErrors] = useState({ first_name: '', last_name: '' });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [interestError, setInterestError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();

    // Your form validation logic here
    const formData = new FormData(event.target);
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const email = formData.get('email');
    const password = formData.get('password');
    const company = formData.get('company');
    const interests = formData.get('interests');
    const contact_number = formData.get('contact_number');

    if (!isValidName(first_name, 'first_name')) {
      return;
    }

    if (!isValidName(last_name, 'last_name')) {
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Invalid email format. Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      return;
    }

    if (!isValidCompany(company)) {
      setCompanyError('Company field cannot be blank. Please enter a valid company name.');
      return;
    }

    if (!isValidInterest(interests)) {
      setInterestError('Interest field cannot be blank. Please enter at least one interest.');
      return;
    }

    if (!isValidNumber(contact_number)) {
      setPhoneNumberError('Invalid phone number');
      return;
    } else {
      setPhoneNumberError('');
    }

    // Your form submission logic here
    try {
      // Assuming some server-side validation
      // throw new Error('Example server error');
      await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        body: formData,
      }).then(response => {
        console.log(response.json());
      });

      // If successful, redirect to login
      return redirect('/login');
    } catch (error) {
      // Handle server-side error and update emailError or other error states
      console.error('Server error:', error);
    }
  };

  const isValidName = (name, fieldName) => {
    // Check if the name contains only letters and spaces, and does not contain invalid special characters and numeric characters
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: 'Name should not contain numbers or special characters.',
      }));
      return false;
    }
    // Reset the error state if the name is now valid
    // Upon re-entering a valid name, this should clear the display error
    setNameErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));

    // If pass the check, the name is considered valid
    return true;
  };

  const isValidEmail = email => {
    // Check if the email contains '@' and does not contain invalid special characters
    if (!/^[a-zA-Z0-9._@-]+$/.test(email)) {
      return false;
    }

    // Reset the error state if the email is now valid
    // Upon re-entering a valid email, this should clear the display error
    setEmailError('');

    // If both checks pass, the email is considered valid
    return true;
  };

  const isValidPassword = password => {
    // Check if the password is at least 8 characters long.
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return false;
    }

    // Check if the password contains at least 1 lowercase letter
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least 1 lowercase letter.');
      return false;
    }

    // Check if the password contains at least 1 uppercase letter
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least 1 uppercase letter.');
      return false;
    }

    // Check if the password contains at least 1 special character
    if (!/[^\w]/.test(password)) {
      setPasswordError('Password must contain at least 1 special character: !@#$%^&*()_+');
      return false;
    }

    // Check if the password contains at least 1 number
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least 1 number.');
      return false;
    }

    // Reset the error state if the password is now valid
    // Upon re-entering a valid password, this should clear the display error
    setPasswordError('');

    // If pass the check, the password is considered valid
    return true;
  };

  const isValidCompany = company => {
    // Check if the company is not blank
    if (!company) {
      return false;
    }

    // Reset the error state if the company is now valid
    // Upon re-entering a valid company, this should clear the display error
    setCompanyError('');

    // If pass the check, the company is considered valid
    return true;
  };

  const isValidInterest = interests => {
    // Check if the interests is not blank
    if (!interests) {
      return false;
    }

    // Reset the error state if the interests is now valid
    // Upon re-entering a valid interests, this should clear the display error
    setInterestError('');

    // If pass the check, the interests is considered valid
    return true;
  };

  return (
    <Form method='post' className={styles.form} onSubmit={handleSubmit}>
      <div>
        <label htmlFor=''>First Name</label>
        <input type='text' className={styles.input} name='first_name' />
        <p className={styles.errorMsg}>{nameErrors.first_name}</p>
      </div>
      <div>
        <label htmlFor=''>Last Name</label>
        <input type='text' className={styles.input} name='last_name' />
        <p className={styles.errorMsg}>{nameErrors.last_name}</p>
      </div>
      <div>
        <label htmlFor=''>Email</label>
        <input type='text' className={styles.input} name='email' />
        <p className={styles.errorMsg}>{emailError}</p>
      </div>
      <div>
        <label htmlFor=''>Password</label>
        <input type='password' className={styles.input} name='password' />
        <p className={styles.errorMsg}>{passwordError}</p>
      </div>
      <div>
        <label htmlFor=''>Company</label>
        <input type='text' className={styles.input} name='company' />
        <p className={styles.errorMsg}>{companyError}</p>
      </div>
      <div>
        <label htmlFor=''>Interests</label>
        <input type='text' className={styles.input} name='interests' />
        <p className={styles.errorMsg}>{interestError}</p>
      </div>
      <div>
        <label htmlFor=''>Contact Number</label>
        <PhoneInput
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
