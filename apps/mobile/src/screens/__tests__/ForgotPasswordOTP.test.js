import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import ForgotPasswordOTP from '../ForgotPasswordOTP';

describe('ForgotPasswordOTP', () => {
  let alertSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    alertSpy.mockRestore();
  });

  const renderScreen = () => {
    const navigation = {
      navigate: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
    };
    const route = {
      params: {
        email: 'jasper@cruiserscrib.com',
      },
    };
    const screen = render(<ForgotPasswordOTP navigation={navigation} route={route} />);

    return { screen, navigation };
  };

  test('shows inline remaining-attempt feedback after an incorrect otp without opening an alert', () => {
    const { screen } = renderScreen();

    fireEvent.changeText(screen.getByLabelText('OTP code input'), '111111');
    fireEvent.press(screen.getByText('Verify & Change Password'));

    expect(screen.getByText('Incorrect Code')).toBeTruthy();
    expect(screen.getByText('Incorrect code. 2 attempts remaining.')).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  test('uses all three attempts and returns the user to login', () => {
    const { screen, navigation } = renderScreen();

    fireEvent.changeText(screen.getByLabelText('OTP code input'), '111111');
    fireEvent.press(screen.getByText('Verify & Change Password'));
    fireEvent.changeText(screen.getByLabelText('OTP code input'), '222222');
    fireEvent.press(screen.getByText('Verify & Change Password'));
    fireEvent.changeText(screen.getByLabelText('OTP code input'), '333333');
    fireEvent.press(screen.getByText('Verify & Change Password'));

    expect(screen.getByText('Too Many Attempts')).toBeTruthy();
    expect(screen.getByText('No attempts left. Returning to login.')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1400);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });

  test('shows a verified success state before navigating to reset password', () => {
    const { screen, navigation } = renderScreen();

    fireEvent.changeText(screen.getByLabelText('OTP code input'), '123456');
    fireEvent.press(screen.getByText('Verify & Change Password'));

    expect(screen.getByText('Verified!')).toBeTruthy();
    expect(screen.getByText('Preparing password reset...')).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1400);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
      email: 'jasper@cruiserscrib.com',
    });
  });

  test('renders the 3-attempt indicator with one active dot removed per incorrect try', () => {
    const { screen } = renderScreen();

    expect(screen.getAllByLabelText(/OTP attempt .* active/)).toHaveLength(3);

    fireEvent.changeText(screen.getByLabelText('OTP code input'), '111111');
    fireEvent.press(screen.getByText('Verify & Change Password'));

    expect(screen.getAllByLabelText(/OTP attempt .* active/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/OTP attempt .* inactive/)).toHaveLength(1);
  });
});
