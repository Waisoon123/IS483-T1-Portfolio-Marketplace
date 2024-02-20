import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { isValidNumber } from 'libphonenumber-js';
import { AuthContext } from '../App.jsx';
import PhoneInput from 'react-phone-number-input';
import styles from './EditUserProfile.module.css';
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

const API_URL = import.meta.env.VITE_API_URL;
let FORM_DATA;

function EditUserProfile() {
  const {
    register,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({ mode: 'onChange' });
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
  console.log('location.state:', location.state);
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

  const validateFirstName = firstName => {
    if (validators.isValidName(firstName)) {
      return true;
    } else {
      return errorMessages.FIRST_NAME_ERROR_MESSAGES.invalid;
    }
  };

  const validateLastName = lastName => {
    if (validators.isValidName(lastName)) {
      return true;
    } else {
      return errorMessages.LAST_NAME_ERROR_MESSAGES.invalid;
    }
  };

  const validateEmail = email => {
    if (validators.isValidEmail(email)) {
      return true;
    } else {
      return errorMessages.EMAIL_ERROR_MESSAGES.invalid;
    }
  };

  const handleInterestChange = e => {
    const interestId = parseInt(e.target.value);
    const selectedInterest = availableInterests.find(interest => interest.id === interestId);

    if (selectedInterest && !selectedInterests.some(interest => interest.id === interestId)) {
      setSelectedInterests(prevInterests => [
        ...prevInterests,
        { id: selectedInterest.id, name: selectedInterest.name },
      ]);
      setAvailableInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    }
  };

  const handleRemoveInterest = interestId => {
    const removedInterest = selectedInterests.find(interest => interest.id === interestId);

    setSelectedInterests(prevInterests => prevInterests.filter(item => item.id !== interestId));
    setAvailableInterests(prevInterests => [...prevInterests, removedInterest]);
  };

  const validateContactNumber = contactNumber => {
    if (isValidNumber(contactNumber)) {
      return true;
    } else {
      return errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.invalid;
    }
  };

  const validatePassword = password => {
    const { passwordIsValid, errorKey } = validators.isValidPassword(password);

    if (!passwordIsValid) {
      return errorMessages.PASSWORD_ERROR_MESSAGES[errorKey];
    }
  };

  const validateConfirmPassword = confirmPassword => {
    console.log(validators.isConfirmPasswordMatch(watchPassword, confirmPassword));
    if (!validators.isConfirmPasswordMatch(watchPassword, confirmPassword)) {
      console.log('watchPassword:', watchPassword);
      console.log('confirmPassword', confirmPassword);
      console.log('E Msg', errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch);
      return errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.notMatch;
    }
  };

  const handleCancel = () => {
    navigate(paths.VIEW_USER_PROFILE);
  };

  const handleBackendErrors = async response => {
    if (response.headers.get('content-type').includes('application/json')) {
      const error = await response.json(); // error = {key: [error message], ...}

      for (let key in error) {
        setError(formFieldNames[key.toUpperCase()], { message: error[key] });
        // also clear confirm password input if the key is password.
        if (key === 'password') {
          setValue(formFieldNames.PASSWORD, '');
          setValue(formFieldNames.CONFIRM_PASSWORD, '');
        }
      }
    }
  };

  const handleUpdate = async data => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email;
    const company = data.company;
    const interests = selectedInterests.map(interest => interest);
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

      console.log('response:', await response);

      if (!response.ok) {
        console.log('response not ok');
        await handleBackendErrors(response);
      } else {
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <Modal isOpen={isErrorModalOpen}>
        <div data-testid='unsuccessful-modal'>
          <p>Please Login to Continue</p>
          <button onClick={() => navigate(paths.LOGIN)}>Login</button>
        </div>
      </Modal>
      <Modal isOpen={isSuccessModalOpen}>
        <div data-testid='successful-modal'>
          <p>Update was successful!</p>
          <button onClick={() => navigate(paths.VIEW_USER_PROFILE)}>Continue to View Profile</button>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(handleUpdate)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor={formFieldNames.FIRST_NAME} className={styles.title}>
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
            validateInputFunction={validateFirstName}
          />
          <p className={styles.errorMsg}>
            {errors[formFieldNames.FIRST_NAME] ? errors[formFieldNames.FIRST_NAME].message : ''}
          </p>
          <label htmlFor={formFieldNames.LAST_NAME} className={styles.title}>
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
            validateInputFunction={validateLastName}
          />
          <p className={styles.errorMsg}>
            {errors[formFieldNames.LAST_NAME] ? errors[formFieldNames.LAST_NAME].message : ''}
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFieldNames.EMAIL} className={styles.title}>
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
            validateInputFunction={validateEmail}
          />
          <p className={styles.errorMsg}>{errors[formFieldNames.EMAIL] ? errors[formFieldNames.EMAIL].message : ''}</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFieldNames.COMPANY} className={styles.title}>
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
          <p className={styles.errorMsg}>
            {errors[formFieldNames.COMPANY] ? errors[formFieldNames.COMPANY].message : ''}
          </p>
        </div>

        <div>
          <label htmlFor={formFieldNames.INTERESTS} className={styles.title}>
            {fromLabels.INTERESTS}
          </label>
          <div className={styles.interestsContainer}>
            {selectedInterests.map(interest => (
              <div data-testid={interest.name} key={interest.id} className={styles.interestBox}>
                {interest.name && (
                  <>
                    {interest.name}
                    <button className={styles.removeInterestBtn} onClick={() => handleRemoveInterest(interest.id)}>
                      &#x2715;
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <select
            id='interests'
            className={styles.input}
            name='interests'
            placeholder='Interests'
            onChange={handleInterestChange}
            value=''
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
          <p className={styles.errorMsg}>
            {errors[formFieldNames.INTERESTS] ? errors[formFieldNames.INTERESTS].message : ''}
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFieldNames.CONTACT_NUMBER} className={styles.title}>
            {fromLabels.CONTACT_NUMBER}
          </label>
          <Controller
            control={control}
            name={formFieldNames.CONTACT_NUMBER}
            rules={{ required: errorMessages.CONTACT_NUMBER_ERROR_MESSAGES.empty, validate: validateContactNumber }}
            render={({ field }) => (
              <PhoneInput
                id={formFieldNames.CONTACT_NUMBER}
                className={`${formFieldNames.CONTACT_NUMBER} ${styles.phoneinput}`}
                placeholder='Enter contact number'
                defaultCountry='SG'
                international
                {...field}
              />
            )}
          />
          <p className={styles.errorMsg}>
            {errors[formFieldNames.CONTACT_NUMBER] ? errors[formFieldNames.CONTACT_NUMBER].message : ''}
          </p>
        </div>

        <div className={styles.field}>
          <input
            type='checkbox'
            id='updatePasswordCheckbox'
            checked={updatePassword}
            onChange={handlePasswordCheckboxChange}
            className={styles.checkbox}
          />
          <label htmlFor='updatePasswordCheckbox' className={styles.title}>
            {' '}
            Update Password
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFieldNames.PASSWORD} className={styles.title}>
            {fromLabels.PASSWORD}
          </label>
          <input
            type='password'
            id={formFieldNames.PASSWORD}
            className={styles.input}
            name={formFieldNames.PASSWORD}
            placeholder='Password'
            disabled={!updatePassword}
            {...register(formFieldNames.PASSWORD, { validate: updatePassword ? validatePassword : undefined })}
          />
          <p className={styles.errorMsg}>
            {errors[formFieldNames.PASSWORD] ? errors[formFieldNames.PASSWORD].message : ''}
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor={formFieldNames.CONFIRM_PASSWORD} className={styles.title}>
            {fromLabels.CONFIRM_PASSWORD}
          </label>
          <input
            type='password'
            id={formFieldNames.CONFIRM_PASSWORD}
            className={styles.input}
            name={formFieldNames.CONFIRM_PASSWORD}
            placeholder='Confirm Password'
            disabled={!updatePassword}
            {...register(formFieldNames.CONFIRM_PASSWORD, {
              required: updatePassword ? errorMessages.CONFIRM_PASSWORD_ERROR_MESSAGES.empty : false,
              validate: updatePassword ? validateConfirmPassword : undefined,
            })}
          />
          <p className={styles.errorMsg}>
            {errors[formFieldNames.CONFIRM_PASSWORD] ? errors[formFieldNames.CONFIRM_PASSWORD].message : ''}
          </p>
        </div>

        <div>
          <Button type='submit' className={styles.cfmButton}>
            Update
          </Button>
        </div>
        <div>
          <Button type='button' className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditUserProfile;
