// ─────────────────────────────────────────────────────────────────────────────
//  @autocare/shared — Validation utilities
//  Shared between Web and Mobile apps.
// ─────────────────────────────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^09\d{9}$/;

export const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const normalizePhoneNumber = (value) => value.replace(/\D/g, '').slice(0, 11);

export const buildUsername = (email, firstName, lastName) => {
  const emailLocalPart = normalizeEmail(email).split('@')[0]?.replace(/[^a-z0-9._-]/gi, '');

  if (emailLocalPart) {
    return emailLocalPart.toLowerCase();
  }

  return `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/[^a-z.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
};

export const formatDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }

  return `${monthLabels[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`;
};

export const formatMonthYear = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }

  return `${monthLabels[value.getMonth()]} ${value.getFullYear()}`;
};

export const cloneDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
};

export const calculateAge = (birthday) => {
  if (!(birthday instanceof Date) || Number.isNaN(birthday.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    age -= 1;
  }

  return age;
};

export const getPasswordChecks = (password) => {
  const value = password || '';

  return {
    hasValidLength: value.length >= 8 && value.length <= 14,
    hasUppercase: /[A-Z]/.test(value),
    hasLowercase: /[a-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecialCharacter: /[^A-Za-z0-9]/.test(value),
  };
};

export const isPasswordValid = (password) => {
  const checks = getPasswordChecks(password);
  return Object.values(checks).every(Boolean);
};

export const validateEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return 'Enter your email address.';
  }

  if (!emailRegex.test(normalizedEmail)) {
    return 'Enter a valid email address.';
  }

  return '';
};

export const validatePhoneNumber = (phoneNumber) => {
  const digits = normalizePhoneNumber(phoneNumber);

  if (!digits) {
    return 'Enter your phone number.';
  }

  if (!phoneRegex.test(digits)) {
    return 'Use an 11-digit PH mobile number starting with 09.';
  }

  return '';
};

export const validateBirthday = (birthday) => {
  if (!(birthday instanceof Date) || Number.isNaN(birthday.getTime())) {
    return 'Select your birthday.';
  }

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (birthday > normalizedToday) {
    return 'Birthday cannot be in the future.';
  }

  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Enter your password.';
  }

  if (!isPasswordValid(password)) {
    return 'Use 8-14 characters with uppercase, lowercase, number, and special character.';
  }

  return '';
};

export const validateLoginForm = (form) => {
  const errors = {};
  const emailError = validateEmail(form.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!form.password) {
    errors.password = 'Enter your password.';
  }

  return errors;
};
