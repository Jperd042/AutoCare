import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import LoginPage from '../LoginPage';

describe('LoginPage premium styling', () => {
  test('centers the auth header copy and renders the orange brand glow', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: {} };
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={null}
        onLoginAccepted={jest.fn()}
      />,
    );

    const heroBlock = screen.getByTestId('auth-frame-hero');
    const glow = screen.getByTestId('auth-frame-brand-glow');
    const titleStyle = StyleSheet.flatten(screen.getByText('Welcome back').props.style);
    const subtitleStyle = StyleSheet.flatten(
      screen.getByText('Sign in to manage your vehicle services.').props.style,
    );

    expect(glow).toBeTruthy();
    expect(StyleSheet.flatten(heroBlock.props.style)).toMatchObject({
      alignItems: 'center',
    });
    expect(titleStyle.textAlign).toBe('center');
    expect(subtitleStyle.textAlign).toBe('center');
  });

  test('uses flat neutral inputs and the exact orange CTA styling', () => {
    const navigation = { navigate: jest.fn() };
    const route = { params: {} };
    const screen = render(
      <LoginPage
        navigation={navigation}
        route={route}
        registeredAccount={null}
        onLoginAccepted={jest.fn()}
      />,
    );

    const emailWrapStyle = StyleSheet.flatten(screen.getByLabelText('Email Address').parent.props.style);
    const passwordWrapStyle = StyleSheet.flatten(screen.getByLabelText('Password').parent.props.style);
    const buttonStyle = StyleSheet.flatten(screen.getByLabelText('Sign in to your account').props.style);

    expect(emailWrapStyle.backgroundColor).toBe('#1E1E1E');
    expect(emailWrapStyle.borderWidth).toBe(0);
    expect(passwordWrapStyle.backgroundColor).toBe('#1E1E1E');
    expect(passwordWrapStyle.borderWidth).toBe(0);
    expect(buttonStyle.backgroundColor).toBe('#FF7A00');
    expect(buttonStyle.shadowColor).toBe('#FF7A00');
    expect(buttonStyle.shadowOpacity).toBeGreaterThan(0.2);
  });
});
