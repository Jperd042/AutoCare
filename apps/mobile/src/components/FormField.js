import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  error,
  isFocused,
  onFocus,
  onBlur,
  editable = true,
  helperText,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  textContentType = 'none',
  hideErrorText = false,
  icon,
  containerStyle,
  inputWrapStyle,
  inputFocusStyle,
  inputStyle,
  iconColor,
}) {
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
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={iconColor || colors.mutedText}
            style={styles.leadingIcon}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: !editable, invalid: Boolean(error) }}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.inputMultiline,
            inputStyle,
            !editable && styles.inputReadonlyText,
          ]}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textContentType={textContentType}
          autoCorrect={false}
          selectionColor={colors.primary}
        />
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
    borderWidth: 1,
    borderColor: colors.authInputBorder,
    borderRadius: radius.large,
    backgroundColor: colors.authInput,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    paddingVertical: 15,
    fontSize: 15,
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
    color: colors.mutedText,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputMultiline: {
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  inputReadonlyText: {
    color: colors.mutedText,
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
