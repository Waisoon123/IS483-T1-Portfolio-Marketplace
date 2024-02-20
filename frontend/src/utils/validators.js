// check if name contains only letters and spaces.
export const isValidName = name => {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(name);
};

export const isValidEmail = email => {
  // Standard email validation regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const isValidPassword = password => {
  // check if password contains at least one number.
  if (!/\d/.test(password)) {
    return { passwordIsValid: false, errorKey: 'number' };
  }
  // check if password contains at least one letter.
  if (!/[A-za-z]/.test(password)) {
    return { passwordIsValid: false, errorKey: 'letter' };
  }
  // check if password contains at least one uppercase letter.
  if (!/[A-Z]/.test(password)) {
    return { passwordIsValid: false, errorKey: 'upperCase' };
  }
  // check if password contains at least one lowercase letter.
  if (!/[a-z]/.test(password)) {
    return { passwordIsValid: false, errorKey: 'lowerCase' };
  }
  // check if password contains at least one special character.
  if (!/[!@#$%^&*()_+]/.test(password)) {
    return { passwordIsValid: false, errorKey: 'special' };
  }
  // check if password is at least 8 characters long.
  if (password.length < 8) {
    return { passwordIsValid: false, errorKey: 'minLength' };
  }
  // If pass the check, the password is considered valid
  return { passwordIsValid: true, errorKey: '' };
};

export const isConfirmPasswordMatch = (password, confirmPassword) => {
  // check if password and confirm password match
  return password === confirmPassword;
};

export const isValidCompany = company => {
  // Check if the company is not blank
  return company !== '';
};

export const isValidInterest = interests => {
  // Check if the interests is not blank
  return interests.length !== 0;
};
