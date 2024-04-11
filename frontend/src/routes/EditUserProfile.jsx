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
import { faEye, faEyeSlash, faBan, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
// added for react-select
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // added for react-select
  const animatedComponents = makeAnimated();

  // Prepoluate form with user profile data
  const location = useLocation();
  const userProfile = location.state || {}; // Use an empty object as a fallback
  // retrieve userId from ViewUserProfile
  const userId = userProfile.id;

  useEffect(() => {
    // Redirect to login if not authenticated
    checkAuthentication(auth => {
      setIsAuthenticated(auth);

      if (auth) {
        // Redirect to ViewUserProfile if no user profile data is passed in
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
              value: interest.id, // Change from 'id' to 'value'
              label: interest.name, // Change from 'name' to 'label'
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

                const interestsData = data.map(interest => {
                  return { value: interest.id, label: interest.name };
                });

                const filteredInterests = interestsData.filter(
                  interest => !selectedInterests.some(selected => selected.value === interest.value),
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
        setIsErrorModalOpen(true);
      }
    });
  }, [location.state, navigate]);

  const handlePasswordCheckboxChange = () => {
    setUpdatePassword(!updatePassword);
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
    const interests = selectedInterests.map(interest => interest.value); // map to interest.value for FormData
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
        <div className='w-[425px] h-[165px] text-center bg-primary border-4 rounded' data-testid='unsuccessful-modal'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'>
            <FontAwesomeIcon className='text-red mr-4' size='xl' icon={faBan} />
            User not logged in.
          </h3>
          <p>Please Login to Continue</p>
          <button
            className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/3 m-auto mt-2 hover:bg-white hover:text-secondary-200'
            onClick={() => navigate(paths.LOGIN)}
          >
            Login
          </button>
        </div>
      </Modal>

      <Modal isOpen={isSuccessModalOpen}>
        <div className='w-[425px] h-[215px] text-center bg-primary border-4 rounded' data-testid='successful-modal'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'>
            <FontAwesomeIcon className='text-secondary-200 mr-4' size='2xl' icon={faThumbsUp} />
            Update was successful!
          </h3>
          <p>Your provided changes has been updated.</p>
          <button
            className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/2 m-auto mt-4 hover:bg-white hover:text-secondary-200'
            onClick={() => navigate(paths.VIEW_USER_PROFILE)}
          >
            Continue to View Profile
          </button>
        </div>
      </Modal>
      <div className='bg-primary'>
        <div className='grid place-items-center sm:w-full md:w-3/4 lg:w-2/3 m-auto lg:py-20 md:py-8 sm:p-8'>
          <div className='flex min-h-auto'>
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
                  <Controller
                    control={control}
                    name={formFieldNames.INTERESTS}
                    rules={{ validate: handleIsValidInterests }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.value}
                        options={availableInterests}
                        onChange={selectedOptions => {
                          field.onChange(selectedOptions);
                          setSelectedInterests(selectedOptions || []);
                        }}
                        value={selectedInterests}
                        isMulti
                        classNamePrefix='select'
                        closeMenuOnSelect={false}
                        isClearable
                        placeholder='Choose interests'
                        noOptionsMessage={() => 'No interests found'}
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
                  <div className='flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4 mt-2.5'>
                    <div className='relative flex-col w-full xl:w-1/2'>
                      <label
                        htmlFor={formFieldNames.PASSWORD}
                        className='mt-2 text-gray-700 text-sm md:text-md sm:mt-4'
                      >
                        {fromLabels.PASSWORD}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id={formFieldNames.PASSWORD}
                        className='w-full p-2.5 border border-secondary-300 mt-2.5 rounded-sm sm:text-sm lg:text-md'
                        name={formFieldNames.PASSWORD}
                        disabled={!updatePassword}
                        {...register(formFieldNames.PASSWORD, {
                          validate: updatePassword ? handleIsValidPassword : undefined,
                        })}
                      />
                      <div
                        className='absolute right-0 pr-3 flex items-center cursor-pointer h-[40px] bottom-0'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEye} className='text-secondary-200' />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} className='text-secondary-200' />
                        )}
                      </div>
                    </div>
                    <div className='relative flex-col w-full xl:w-1/2'>
                      <label
                        htmlFor={formFieldNames.CONFIRM_PASSWORD}
                        className='mt-2 mb-2 text-gray-700 text-sm md:text-md sm:mt-2'
                      >
                        {fromLabels.CONFIRM_PASSWORD}
                      </label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id={formFieldNames.CONFIRM_PASSWORD}
                        className='w-full p-2.5 border border-secondary-300 mt-2.5 rounded-sm sm:text-sm lg:text-md'
                        name={formFieldNames.CONFIRM_PASSWORD}
                        disabled={!updatePassword}
                        {...register(formFieldNames.CONFIRM_PASSWORD, {
                          validate: updatePassword ? handleIsValidConfirmPassword : undefined,
                          required: updatePassword ? errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty : false,
                        })}
                      />
                      <div
                        className='absolute right-0 pr-3 flex items-center cursor-pointer h-[40px] bottom-0'
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
                )}
                <div className='flex flex-col space-y-4 mt-4'>
                  <Button
                    type='submit'
                    className={`cursor-pointer w-auto p-2 text-md ${
                      Object.keys(errors).length > 0
                        ? 'bg-gray-300 text-black cursor-not-allowed'
                        : 'bg-secondary-300 text-white border-none hover:bg-secondary-200'
                    }`}
                    disabled={Object.keys(errors).length > 0}
                  >
                    Save
                  </Button>
                </div>
                <div className='flex flex-col space-y-4'>
                  <Button
                    type='button'
                    className='bg-gray-300 text-black border-none cursor-pointer w-auto p-2 text-md mt-2.5 hover:opacity-65'
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditUserProfile;
