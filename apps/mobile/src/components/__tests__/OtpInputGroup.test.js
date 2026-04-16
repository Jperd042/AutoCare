import { fireEvent, render } from '@testing-library/react-native';
import OtpInputGroup from '../OtpInputGroup';
import { colors } from '../../theme';

describe('OtpInputGroup', () => {
  test('configures a single hidden otp controller input for soft-keyboard entry', () => {
    const onChange = jest.fn();
    const screen = render(<OtpInputGroup value="" onChange={onChange} />);

    const hiddenInput = screen.getByLabelText('OTP code input');
    const style = Array.isArray(hiddenInput.props.style)
      ? Object.assign({}, ...hiddenInput.props.style)
      : hiddenInput.props.style;

    expect(hiddenInput.props.keyboardType).toBe('number-pad');
    expect(hiddenInput.props.showSoftInputOnFocus).toBe(true);
    expect(hiddenInput.props.autoComplete).toBe('sms-otp');
    expect(hiddenInput.props.textContentType).toBe('oneTimeCode');
    expect(hiddenInput.props.maxLength).toBe(6);
    expect(style.width).toBe('100%');
    expect(style.height).toBe(56);
    expect(style.position).toBe('absolute');
  });

  test('lets users enter the full code from the hidden controller input', () => {
    const onChange = jest.fn();
    const screen = render(<OtpInputGroup value="" onChange={onChange} />);

    fireEvent.changeText(screen.getByLabelText('OTP code input'), '123456');

    expect(onChange).toHaveBeenLastCalledWith('123456');
  });

  test('applies success styling to the visible otp boxes when requested by the screen state', () => {
    const onChange = jest.fn();
    const screen = render(<OtpInputGroup value="123456" onChange={onChange} status="success" />);
    const box = screen.getByTestId('otp-box-1');
    const style = Array.isArray(box.props.style)
      ? Object.assign({}, ...box.props.style)
      : box.props.style;

    expect(style.borderColor).toBe(colors.success);
  });
});
