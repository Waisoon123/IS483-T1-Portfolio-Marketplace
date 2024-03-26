import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { isValidNumber } from 'libphonenumber-js';
import { AuthContext } from '../App.jsx';
import PhoneInput from 'react-phone-number-input';
import Modal from '../components/Modal';
import checkAuthentication from '../utils/checkAuthentication.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import * as paths from '../constants/paths.js';
import * as storageKeys from '../constants/storageKeys';
import * as validators from '../utils/validators';
import * as errorMessages from '../constants/errorMessages';
import * as fromLabels from '../constants/formLabelTexts.js';
import * as formFieldNames from '../constants/formFieldNames.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

function EditUserProfile() {
  const {
    register,
    watch,
    control,
    trigger,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({ mode: 'onChange' });
  const initialRender = useRef(true);
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);

  // watch password and confirm password field for validation if needed
  const watchPassword = watch(formFieldNames.PASSWORD);

  // Prepoluate form with user profile data
  const location = useLocation();
  const userProfile = location.state || {}; // Use an empty object as a fallback
  // console.log('location.state:', location.state);
  // retrieve userId from ViewUserProfile
  const userId = userProfile.id;

  useEffect(() => {
    // Redirect to login if not authenticated
    checkAuthentication(auth => {
      setIsAuthenticated(auth);

      if (auth) {
        console.log('Authenticated');
        // Redirect to ViewUserProfile if no user profile data is passed in
        console.log('User Profile: ' + userProfile);
        if (!location.state) {
          navigate(paths.VIEW_USER_PROFILE);
        }
        if (userProfile) {
          setValue(formFieldNames.FIRST_NAME, userProfile.first_name);
          setValue(formFieldNames.LAST_NAME, userProfile.last_name);
          setValue(formFieldNames.EMAIL, userProfile.email);
          setValue(formFieldNames.COMPANY, userProfile.company);
          if (Array.isArray(userProfile.interests)) {
            const formattedInterests = userProfile.interests.map(interest => ({
              id: interest.id,
              name: interest.name,
            }));

            setSelectedInterests(formattedInterests);

            // put code here
            const fetchAvailableInterests = async () => {
              try {
                const response = await fetch(`${API_URL}interests/`);

                if (!response.ok) {
                  throw new Error('Failed to fetch interests');
                }
                const data = await response.json();

                const filteredInterests = data.filter(
                  interest => !formattedInterests.some(selected => selected.id === interest.id),
                );
                setAvailableInterests(filteredInterests);
              } catch (error) {
                console.error(error);
              }
            };

            fetchAvailableInterests();
          } else {
            setSelectedInterests([]);
          }
          setValue(formFieldNames.CONTACT_NUMBER, userProfile.contact_number);
        }
      } else {
        console.log('Not authenticated');
        setIsErrorModalOpen(true);
      }
    });
  }, [location.state, navigate]);

  const handlePasswordCheckboxChange = () => {
    setUpdatePassword(!updatePassword);
  };

  const handleInterestChange = e => {
    const interestId = parseInt(e);
    const selectedInterest = availableInterests.find(interest => interest.id === interestId);

    setValue(formFieldNames.INTERESTS, '');
    setError(formFieldNames.INTERESTS, null); // Clear the error message

    // Check if the interest is already selected
    if (!selectedInterests.some(interest => interest.id === interestId)) {
      setSelectedInterests(prevInterests => [...prevInterests, selectedInterest]);
      setAvailableInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    }
  };

  const watchInterest = watch(formFieldNames.INTERESTS);
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

  const handleCancel = () => {
    navigate(paths.VIEW_USER_PROFILE);
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
    const { passwordIsValid, errorKey } = validators.isValidPassword(watch(formFieldNames.PASSWORD));
    trigger(formFieldNames.CONFIRM_PASSWORD); // check confirm password validity when password changes
    return passwordIsValid || errorMessages.PASSWORD_ERROR_MESSAGES[errorKey];
  };

  const handleIsValidConfirmPassword = value => {
    return (
      watch(formFieldNames.CONFIRM_PASSWORD) === watch(formFieldNames.PASSWORD) ||
      errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch
    );
  };

  const handleIsValidInterests = async value => {
    return selectedInterests.length > 0 || errorMessages.INTERESTS_ERROR_MESSAGES.empty;
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      trigger(formFieldNames.INTERESTS);
    }
  }, [selectedInterests]);

  const handleIsValidNumber = async value => {
    return isValidNumber(value) || errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.invalid;
  };

  const toSnakeUpperCase = arr => arr.join('_').toUpperCase();

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
              const snakeUpperCaseWord = toSnakeUpperCase(word);
              if (word[0].toUpperCase() in formFieldNames) {
                // if the first word is a field name, set error message to the field.
                setError(formFieldNames[word[0].toUpperCase()], { message: errorMessageArray[errorMessageIndex] });
              } else if (snakeUpperCaseWord in formFieldNames) {
                // else check if the field name contains more than one word and set error message to the field.
                setError(formFieldNames[snakeUpperCaseWord], { message: errorMessageArray[errorMessageIndex] });
              }
            }
          }
        }
      });
    }
  };

  const handleUpdate = async data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const company = data.company;
    const interests = selectedInterests.map(interest => interest.id);
    const contactNumber = data.contact_number;
    const password = data.password;
    const confirmPassword = data.confirm_password;

    FORM_DATA = new FormData();
    FORM_DATA.append(formFieldNames.FIRST_NAME, firstName);
    FORM_DATA.append(formFieldNames.LAST_NAME, lastName);
    FORM_DATA.append(formFieldNames.EMAIL, email);
    FORM_DATA.append(formFieldNames.COMPANY, company);
    FORM_DATA.append(formFieldNames.INTERESTS, JSON.stringify(interests));
    FORM_DATA.append(formFieldNames.CONTACT_NUMBER, contactNumber);
    if (updatePassword) {
      FORM_DATA.append(formFieldNames.PASSWORD, password);
      FORM_DATA.append(formFieldNames.CONFIRM_PASSWORD, confirmPassword);
    }

    for (let pair of FORM_DATA.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    console.log(updatePassword);

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
        // update interests in local storage
        let interests_name = selectedInterests.map(interest => interest.name).join(' ');
        localStorage.setItem('interests', interests_name);
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal isOpen={isErrorModalOpen}>
        <div
          className='w-[525px] h-[165px] text-center bg-modalError border-4 border-modalErrorBorder'
          data-testid='unsuccessful-modal'
        >
          <h3 className='text-xl font-bold mt-6 mb-2.5'>User not logged in.</h3>
          <p>Please Login to Continue</p>
          <hr className='border border-white my-4 w-full' />
          <button className='font-bold text-md' onClick={() => navigate(paths.LOGIN)}>
            Login
          </button>
        </div>
      </Modal>

      <Modal isOpen={isSuccessModalOpen}>
        <div
          className='w-[525px] h-[165px] text-center bg-modalSuccess border-4 border-modalSuccessBorder'
          data-testid='successful-modal'
        >
          <h3 className='text-xl font-bold mt-6 mb-2.5'>Update was successful!</h3>
          <p>Your provided changes has been updated.</p>
          <hr className='border border-white my-4 w-full' />
          <button className='font-bold text-md' onClick={() => navigate(paths.VIEW_USER_PROFILE)}>
            Continue to View Profile
          </button>
        </div>
      </Modal>

      <div className='h-auto bg-primary sm:p-8 md:p-12 xl:py-16 xl:px-44'>
        <div className='flex h-full'>
          <div className='w-1/2 bg-secondary-100 xl:px-20 xl:py-12 sm:p-8'>
            <h1 className='text-black sm:text-2xl md:text-2xl lg:text-2xl font-semibold font-sans'>
              {Object.keys(errors).length === 0
                ? "Welcome back! Let's update your profile information."
                : 'Uh Oh... There seems to be an issue with your information. Please review and try again.'}
            </h1>
            {Object.values(errors).map((error, index) => (
              <p key={index} className='text-red sm:text-sm lg:text-md lg:mt-8 sm:mt-4'>
                <FontAwesomeIcon icon={faTimes} className='mr-2' size='xl' />
                {error.message}
              </p>
            ))}
          </div>
          {/* Other Half of the Form */}
          <div className='w-1/2 bg-white xl:px-20 xl:py-12 md:p-12 sm:p-8'>
            <h1 className='sm:text-2xl md:text-2xl lg:text-2xl font-semibold font-sans'>Edit User Profile</h1>
            <form onSubmit={handleSubmit(handleUpdate)} className='h-screen'>
              <div className='flex flex-col xl:flex-row space-y-4 xl:space-x-4 lg:space-y-0 lg:space-x-0'>
                <div className='flex flex-col w-full xl:w-1/2'>
                  <label
                    htmlFor={formFieldNames.FIRST_NAME}
                    className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                  >
                    {fromLabels.FIRST_NAME}
                  </label>
                  <Input
                    register={register}
                    type='text'
                    name={formFieldNames.FIRST_NAME}
                    placeholder={fromLabels.FIRST_NAME.slice(0, -1)}
                    isDisabled={false}
                    isRequired={true}
                    requiredErrorMessage={errorMessages.FIRST_NAME_ERROR_MESSAGES.empty}
                    validateInputFunction={handleIsValidFirstName}
                  />
                </div>
                <div className='flex flex-col w-full xl:w-1/2'>
                  <label
                    htmlFor={formFieldNames.LAST_NAME}
                    className='mb-2 text-gray-700 text-sm md:text-md sm:mt-2 md:mt-4'
                  >
                    {fromLabels.LAST_NAME}
                  </label>
                  <Input
                    register={register}
                    type='text'
                    name={formFieldNames.LAST_NAME}
                    placeholder={fromLabels.LAST_NAME.slice(0, -1)}
                    isDisabled={false}
                    isRequired={true}
                    requiredErrorMessage={errorMessages.LAST_NAME_ERROR_MESSAGES.empty}
                    validateInputFunction={handleIsValidLastName}
                  />
                </div>
              </div>
              {/* Email */}
              <div className='flex flex-col'>
                <label htmlFor={formFieldNames.EMAIL} className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'>
                  {fromLabels.EMAIL}
                </label>
                <Input
                  register={register}
                  type='text'
                  name={formFieldNames.EMAIL}
                  placeholder={fromLabels.EMAIL.slice(0, -1)}
                  isDisabled={false}
                  isRequired={true}
                  requiredErrorMessage={errorMessages.EMAIL_ERROR_MESSAGES.empty}
                  validateInputFunction={handleIsValidEmail}
                />
              </div>
              <div className='flex flex-col xl:flex-row space-y-4 xl:space-x-4 lg:space-y-0 lg:space-x-0'>
                <div className='flex flex-col w-full xl:w-1/2'>
                  <label
                    htmlFor={formFieldNames.COMPANY}
                    className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                  >
                    {fromLabels.COMPANY}
                  </label>
                  <Input
                    register={register}
                    type='text'
                    name={formFieldNames.COMPANY}
                    placeholder={fromLabels.COMPANY.slice(0, -1)}
                    isDisabled={false}
                    isRequired={true}
                    requiredErrorMessage={errorMessages.COMPANY_ERROR_MESSAGES.empty}
                  />
                </div>
                <div className='flex flex-col w-full xl:w-1/2'>
                  <label
                    htmlFor={formFieldNames.CONTACT_NUMBER}
                    className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                  >
                    {fromLabels.CONTACT_NUMBER}
                  </label>
                  <Controller
                    control={control}
                    name={formFieldNames.CONTACT_NUMBER}
                    rules={{
                      required: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty,
                      validate: handleIsValidNumber,
                    }}
                    render={({ field }) => (
                      <PhoneInput
                        id={formFieldNames.CONTACT_NUMBER}
                        className={`${formFieldNames.CONTACT_NUMBER} w-auto h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-black text-md`}
                        placeholder='Enter contact number'
                        defaultCountry='SG'
                        international
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className='flex flex-col'>
                <label
                  htmlFor={formFieldNames.INTERESTS}
                  className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                >
                  {fromLabels.INTERESTS}
                </label>
                <div className='flex flex-wrap gap-2 mt-2.5'>
                  {selectedInterests.map(interest => (
                    <div
                      data-testid={interest.name}
                      key={interest.id}
                      className='flex justify-center bg-secondary-300 text-white w-auto p-2 font-medium mb-2.5 rounded-md text-xs md:text-xs lg:text-md'
                    >
                      {/* {interest.name && (
                  <> */}
                      {interest.name}
                      <button
                        className='ml-2 cursor-pointer border-none'
                        onClick={() => handleRemoveInterest(interest.id)}
                      >
                        &#x2715;
                      </button>
                      {/* </>
                )} */}
                    </div>
                  ))}
                </div>

                <Controller
                  control={control}
                  name={formFieldNames.INTERESTS}
                  defaultValue={''}
                  rules={{ validate: handleIsValidInterests }}
                  render={({ field }) => (
                    <select
                      data-testid='select-interest'
                      id={formFieldNames.INTERESTS}
                      className='w-auto h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
                      name={formFieldNames.INTERESTS}
                      placeholder='Interests'
                      onChange={handleInterestChange}
                      value=''
                      {...field}
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
                  )}
                />
              </div>
              <div className='flex flex-row items-center'>
                <input
                  type='checkbox'
                  id='updatePasswordCheckbox'
                  checked={updatePassword}
                  onChange={handlePasswordCheckboxChange}
                  className='mr-2.5 mt-4'
                />
                <label htmlFor='updatePasswordCheckbox' className='text-gray-700 text-sm md:text-md sm:mt-4'>
                  {' '}
                  Change Password?
                </label>
              </div>
              {updatePassword && (
                <div className='flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4'>
                  <div className='flex flex-col w-full xl:w-1/2'>
                    <label
                      htmlFor={formFieldNames.PASSWORD}
                      className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                    >
                      {fromLabels.PASSWORD}
                    </label>
                    <input
                      type='password'
                      id={formFieldNames.PASSWORD}
                      className='w-auto h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
                      name={formFieldNames.PASSWORD}
                      placeholder='Password'
                      disabled={!updatePassword}
                      {...register(formFieldNames.PASSWORD, {
                        validate: updatePassword ? handleIsValidPassword : undefined,
                      })}
                    />
                  </div>
                  <div className='flex flex-col w-full xl:w-1/2'>
                    <label
                      htmlFor={formFieldNames.CONFIRM_PASSWORD}
                      className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-4'
                    >
                      {fromLabels.CONFIRM_PASSWORD}
                    </label>
                    <input
                      type='password'
                      id={formFieldNames.CONFIRM_PASSWORD}
                      className='w-auto h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
                      name={formFieldNames.CONFIRM_PASSWORD}
                      placeholder='Confirm Password'
                      disabled={!updatePassword}
                      {...register(formFieldNames.CONFIRM_PASSWORD, {
                        validate: updatePassword ? handleIsValidConfirmPassword : undefined,
                        required: updatePassword ? errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty : false,
                      })}
                    />
                  </div>
                </div>
              )}
              <div className='flex flex-col space-y-4 mt-4'>
                <Button
                  type='submit'
                  className='bg-secondary-300 text-white border-none cursor-pointer w-auto p-2 text-md'
                >
                  Save
                </Button>
              </div>
              <div className='flex flex-col space-y-4'>
                <Button
                  type='button'
                  className='bg-gray-300 text-black border-none cursor-pointer w-auto p-2 text-md mt-2.5'
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditUserProfile;
