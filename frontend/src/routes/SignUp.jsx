import { useState, useEffect } from 'react';
import { useForm, Controller, set } from 'react-hook-form';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

export default function SignUp() {
  const {
    register,
    unregister,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
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
    const interestId = parseInt(e); // Parse the value to an integer
    const selectedInterest = availableInterests.find(interest => interest.id === interestId);
    setValue(formFields.interests, '');
    setError(formFields.interests, null); // Clear the error message

    // Check if the interest is already selected
    if (!selectedInterests.some(interest => interest.id === interestId)) {
      setSelectedInterests(prevInterests => [...prevInterests, selectedInterest]);
      setAvailableInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    }
  };

  const watchInterest = watch(formFields.interests);
  useEffect(() => {
    if (watchInterest) {
      handleInterestChange(watchInterest);
    }
  }, [watchInterest]);

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
    const interests = selectedInterests.map(interest => interest.id);
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
        <div
          className='w-[525px] h-[165px] text-center bg-modalSuccess border-4 border-modalSuccessBorder'
          data-testid='success-modal'
        >
          <h3 className='text-xl font-bold mt-6 mb-2.5'>Sign up was successful!</h3>
          <p>Please login with your sign-up credentials.</p>
          <hr className='border border-white my-4 w-full' />
          <button className='font-bold text-md' onClick={() => navigate(paths.LOGIN)}>
            Continue to Login
          </button>
        </div>
      </Modal>
      <div className='bg-primary px-32 py-24'>
        <div className='flex'>
          <div className='w-1/2 bg-secondary-100 px-12 py-12'>
            <h1 className='text-black text-4xl font-semibold font-sans'>
              {Object.keys(errors).length === 0
                ? 'Thank you for signing up!'
                : 'Uh Oh... Seems like something is wrong !'}
            </h1>
            {Object.values(errors).map((error, index) => (
              <p key={index} className='text-red text-md mt-8'>
                <FontAwesomeIcon icon={faTimes} className='mr-2' size='xl' />
                {error.message}
              </p>
            ))}
          </div>
          <div className='w-1/2 bg-white px-20 py-12'>
            <h1 className='text-black text-4xl font-semibold font-sans'>Create Account</h1>
            <p className='mt-8 text-black text-lg'>All fields are mandatory, please kindly fill up.</p>
            <form method='post' className='' onSubmit={handleSubmit(handleSignUp)}>
              <div className='flex flex-col'>
                <div className='flex space-x-4'>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.firstName} className='mt-8 mb-2 text-gray-700'>
                      {fromLabels.FIRST_NAME}
                    </label>
                    <input
                      type='text'
                      id={formFields.firstName}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                      name={formFields.firstName}
                      {...register(formFields.firstName, { required: errorMessages.FIRST_NAME_ERROR_MESSAGES.empty })}
                    />
                  </div>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.lastName} className='mt-8 mb-2 text-gray-700'>
                      {fromLabels.LAST_NAME}
                    </label>
                    <input
                      type='text'
                      id={formFields.lastName}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                      name={formFields.lastName}
                      {...register(formFields.lastName, { required: errorMessages.LAST_NAME_ERROR_MESSAGES.empty })}
                    />
                  </div>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor={formFields.email} className='mt-2 mb-2 text-gray-700'>
                    {fromLabels.EMAIL}
                  </label>
                  <input
                    type='text'
                    id={formFields.email}
                    className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                    name={formFields.email}
                    {...register(formFields.email, { required: errorMessages.EMAIL_ERROR_MESSAGES.empty })}
                  />
                </div>
                <div className='flex space-x-4'>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.password} className='mt-2 mb-2 text-gray-700'>
                      {fromLabels.PASSWORD}
                    </label>
                    <input
                      type='password'
                      id={formFields.password}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                      name={formFields.password}
                      data-testid='password-input'
                      {...register(formFields.password, { required: errorMessages.PASSWORD_ERROR_MESSAGES.empty })}
                    />
                  </div>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.confirmPassword} className='mt-2 mb-2 text-gray-700'>
                      {fromLabels.CONFIRM_PASSWORD}
                    </label>
                    <input
                      type='password'
                      id={formFields.confirmPassword}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                      name={formFields.confirmPassword}
                      data-testid='confirm-password-input'
                      {...register(formFields.confirmPassword, {
                        required: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty,
                      })}
                    />
                  </div>
                </div>
                <div className='flex space-x-4'>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.company} className='mt-2 mb-2 text-gray-700'>
                      {fromLabels.COMPANY}
                    </label>
                    <input
                      type='text'
                      id={formFields.company}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md mb-2'
                      name={formFields.company}
                      {...register(formFields.company, { required: errorMessages.COMPANY_ERROR_MESSAGES.empty })}
                    />
                  </div>
                  <div className='flex flex-col w-1/2'>
                    <label htmlFor={formFields.contactNumber} className='mt-2 mb-2 text-gray-700'>
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
                          className={`${formFields.contactNumber} w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md`}
                          defaultCountry='SG'
                          international
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor={formFields.interests} className='mt-2 mb-2 text-gray-700'>
                    {fromLabels.INTERESTS}
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {selectedInterests.map(interest => (
                      <div
                        data-testid={interest.name}
                        key={interest.id}
                        className='flex justify-center bg-secondary-300 text-white w-auto p-2 text-md font-medium mb-2.5 rounded-md'
                      >
                        {interest.name}
                        <button
                          className='ml-2 cursor-pointer border-none'
                          onClick={() => handleRemoveInterest(interest.id)}
                        >
                          &#x2715;
                        </button>
                      </div>
                    ))}
                  </div>
                  <select
                    data-testid='select-interest'
                    id={formFields.interests}
                    className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
                    name={formFields.interests}
                    placeholder='Interests'
                    defaultValue='' // Show empty option when no interest is selected.
                    {...register(formFields.interests)}
                  >
                    <option data-testid='select-option' value='' disabled hidden>
                      Choose an interest
                    </option>
                    {availableInterests.map(interest => (
                      <option key={interest.id} value={interest.id}>
                        {interest.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button
                    type='submit'
                    className='mt-4 w-full bg-secondary-100 rounded-sm text-black text-md font-bold py-4'
                    onClick={() => {}} // No-op function
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
