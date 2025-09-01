// validation.js

// Capitalize each word in a string
export const capitalizeEachWord = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Capitalize names properly (for First Name & Last Name)
export const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Capitalize address (for Address & City)
export const capitalizeAddress = (address) => {
  if (!address) return '';
  return address
    .trim()
    .split(' ')
    .map(word => {
      // Keep numbers as they are, capitalize only letters
      if (/^\d+$/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

// Check if name is valid (capitalized)
export const isValidName = (name) => {
  if (!name || name.trim().length === 0) return false;
  const words = name.trim().split(' ');
  return words.every(word => 
    word.charAt(0) === word.charAt(0).toUpperCase() && 
    word.slice(1) === word.slice(1).toLowerCase()
  );
};

// Check if address/city is valid (not empty and properly capitalized)
export const isValidAddress = (address) => {
  if (!address || address.trim().length === 0) return false;
  const words = address.trim().split(' ');
  return words.every(word => {
    // Numbers can be as they are
    if (/^\d+$/.test(word)) return true;
    // Text should be capitalized
    return word.charAt(0) === word.charAt(0).toUpperCase() && 
           word.slice(1) === word.slice(1).toLowerCase();
  });
};

// Check if mobile number is valid
export const isValidMobile = (mobile) => {
  if (!mobile) return false;
  const mobilePattern = /^[0-9]{10}$/;
  return mobilePattern.test(mobile);
};

// Check if email is valid
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailPattern.test(email);
};

// Complete passenger validation
export const validatePassenger = (passenger) => {
  const errors = {};

  // First Name validation
  if (!isValidName(passenger.FirstName)) {
    errors.FirstName = 'First name is required and each word must start with a capital letter.';
  }

  // Last Name validation
  if (!isValidName(passenger.LastName)) {
    errors.LastName = 'Last name is required and each word must start with a capital letter.';
  }

  // Address validation
  if (!isValidAddress(passenger.AddressLine1)) {
    errors.AddressLine1 = 'Address is required and each word must be properly capitalized.';
  }

  // City validation
  if (!isValidAddress(passenger.City)) {
    errors.City = 'City is required and each word must be properly capitalized.';
  }

  // Contact Number validation
  if (!isValidMobile(passenger.ContactNo)) {
    errors.ContactNo = 'Contact number is required and must be exactly 10 digits.';
  }

  // Email validation
  if (!isValidEmail(passenger.Email)) {
    errors.Email = 'Email is required and must be valid lowercase format.';
  }

  return errors;
};

// Check if passenger is completely valid
export const isPassengerValid = (passenger) => {
  const errors = validatePassenger(passenger);
  return Object.keys(errors).length === 0;
};

export default {
  capitalizeEachWord,
  capitalizeName,
  capitalizeAddress,
  isValidName,
  isValidAddress,
  isValidMobile,
  isValidEmail,
  validatePassenger,
  isPassengerValid
};
