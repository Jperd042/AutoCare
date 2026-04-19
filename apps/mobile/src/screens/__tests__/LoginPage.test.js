import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import LoginPage from '../LoginPage';
import RegisterPage from '../RegisterPage';

describe('LoginPage', () => {
  test('prefills the email address from route params', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: { prefilledEmail: 'driver@autocare.com' } };
    const onLoginAccepted = jest.fn();
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={null}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    expect(screen.getByLabelText('Email Address').props.value).toBe('driver@autocare.com');
    expect(screen.getByLabelText('Sign in to your account')).toBeTruthy();
  });

  test('forgot-password link navigates to ForgotPasswordEmail', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: {} };
    const onLoginAccepted = jest.fn();
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={null}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    fireEvent.press(screen.getByText('Forgot password?'));

    expect(navigation.navigate).toHaveBeenCalledWith('ForgotPasswordEmail');
  });

  test('uses the lowered auth header spacing from the shared auth frame', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: {} };
    const onLoginAccepted = jest.fn();
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={null}
        onLoginAccepted={onLoginAccepted}
      />,
    );
    const backLink = screen.getByTestId('auth-frame-back-link');
    const heroBlock = screen.getByTestId('auth-frame-hero');
    const backLinkStyle = StyleSheet.flatten(backLink.props.style);
    const heroStyle = StyleSheet.flatten(heroBlock.props.style);

    expect(backLinkStyle.paddingTop).toBe(28);
    expect(backLinkStyle.paddingBottom).toBe(10);
    expect(heroStyle.paddingTop).toBe(12);
  });

  test('submits valid credentials and navigates to OTP', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: { prefilledEmail: '  DRIVER@autocare.com ' } };
    const onLoginAccepted = jest.fn();
    const registeredAccount = {
      email: 'driver@autocare.com',
      password: 'Admin@123',
    };
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={registeredAccount}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Password'), 'Admin@123');
    fireEvent.press(screen.getByLabelText('Sign in to your account'));

    expect(onLoginAccepted).toHaveBeenCalledWith(registeredAccount);
    expect(navigation.navigate).toHaveBeenCalledWith('OTP', {
      email: 'driver@autocare.com',
      otpPurpose: 'login',
    });
  });

  test('marks the password field invalid when credentials do not match', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: {} };
    const onLoginAccepted = jest.fn();
    const registeredAccount = {
      email: 'driver@autocare.com',
      password: 'Admin@123',
    };
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={registeredAccount}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Email Address'), 'driver@autocare.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Wrong@123');
    fireEvent.press(screen.getByLabelText('Sign in to your account'));

    expect(screen.getByText('Incorrect email address or password.')).toBeTruthy();
    expect(screen.getByLabelText('Password').props.accessibilityState).toMatchObject({ invalid: true });
    expect(onLoginAccepted).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalledWith('OTP', expect.anything());
  });
});

describe('RegisterPage', () => {
  test('shows password validation guidance after an empty-password submit', () => {
    const navigation = { navigate: jest.fn() };
    const onRegister = jest.fn();
    const screen = render(<RegisterPage navigation={navigation} onRegister={onRegister} />);

    fireEvent.changeText(screen.getByLabelText('First Name'), 'Juan');
    fireEvent.changeText(screen.getByLabelText('Last Name'), 'Dela Cruz');
    fireEvent.changeText(screen.getByLabelText('Email Address'), 'juan@email.com');
    fireEvent.changeText(screen.getByLabelText('Phone Number'), '09123456789');
    fireEvent.changeText(screen.getByLabelText('Re-enter Password'), 'Admin@123');

    fireEvent.press(screen.getByLabelText('Create account'));

    expect(screen.getByText('Realtime Validation')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(screen.getByText('8-14 characters')).toBeTruthy();
    expect(onRegister).not.toHaveBeenCalled();
  });
});
