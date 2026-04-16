import { useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme';

const OTP_LENGTH = 6;

export default function OtpInputGroup({
  value,
  onChange,
  error,
  helperText,
  hideHelperText = false,
  hideErrorText = false,
  status = 'idle',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const otpBoxWidth = Math.min(Math.max(screenWidth * 0.12, 44), 52);
  const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
  const digits = useMemo(
    () => sanitizedValue.padEnd(OTP_LENGTH, ' ').split('').map((item) => item.trim()),
    [sanitizedValue],
  );
  const highlightedIndex = sanitizedValue.length >= OTP_LENGTH ? OTP_LENGTH - 1 : sanitizedValue.length;

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleChangeText = (inputValue) => {
    onChange(inputValue.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH));
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={focusInput}
        accessibilityRole="button"
        accessibilityLabel="Enter OTP code"
        style={styles.inputShell}
      >
        <View pointerEvents="none" style={styles.row}>
          {digits.map((digit, index) => {
            const shouldHighlight = isFocused && index === highlightedIndex;
            const isFilled = Boolean(digit);

            return (
              <View
                key={`otp-${index}`}
                testID={`otp-box-${index + 1}`}
                style={[
                  styles.input,
                  { width: otpBoxWidth },
                  isFilled && styles.inputFilled,
                  shouldHighlight && styles.inputFocused,
                  status === 'error' && styles.inputError,
                  status === 'success' && styles.inputSuccess,
                ]}
              >
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={sanitizedValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          autoFocus
          showSoftInputOnFocus
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          importantForAutofill="yes"
          contextMenuHidden={false}
          caretHidden
          selectionColor={colors.primary}
          accessibilityLabel="OTP code input"
          style={styles.controllerInput}
        />
      </Pressable>

      {error && !hideErrorText ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && helperText && !hideHelperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputShell: {
    position: 'relative',
    minHeight: 56,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  controllerInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 56,
    opacity: 0.01,
    color: 'transparent',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 2,
  },
  inputFilled: {
    borderColor: colors.authInputBorderStrong,
    backgroundColor: colors.authInputFocus,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  inputSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  digitText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
