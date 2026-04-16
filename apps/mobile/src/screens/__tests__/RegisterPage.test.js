import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('does not render the legacy birthday and vehicle fields', () => {
    const navigation = { navigate: jest.fn() };
    const onRegister = jest.fn();
    const screen = render(<RegisterPage navigation={navigation} onRegister={onRegister} />);

    expect(screen.queryByText('Birthday')).toBeNull();
    expect(screen.queryByText('License Plate')).toBeNull();
    expect(screen.queryByText('Vehicle Make/Model')).toBeNull();
    expect(screen.queryByPlaceholderText('Select your birthday')).toBeNull();
    expect(screen.queryByPlaceholderText('ABC 1234')).toBeNull();
    expect(screen.queryByPlaceholderText('Toyota Vios')).toBeNull();
  });

  test('submits the shortened account payload and returns to login', () => {
    const navigation = { navigate: jest.fn() };
    const onRegister = jest.fn();
    const screen = render(<RegisterPage navigation={navigation} onRegister={onRegister} />);

    fireEvent.changeText(screen.getByPlaceholderText('Juan'), ' Juan ');
    fireEvent.changeText(screen.getByPlaceholderText('Dela Cruz'), ' Dela Cruz ');
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), '  JUAN@email.com ');
    fireEvent.changeText(screen.getByPlaceholderText('09123456789'), '0912-345-6789');
    fireEvent.changeText(screen.getByPlaceholderText('Create a strong password'), 'Admin@123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'Admin@123');

    fireEvent.press(screen.getByLabelText('Create account'));

    expect(onRegister).toHaveBeenCalledWith({
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan@email.com',
      phoneNumber: '09123456789',
      username: 'juan',
      password: 'Admin@123',
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Registered Successfully',
      'Your AutoCare account is ready to use.',
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Login', {
      prefilledEmail: 'juan@email.com',
    });
  });

  test('blocks submit when the phone number is invalid', () => {
    const navigation = { navigate: jest.fn() };
    const onRegister = jest.fn();
    const screen = render(<RegisterPage navigation={navigation} onRegister={onRegister} />);

    fireEvent.changeText(screen.getByPlaceholderText('Juan'), 'Juan');
    fireEvent.changeText(screen.getByPlaceholderText('Dela Cruz'), 'Dela Cruz');
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), 'juan@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('09123456789'), '12345');
    fireEvent.changeText(screen.getByPlaceholderText('Create a strong password'), 'Admin@123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'Admin@123');

    fireEvent.press(screen.getByLabelText('Create account'));

    expect(screen.getByText('Use an 11-digit PH mobile number starting with 09.')).toBeTruthy();
    expect(onRegister).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
