import { useState } from 'react';
import { Form } from 'react-router-dom';
import { redirect } from 'react-router-dom';

export default function SignUp() {
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [interestError, setInterestError] = useState('');
  // const [numberError, setNumberError] = useState('');

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
    // const contact_number = formData.get('contact_number');

    if (!isValidFirstName(first_name)) {
      setFirstNameError('Invalid first name. Please enter a valid first name.');
      return;
    }

    if (!isValidLastName(last_name)) {
      setLastNameError('Invalid last name. Please enter a valid last name.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Invalid email format. Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      setPasswordError(
        'Please ensure that your password is at least 8 characters long, consists of 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number.',
      );
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

    // if (!isValidNumber(contact_number)) {
    //   setNumberError(
    //     'Invalid contact number format. Please enter a valid contact number. (e.g. +6512345678)',
    //   );
    //   return;
    // }

    // Your form submission logic here
    try {
      // Assuming some server-side validation
      // throw new Error('Example server error');
      await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        body: formData,
      });

      // If successful, redirect to login
      return redirect('/login');
    } catch (error) {
      // Handle server-side error and update emailError or other error states
      console.error('Server error:', error);
    }
  };

  const isValidFirstName = first_name => {
    // Check if the first name contains only letters and spaces, and does not contain invalid special characters and numeric characters
    if (!/^[a-zA-Z\s]+$/.test(first_name)) {
      setFirstNameError('Invalid first name format. Please enter a valid first name.');
      return false;
    }

    // Reset the error state if the first name is now valid
    // Upon re-entering a valid first name, this should clear the display error
    setFirstNameError('');

    // If pass the check, the first name is considered valid
    return true;
  };

  const isValidLastName = last_name => {
    // Check if the last name contains only letters and spaces, and does not contain invalid special characters and numeric characters
    if (!/^[a-zA-Z\s]+$/.test(last_name)) {
      setLastNameError('Invalid last name format. Please enter a valid last name.');
      return false;
    }

    // Reset the error state if the last name is now valid
    // Upon re-entering a valid last name, this should clear the display error
    setLastNameError('');

    // If pass the check, the last name is considered valid
    return true;
  };

  const isValidEmail = email => {
    // Check if the email contains '@' and does not contain invalid special characters
    if (!/^[a-zA-Z0-9._@-]+$/.test(email)) {
      setEmailError('Invalid email format. Please enter a valid email address.');
      return false;
    }

    // Reset the error state if the email is now valid
    // Upon re-entering a valid email, this should clear the display error
    setEmailError('');

    // If both checks pass, the email is considered valid
    return true;
  };

  const isValidPassword = password => {
    // Check if the password is at least 8 characters long, consists of 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(password)) {
      setPasswordError(
        'Please ensure that your password is at least 8 characters long, consists of 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number.',
      );
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
      setCompanyError('Company field cannot be blank. Please enter a valid company name.');
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
      setInterestError('Interest field cannot be blank. Please enter at least one interest.');
      return false;
    }

    // Reset the error state if the interests is now valid
    // Upon re-entering a valid interests, this should clear the display error
    setInterestError('');

    // If pass the check, the interests is considered valid
    return true;
  };

  // const isValidNumber = contact_number => {
  //   // Check if the contact number is valid
  //   if (!/^\+65[0-9]{8}$/.test(contact_number)) {
  //     setNumberError(
  //       'Invalid contact number format. Please enter a valid contact number. (e.g. +6512345678)',
  //     );
  //     return false;
  //   }

  //   // Reset the error state if the contact number is now valid
  //   // Upon re-entering a valid contact number, this should clear the display error
  //   setNumberError('');

  //   // If pass the check, the contact number is considered valid
  //   return true;
  // };

  return (
    <Form method='post' className='form' onSubmit={handleSubmit}>
      <p>
        <label htmlFor=''>First Name</label>
        <input type='text' name='first_name' />
        <p style={{ color: 'red' }}>{firstNameError}</p>
      </p>
      <p>
        <label htmlFor=''>Last Name</label>
        <input type='text' name='last_name' />
        <p style={{ color: 'red' }}>{lastNameError}</p>
      </p>
      <p>
        <label htmlFor=''>Email</label>
        <input type='text' name='email' />
        <p style={{ color: 'red' }}>{emailError}</p>
      </p>
      <p>
        <label htmlFor=''>Password</label>
        <input type='password' name='password' />
        <p style={{ color: 'red' }}>{passwordError}</p>
      </p>
      {/* <p>
        <label htmlFor=''>Confirm Password</label>
        <input type='password' name='cfmpassword' />
      </p> */}
      <p>
        <label htmlFor=''>Company</label>
        <input type='text' name='company' />
        <p style={{ color: 'red' }}>{companyError}</p>
      </p>
      <p>
        <label htmlFor=''>Interests</label>
        <input type='text' name='interests' />
        <p style={{ color: 'red' }}>{interestError}</p>
      </p>
      <p>
        <label htmlFor=''>Contact Number</label>
        <input type='text' name='contact_number' />
        {/* <p style={{ color: 'red' }}>{numberError}</p> */}
      </p>
      <p>
        <button type='submit'>Sign Up</button>
      </p>
    </Form>
  );
}

// Your action function remains unchanged
export async function action({ request }) {
  const formData = await request.formData();
  formData.delete('cfmpassword');

  await fetch('http://localhost:8000/api/users/', {
    method: 'POST',
    body: formData,
  }).then(response => {
    console.log(response);
    if (response.ok) {
      return redirect('/login');
    }
  });

  return redirect('/sign-up');
}
