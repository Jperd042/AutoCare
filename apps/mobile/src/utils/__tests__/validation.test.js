import { validateRegisterForm } from '../validation';

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
