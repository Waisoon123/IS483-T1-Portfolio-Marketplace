import { useState, useEffect, useRef } from 'react';
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
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
// added for react-select
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

export default function SignUp() {
  const {
    register,
    watch,
    control,
    trigger,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const navigate = useNavigate();
  const initialRender = useRef(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // added for react-select
  const animatedComponents = makeAnimated();

  const formFields = {
    // to be updated to use formFieldNames.js
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

  const handleIsValidFirstName = value => {
    return validators.isValidName(value) || errorMessages.FIRST_NAME_ERROR_MESSAGES.invalid;
  };

  const handleIsValidLastName = value => {
    return validators.isValidName(value) || errorMessages.LAST_NAME_ERROR_MESSAGES.invalid;
  };

  const handleIsValidEmail = value => {
    return validators.isValidEmail(value) || errorMessages.EMAIL_ERROR_MESSAGES.invalid;
  };

  const handleIsValidPassword = async value => {
    const { passwordIsValid, errorKey } = validators.isValidPassword(watch(formFields.password));
    trigger(formFields.confirmPassword); // check confirm password validity when password changes
    return passwordIsValid || errorMessages.PASSWORD_ERROR_MESSAGES[errorKey];
  };

  const handleIsValidConfirmPassword = value => {
    return (
      watch(formFields.confirmPassword) === watch(formFields.password) ||
      errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch
    );
  };

  const handleIsValidNumber = async value => {
    return isValidNumber(value) || errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.invalid;
  };

  const toCamelCase = arr =>
    arr
      .map((word, index) =>
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');

  const handleBackendErrors = async response => {
    if (response.headers.get('content-type').includes('application/json')) {
      const error = await response.json(); // error = {key: [error message], ...}

      Object.keys(error).forEach(key => {
        if (key !== 'detail') {
          setError(key, { message: error[key] }); // if key is not 'detail', the key is the field name, set error message to the field.
        } else {
          // if key is 'detail', the value is a string of array of error messages
          const errorMessageArray = JSON.parse(error[key].replace(/'/g, '"')); // convert string to array
          // iterate through the array to get the individual string error messages
          for (let errorMessageIndex in errorMessageArray) {
            // convert the error message to lowercase and split it into an array of words to look for the field name
            const errorMessageLowerCaseArray = errorMessageArray[errorMessageIndex].toLowerCase().split(' ');
            const window_size = 2;
            for (let i = 0; i < errorMessageLowerCaseArray.length; i++) {
              const word = errorMessageLowerCaseArray.slice(i, i + window_size);
              const camelCaseWord = toCamelCase(word);
              if (word[0] in formFields) {
                // if the first word is a field name, set error message to the field.
                setError(formFields[word[0]], { message: errorMessageArray[errorMessageIndex] });
              } else if (camelCaseWord in formFields) {
                // else check if the field name contains more than one word and set error message to the field.
                setError(formFields[camelCaseWord], { message: errorMessageArray[errorMessageIndex] });
              }
            }
          }
        }
      });
    }
  };

  const handleSignUp = async data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const password = data.password;
    const confirmPassword = data.confirm_password;
    const company = data.company;
    const contactNumber = data.contact_number;
    const interests = data.interests.map(interest => interest.value);

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
      console.error(error);
    }
  };

  return (
    <>
      <Modal isOpen={isSuccessModalOpen}>
        <div className='w-[425px] h-[215px] text-center bg-primary border-4 rounded' data-testid='success-modal'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'>
            <FontAwesomeIcon className='text-secondary-200 mr-4' size='2xl' icon={faThumbsUp} />
            Sign up was successful!
          </h3>
          <p>Please login with your sign-up credentials.</p>
          <button
            className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/2 m-auto mt-4 hover:bg-white hover:text-secondary-200'
            onClick={() => navigate(paths.LOGIN)}
          >
            Continue to Login
          </button>
        </div>
      </Modal>
      <div className='bg-primary'>
        <div className='grid place-items-center h-2/3 sm:w-full md:w-3/4 lg:w-2/3 m-auto lg:py-20 md:py-8 sm:p-8'>
          <div className='flex h-full w-full'>
            <div className='w-1/2 bg-secondary-100 lg:px-20 lg:py-12 sm:p-8'>
              <h1 className='text-black sm:text-2xl md:text-2xl lg:text-2xl font-semibold font-sans'>
                {Object.keys(errors).length === 0
                  ? 'Thank you for choosing Vertex!'
                  : 'Uh Oh... There seems to be an issue with your information. Please review and try again.'}
              </h1>
              {Object.values(errors).map((error, index) => (
                <p key={index} className='text-red sm:text-sm lg:text-md lg:mt-8 sm:mt-4'>
                  <FontAwesomeIcon icon={faTimes} className='mr-2' size='xl' />
                  {error.message}
                </p>
              ))}
            </div>
            <div className='w-1/2 bg-white lg:px-20 lg:py-12 md:p-12 sm:p-8'>
              <h1 className='text-black sm:text-2xl md:text-2xl lg:text-4xl font-semibold font-sans'>Create Account</h1>
              <form method='post' className='' onSubmit={handleSubmit(handleSignUp)}>
                <div className='flex flex-col'>
                  <div className='flex flex-col xl:flex-row sm:space-y-2 xl:space-y-0 xl:space-x-4'>
                    <div className='flex flex-col md:w-full lg:w-full xl:w-1/2'>
                      <label
                        htmlFor={formFields.firstName}
                        className='mt-8 sm:mt-4 mb-2 text-gray-700 sm:text-sm md:text-md'
                      >
                        {fromLabels.FIRST_NAME}
                      </label>
                      <input
                        type='text'
                        id={formFields.firstName}
                        className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                        name={formFields.firstName}
                        data-testid='first-name-input'
                        {...register(formFields.firstName, {
                          validate: handleIsValidFirstName,
                          required: errorMessages.FIRST_NAME_ERROR_MESSAGES.empty,
                        })}
                      />
                    </div>
                    <div className='flex flex-col w-full lg:w-full xl:w-1/2'>
                      <label
                        htmlFor={formFields.lastName}
                        className='mt-8 sm:mt-0 mb-2 text-gray-700 sm:text-sm md:text-md md:mt-4 lg:mt-4'
                      >
                        {fromLabels.LAST_NAME}
                      </label>
                      <input
                        type='text'
                        id={formFields.lastName}
                        className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                        name={formFields.lastName}
                        data-testid='last-name-input'
                        {...register(formFields.lastName, {
                          validate: handleIsValidLastName,
                          required: errorMessages.LAST_NAME_ERROR_MESSAGES.empty,
                        })}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <label htmlFor={formFields.email} className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'>
                      {fromLabels.EMAIL}
                    </label>
                    <input
                      type='text'
                      id={formFields.email}
                      className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                      name={formFields.email}
                      data-testid='email-input'
                      {...register(formFields.email, {
                        validate: handleIsValidEmail,
                        required: errorMessages.EMAIL_ERROR_MESSAGES.empty,
                      })}
                    />
                  </div>
                  <div className='flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4'>
                    <div className='flex flex-col w-full lg:w-full xl:w-1/2 relative'>
                      <label
                        htmlFor={formFields.password}
                        className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                      >
                        {fromLabels.PASSWORD}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id={formFields.password}
                        className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                        name={formFields.password}
                        data-testid='password-input'
                        {...register(formFields.password, {
                          validate: handleIsValidPassword,
                          required: errorMessages.PASSWORD_ERROR_MESSAGES.empty,
                        })}
                      />
                      <div
                        className='absolute inset-y-3 right-0 pr-3 flex items-end cursor-pointer'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEye} className='text-secondary-200' />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} className='text-secondary-200' />
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col w-full xl:w-1/2 relative'>
                      <label
                        htmlFor={formFields.confirmPassword}
                        className='mt-2 mb-2 text-gray-700 text-sm md:text-md md:mt-4 xl:mt-4'
                      >
                        {fromLabels.CONFIRM_PASSWORD}
                      </label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id={formFields.confirmPassword}
                        className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                        name={formFields.confirmPassword}
                        data-testid='confirm-password-input'
                        {...register(formFields.confirmPassword, {
                          validate: handleIsValidConfirmPassword,
                          required: errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty,
                        })}
                      />
                      <div
                        className='absolute inset-y-3 right-0 pr-3 flex items-end cursor-pointer'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <FontAwesomeIcon icon={faEye} className='text-secondary-200' />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} className='text-secondary-200' />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4'>
                    <div className='flex flex-col w-full lg:w-full xl:w-1/2'>
                      <label
                        htmlFor={formFields.company}
                        className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                      >
                        {fromLabels.COMPANY}
                      </label>
                      <input
                        type='text'
                        id={formFields.company}
                        className='w-full h-[40px] pl-2.5 border border-secondary-300 rounded-sm placeholder-gray-500 placeholder-italic text-md'
                        name={formFields.company}
                        data-testid='company-input'
                        {...register(formFields.company, {
                          required: errorMessages.COMPANY_ERROR_MESSAGES.empty,
                        })}
                      />
                    </div>
                    <div className='flex flex-col w-full xl:w-1/2'>
                      <label
                        htmlFor={formFields.contactNumber}
                        className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-0 md:mt-4 lg:mt-4'
                      >
                        {fromLabels.CONTACT_NUMBER}
                      </label>
                      <Controller
                        control={control}
                        name={formFields.contactNumber}
                        defaultValue=''
                        rules={{
                          validate: handleIsValidNumber,
                          required: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty,
                        }}
                        render={({ field }) => (
                          <PhoneInput
                            id={formFields.contactNumber}
                            data-testid='contact-number-input'
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
                    <label htmlFor={formFields.interests} className='mt-2 mb-2 text-gray-700 sm:text-sm sm:mt-4'>
                      {fromLabels.INTERESTS}
                    </label>
                    <Controller
                      name={formFields.interests}
                      control={control}
                      rules={{ required: errorMessages.INTERESTS_ERROR_MESSAGES.empty }} // Adapt based on your validation needs
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          options={availableInterests.map(({ id, name }) => ({ value: id, label: name }))}
                          className='w-full text-gray-500'
                          classNamePrefix='select'
                          onChange={selected => {
                            field.onChange(
                              selected.map(({ value }) => ({
                                value,
                                label: availableInterests.find(i => i.id === value).name,
                              })),
                            );
                          }}
                          placeholder='Choose an interest'
                          noOptionsMessage={() => 'No interests found'}
                          value={field.value}
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          styles={{
                            control: styles => ({
                              ...styles,
                              borderColor: '#2E62EC',
                              ':hover': {
                                borderColor: '#2E62EC',
                              },
                            }),
                            multiValue: styles => ({
                              ...styles,
                              backgroundColor: '#5D85F0',
                              color: 'white',
                            }),
                            multiValueLabel: styles => ({
                              ...styles,
                              color: 'white',
                            }),
                            multiValueRemove: styles => ({
                              ...styles,
                              ':hover': {
                                backgroundColor: '#60a5fa',
                                color: 'white',
                              },
                            }),
                          }}
                          data-testid='select-interest' // This is used for testing
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Button
                      type='submit'
                      className='mt-4 w-full p-2.5 bg-secondary-100 rounded-sm text-black text-md font-bold sm:text-sm hover:opacity-65'
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
      </div>
    </>
  );
}
