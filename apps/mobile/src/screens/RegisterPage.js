import { Alert, BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AuthFrame from '../components/AuthFrame';
import FormField from '../components/FormField';
import PasswordChecklist from '../components/PasswordChecklist';
import PasswordField from '../components/PasswordField';
import { colors, radius } from '../theme';
import {
  buildUsername,
  normalizeEmail,
  normalizePhoneNumber,
  validateRegisterForm,
} from '../utils/validation';
import { useEffect, useState } from 'react';

export default function RegisterPage({ navigation, onRegister }) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Login');
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});
  const shouldShowPasswordChecklist =
    focusedField === 'password' || form.password.length > 0 || Boolean(errors.password);

  const handleFieldChange = (key, value) => {
    let nextValue = value;

    if (key === 'phoneNumber') {
      nextValue = normalizePhoneNumber(value);
    }

    setForm((currentForm) => ({
      ...currentForm,
      [key]: nextValue,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [key]: '',
    }));
  };

  const handleRegister = () => {
    const nextErrors = validateRegisterForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const trimmedAccount = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: normalizeEmail(form.email),
      phoneNumber: normalizePhoneNumber(form.phoneNumber),
      username: buildUsername(form.email, form.firstName, form.lastName),
      password: form.password,
    };

    onRegister(trimmedAccount);
    Alert.alert('Registered Successfully', 'Your AutoCare account is ready to use.');
    navigation.navigate('Login', {
      prefilledEmail: trimmedAccount.email,
    });
  };

  return (
    <AuthFrame
      title="Create Account"
      subtitle="Join and manage your vehicle services."
      backLabel="Back to Login"
      onBack={() => navigation.navigate('Login')}
      contentContainerStyle={styles.content}
      cardStyle={styles.card}
    >
      <View style={styles.nameRow}>
        <FormField
          label="First Name"
          value={form.firstName}
          onChangeText={(value) => handleFieldChange('firstName', value)}
          placeholder="Juan"
          autoCapitalize="words"
          error={errors.firstName}
          isFocused={focusedField === 'firstName'}
          onFocus={() => setFocusedField('firstName')}
          onBlur={() => setFocusedField('')}
          textContentType="givenName"
          icon="account-outline"
          containerStyle={styles.nameField}
        />

        <FormField
          label="Last Name"
          value={form.lastName}
          onChangeText={(value) => handleFieldChange('lastName', value)}
          placeholder="Dela Cruz"
          autoCapitalize="words"
          error={errors.lastName}
          isFocused={focusedField === 'lastName'}
          onFocus={() => setFocusedField('lastName')}
          onBlur={() => setFocusedField('')}
          textContentType="familyName"
          icon="account-outline"
          containerStyle={styles.nameField}
        />
      </View>

      <FormField
        label="Email Address"
        value={form.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        isFocused={focusedField === 'email'}
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField('')}
        textContentType="emailAddress"
        icon="email-outline"
      />

      <FormField
        label="Phone Number"
        value={form.phoneNumber}
        onChangeText={(value) => handleFieldChange('phoneNumber', value)}
        placeholder="09123456789"
        keyboardType="phone-pad"
        autoCapitalize="none"
        error={errors.phoneNumber}
        helperText="Use an 11-digit PH mobile number starting with 09."
        isFocused={focusedField === 'phoneNumber'}
        onFocus={() => setFocusedField('phoneNumber')}
        onBlur={() => setFocusedField('')}
        maxLength={11}
        textContentType="telephoneNumber"
        icon="phone-outline"
      />

      <PasswordField
        label="Password"
        value={form.password}
        onChangeText={(value) => handleFieldChange('password', value)}
        placeholder="Create a strong password"
        error={errors.password}
        isFocused={focusedField === 'password'}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField('')}
        textContentType="newPassword"
      />

      <PasswordChecklist password={form.password} visible={shouldShowPasswordChecklist} />

      <PasswordField
        label="Re-enter Password"
        value={form.confirmPassword}
        onChangeText={(value) => handleFieldChange('confirmPassword', value)}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        isFocused={focusedField === 'confirmPassword'}
        onFocus={() => setFocusedField('confirmPassword')}
        onBlur={() => setFocusedField('')}
        textContentType="password"
      />

      <Text style={styles.footerText}>
        By registering, you agree to our{' '}
        <Text style={styles.footerLink} onPress={() => Alert.alert('Terms of Service', 'Prototype link opened.')}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={styles.footerLink} onPress={() => Alert.alert('Privacy Policy', 'Prototype link opened.')}>
          Privacy Policy
        </Text>
        .
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleRegister}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Create account"
      >
        <View pointerEvents="none" style={styles.primaryButtonGlow} />
        <View style={styles.primaryButtonContent}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>

      <View style={styles.signInRow}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Return to sign in"
        >
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Platform.OS === 'web' ? 28 : 42,
  },
  card: {
    maxWidth: 560,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  nameField: {
    flex: 1,
  },
  footerText: {
    color: colors.authSecondaryText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '800',
  },
  primaryButton: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.large,
    minHeight: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.authCtaEdge,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.authCtaGlow,
    opacity: 0.3,
  },
  primaryButtonContent: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  signInRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    color: colors.authSecondaryText,
    fontSize: 14,
  },
  signInLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});
