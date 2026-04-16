// ─────────────────────────────────────────────────────────────────────────────
//  Mobile validation — re-exports shared + adds mobile-only form validators
// ─────────────────────────────────────────────────────────────────────────────

// Re-export everything from the shared package
export {
  monthLabels,
  normalizeEmail,
  normalizePhoneNumber,
  buildUsername,
  formatDate,
  formatMonthYear,
  cloneDate,
  calculateAge,
  getPasswordChecks,
  isPasswordValid,
  validateEmail,
  validatePhoneNumber,
  validateBirthday,
  validatePassword,
  validateLoginForm,
} from '@autocare/shared';

// Import validators we need internally for the mobile-only form validators
import {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
} from '@autocare/shared';

// ── Mobile-only form validators ─────────────────────────────────────────────

export const validateRegisterForm = (form) => {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'Enter your first name.';
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Enter your last name.';
  }

  const emailError = validateEmail(form.email);
  if (emailError) {
    errors.email = emailError;
  }

  const phoneError = validatePhoneNumber(form.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  const passwordError = validatePassword(form.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Re-enter your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export const validateProfileForm = (form) => {
  const errors = {};

  const phoneError = validatePhoneNumber(form.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  if (!form.address.trim()) {
    errors.address = 'Enter your address.';
  }

  if (!form.licensePlate.trim()) {
    errors.licensePlate = 'Enter your vehicle plate.';
  }

  if (!form.vehicleModel.trim()) {
    errors.vehicleModel = 'Enter your vehicle make and model.';
  }

  return errors;
};

export const validateResetPasswordForm = (form) => {
  const errors = {};
  const passwordError = validatePassword(form.newPassword);

  if (passwordError) {
    errors.newPassword = passwordError;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Re-enter your new password.';
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export const validateChangePasswordForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
  savedPassword,
}) => {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Enter your current password.';
  } else if (currentPassword !== savedPassword) {
    errors.currentPassword = 'Current password is incorrect.';
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    errors.newPassword = passwordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Re-enter your new password.';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
