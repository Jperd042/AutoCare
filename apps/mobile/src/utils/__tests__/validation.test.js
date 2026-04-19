import {
  getChangePasswordChecklistState,
  passwordRequirementItems,
  validateChangePasswordForm,
  validateRegisterForm,
} from '../validation';

describe('validateRegisterForm', () => {
  test('accepts the shortened six-field registration contract', () => {
    expect(
      validateRegisterForm({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        confirmPassword: 'Admin@123',
      }),
    ).toEqual({});
  });

  test('still reports a password mismatch on the shortened contract', () => {
    expect(
      validateRegisterForm({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        confirmPassword: 'Admin@124',
      }),
    ).toEqual({
        confirmPassword: 'Passwords do not match.',
      });
  });

  test('requires a first name on the shortened contract', () => {
    expect(
      validateRegisterForm({
        firstName: '   ',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        confirmPassword: 'Admin@123',
      }),
    ).toEqual({
      firstName: 'Enter your first name.',
    });
  });
});

describe('shared password validation metadata', () => {
  test('exposes the shared password requirement order for consistent app and web rendering', () => {
    expect(passwordRequirementItems).toEqual([
      { key: 'hasValidLength', label: '8-14 characters' },
      { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
      { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
      { key: 'hasNumber', label: 'One number (0-9)' },
      { key: 'hasSpecialCharacter', label: 'One special character (!@#$%^&*)' },
    ]);
  });

  test('returns shared realtime password validation state including current-password and confirm-password checks', () => {
    expect(
      getChangePasswordChecklistState({
        currentPassword: 'Admin@123',
        newPassword: 'Safer@123',
        confirmPassword: 'Safer@123',
        savedPassword: 'Admin@123',
      }),
    ).toEqual({
      requirements: {
        hasValidLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
        hasSpecialCharacter: true,
      },
      currentPasswordMatches: true,
      newPasswordDiffersFromCurrent: true,
      confirmPasswordMatches: true,
    });
  });
});

describe('validateChangePasswordForm', () => {
  test('rejects unchanged passwords and mismatched confirmation', () => {
    expect(
      validateChangePasswordForm({
        currentPassword: 'Admin@123',
        newPassword: 'Admin@123',
        confirmPassword: 'Admin@124',
        savedPassword: 'Admin@123',
      }),
    ).toEqual({
      newPassword: 'New password must be different from current.',
      confirmPassword: 'Passwords do not match.',
    });
  });
});
