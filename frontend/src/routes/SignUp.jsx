import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';
import * as validators from '../utils/validators';
import Modal from '../components/Modal';
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
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);

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
    // Fetch available interests from the backend when component mounts
    fetchAvailableInterests();
  }, []);

  const fetchAvailableInterests = async () => {
    try {
      const response = await fetch(`${API_URL}interests/`);
      if (!response.ok) {
        throw new Error('Failed to fetch interests');
      }
      const data = await response.json();
      setAvailableInterests(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    register(formFields.contactNumber, { required: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty });

    return () => {
      unregister(formFields.contactNumber);
    };
  }, [register, unregister, formFields.contactNumber]);

  const handleInterestChange = e => {
    const interestId = parseInt(e.target.value); // Parse the value to an integer
    const selectedInterest = availableInterests.find(interest => interest.id === interestId);

    // Check if the interest is already selected
    if (!selectedInterests.some(interest => interest.id === interestId)) {
      setSelectedInterests(prevInterests => [...prevInterests, selectedInterest]);
      setAvailableInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    }
  };

  const handleRemoveInterest = interestId => {
    const removedInterest = selectedInterests.find(interest => interest.id === interestId);

    setSelectedInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    setAvailableInterests(prevInterests => [...prevInterests, removedInterest]);
  };

  const validateForm = (firstName, lastName, email, password, confirmPassword, company, interests, contactNumber) => {
    let isValid = true;
    if (!validators.isValidName(firstName)) {
      setError(formFields.firstName, { message: errorMessages.FIRST_NAME_ERROR_MESSAGES.invalid });
      isValid = false;
    }
    if (!validators.isValidName(lastName)) {
      setError(formFields.lastName, { message: errorMessages.LAST_NAME_ERROR_MESSAGES.invalid });
      isValid = false;
    }
    if (!validators.isValidEmail(email)) {
      setError(formFields.email, { message: errorMessages.EMAIL_ERROR_MESSAGES.invalid });
      isValid = false;
    }
    const { passwordIsValid, errorKey } = validators.isValidPassword(password);
    if (!passwordIsValid) {
      setError(formFields.password, { message: errorMessages.PASSWORD_ERROR_MESSAGES[errorKey] });
      setValue(formFields.password, '');
      isValid = false;
    }
    if (!validators.isConfirmPasswordMatch(password, confirmPassword)) {
      setError(formFields.confirmPassword, { message: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch });
      setValue(formFields.confirmPassword, '');
      isValid = false;
    }
    if (!validators.isValidCompany(company)) {
      setError(formFields.company, { message: errorMessages.COMPANY_ERROR_MESSAGES.empty });
      isValid = false;
    }
    if (!validators.isValidInterest(interests)) {
      setError(formFields.interests, { message: errorMessages.INTERESTS_ERROR_MESSAGES.empty });
      isValid = false;
    }
    if (!isValidNumber(contactNumber)) {
      setError(formFields.contactNumber, { message: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.invalid });
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
    const interests = selectedInterests.map(interest => interest);
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
      FORM_DATA.append(formFields.interests, JSON.stringify(interests));
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
      <div className='fixed inset-0 bg-black bg-opacity-50 z-10'></div>
      <form
        method='post'
        className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 mt-5 bg-primary p-8 rounded-lg h-auto'
        onSubmit={handleSubmit(handleSignUp)}
      >
        <h1 className='text-2xl font-bold text-center mb-5'>Sign Up</h1>
        <div className='flex flex-col justify-center items-center'>
          <div>
            <label htmlFor={formFields.firstName} className='sr-only'>
              {fromLabels.FIRST_NAME}
            </label>
            <input
              type='text'
              id={formFields.firstName}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.firstName}
              placeholder='First Name'
              {...register(formFields.firstName, { required: errorMessages.FIRST_NAME_ERROR_MESSAGES.empty })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.firstName] ? errors[formFields.firstName].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.lastName} className='sr-only'>
              {fromLabels.LAST_NAME}
            </label>
            <input
              type='text'
              id={formFields.lastName}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.lastName}
              placeholder='Last Name'
              {...register(formFields.lastName, { required: errorMessages.LAST_NAME_ERROR_MESSAGES.empty })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.lastName] ? errors[formFields.lastName].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.email} className='sr-only'>
              {fromLabels.EMAIL}
            </label>
            <input
              type='text'
              id={formFields.email}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.email}
              placeholder='Email'
              {...register(formFields.email, { required: errorMessages.EMAIL_ERROR_MESSAGES.empty })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.email] ? errors[formFields.email].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.password} className='sr-only'>
              {fromLabels.PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.password}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.password}
              placeholder='Password'
              data-testid='password-input'
              {...register(formFields.password, { required: errorMessages.PASSWORD_ERROR_MESSAGES.empty })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.password] ? errors[formFields.password].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.confirmPassword} className='sr-only'>
              {fromLabels.CONFIRM_PASSWORD}
            </label>
            <input
              type='password'
              id={formFields.confirmPassword}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.confirmPassword}
              placeholder='Confirm Password'
              data-testid='confirm-password-input'
              {...register(formFields.confirmPassword, {
                required: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty,
              })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.confirmPassword] ? errors[formFields.confirmPassword].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.company} className='sr-only'>
              {fromLabels.COMPANY}
            </label>
            <input
              type='text'
              id={formFields.company}
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
              name={formFields.company}
              placeholder='Company'
              {...register(formFields.company, { required: errorMessages.COMPANY_ERROR_MESSAGES.empty })}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.company] ? errors[formFields.company].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.interests} className='sr-only'>
              {fromLabels.INTERESTS}
            </label>
            <div className='flex flex-wrap gap-2'>
              {selectedInterests.map(interest => (
                <div
                  key={interest.id}
                  className='flex justify-center bg-secondary-300 text-white w-auto p-2 text-md font-medium mb-2.5 rounded-md'
                >
                  {interest.name}
                  <button className='ml-2 cursor-pointer border-none' onClick={() => handleRemoveInterest(interest.id)}>
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
            <select
              id='interests'
              className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
              name='interests'
              placeholder='Interests'
              onChange={handleInterestChange}
              value='' // Reset select value after an option is selected
              // {...register(formFields.interests, { required: errorMessages.INTERESTS_ERROR_MESSAGES.empty })}
            >
              <option value='' disabled hidden>
                Choose an interest
              </option>
              {availableInterests.map(interest => (
                <option key={interest.id} value={interest.id}>
                  {interest.name}
                </option>
              ))}
            </select>
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.interests] ? errors[formFields.interests].message : ''}
            </p>
          </div>
          <div>
            <label htmlFor={formFields.contactNumber} className='sr-only'>
              {fromLabels.CONTACT_NUMBER}
            </label>
            <Controller
              control={control}
              name={formFields.contactNumber}
              defaultValue=''
              rules={{ required: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty }}
              render={({ field }) => (
                <PhoneInput
                  id={formFields.contactNumber}
                  className={`${formFields.contactNumber} w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md`}
                  placeholder='Enter contact number'
                  defaultCountry='SG'
                  international
                  {...field}
                />
              )}
            />
            <p className='mt-2.5 mb-2.5 font-medium text-sm text-red'>
              {errors[formFields.contactNumber] ? errors[formFields.contactNumber].message : ''}
            </p>
          </div>
          <div>
            <Button
              type='submit'
              className='w-[500px] h-10 border-2 border-secondary-300 rounded-sm text-secondary-300 shadow-md hover:bg-secondary-300 hover:text-primary text-md font-bold'
            >
              Sign Up
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
