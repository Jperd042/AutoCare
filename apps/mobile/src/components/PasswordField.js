import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../theme';

export default function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  isFocused,
  onFocus,
  onBlur,
  editable = true,
  textContentType = 'password',
  hideErrorText = false,
  containerStyle,
  icon = 'lock-outline',
  inputWrapStyle,
  inputFocusStyle,
  inputStyle,
  toggleButtonStyle,
  iconColor,
  toggleIconColor,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const describedMessage = error || helperText;
  const accessibilityHint = describedMessage
    ? `${error ? 'Error. ' : ''}${describedMessage}`
    : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrap,
          inputWrapStyle,
          isFocused && editable && styles.inputFocused,
          isFocused && editable && inputFocusStyle,
          !editable && styles.inputReadonly,
          error && styles.inputError,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={iconColor || colors.mutedText}
          style={styles.leadingIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: !editable, invalid: Boolean(error) }}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          style={[styles.input, inputStyle, !editable && styles.inputReadonlyText]}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={editable}
          textContentType={textContentType}
          selectionColor={colors.primary}
        />

        <TouchableOpacity
          style={[styles.toggleButton, toggleButtonStyle]}
          onPress={() => setIsVisible((currentValue) => !currentValue)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        >
          <MaterialCommunityIcons
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={toggleIconColor || colors.mutedText}
          />
        </TouchableOpacity>
      </View>

      {error && !hideErrorText ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
      {!error && helperText ? (
        <Text accessibilityLiveRegion="polite" style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    color: colors.authSecondaryText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.authInputBorder,
    borderRadius: radius.large,
    backgroundColor: colors.authInput,
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 3,
  },
  leadingIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 15,
  },
  inputFocused: {
    borderColor: colors.authInputBorderStrong,
    backgroundColor: colors.authInputFocus,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  inputReadonly: {
    backgroundColor: colors.authInputReadonly,
  },
  inputReadonlyText: {
    color: colors.mutedText,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.authPanelInset,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 7,
    lineHeight: 17,
  },
  helperText: {
    color: colors.authSecondaryText,
    fontSize: 12,
    marginTop: 7,
    lineHeight: 17,
  },
});
