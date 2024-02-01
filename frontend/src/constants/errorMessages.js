// Error messages for form input validation
export const FIRST_NAME_ERROR_MESSAGE = 'First name must contain only letters and spaces.';
export const LAST_NAME_ERROR_MESSAGE = 'Last name must contain only letters and spaces.';
export const INVALID_EMAIL_ERROR_MESSAGE = 'Invalid email format. Please enter a valid email address.';
export const COMPANY_ERROR_MESSAGE = 'Company field cannot be blank. Please enter a valid company name.';
export const INTERESTS_ERROR_MESSAGE = 'Interest field cannot be blank. Please enter at least one interest.';
export const CONTACT_NUMBER_ERROR_MESSAGE = 'Invalid contact number';
export const PASSWORD_ERROR_MESSAGE_DICT = {
  number: 'Password must contain at least 1 number.',
  letter: 'Password must contain at least 1 letter.',
  upperCase: 'Password must contain at least 1 uppercase letter.',
  lowerCase: 'Password must contain at least 1 lowercase letter.',
  special: 'Password must contain at least 1 special character.',
  minLength: 'Password must be at least 8 characters long.',
};
export const CONFIRM_PASSWORD_ERROR_MESSAGE_DICT = {
  notMatch: 'Passwords do not match.',
  empty: 'Please retype your password.',
};

// Error messages for form input validation when input is empty
export const EMPTY_FIRST_NAME_ERROR_MESSAGE = 'First name cannot be empty.';
export const EMPTY_LAST_NAME_ERROR_MESSAGE = 'Last name cannot be empty.';
export const EMPTY_EMAIL_ERROR_MESSAGE = 'Email cannot be empty.';
export const EMPTY_COMPANY_ERROR_MESSAGE = 'Company cannot be empty.';
export const EMPTY_INTERESTS_ERROR_MESSAGE = 'Interests cannot be empty.';
export const EMPTY_CONTACT_NUMBER_ERROR_MESSAGE = 'Contact number cannot be empty.';
export const EMPTY_PASSWORD_ERROR_MESSAGE = 'Password cannot be empty.';
export const EMPTY_CONFIRM_PASSWORD_ERROR_MESSAGE = 'Please retype your password.';
