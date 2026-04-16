import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthFrame from '../components/AuthFrame';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import { colors, radius } from '../theme';
import { normalizeEmail, validateEmail, validateLoginForm } from '../utils/validation';

export default function LoginPage({ navigation, route, registeredAccount, onLoginAccepted }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Landing');
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (route.params?.prefilledEmail) {
      setForm((currentForm) => ({
        ...currentForm,
        email: route.params.prefilledEmail,
      }));
    }
  }, [route.params?.prefilledEmail]);

  const handleFieldChange = (key, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [key]: '',
    }));
  };

  const handleLogin = () => {
    const nextErrors = validateLoginForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalizedEmail = normalizeEmail(form.email);

    if (
      !registeredAccount ||
      registeredAccount.email !== normalizedEmail ||
      registeredAccount.password !== form.password
    ) {
      setErrors({
        email: '',
        password: 'Incorrect email address or password.',
      });
      return;
    }

    onLoginAccepted(registeredAccount);
    navigation.navigate('OTP', {
      email: normalizedEmail,
      otpPurpose: 'login',
    });
  };

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to manage your vehicle services."
      backLabel="Back to Home"
      onBack={() => navigation.navigate('Landing')}
      centerContent
    >
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
        onBlur={() => {
          setFocusedField('');
          const emailError = validateEmail(form.email);

          if (emailError) {
            setErrors((currentErrors) => ({
              ...currentErrors,
              email: emailError,
            }));
          }
        }}
        textContentType="emailAddress"
        icon="email-outline"
      />

      <PasswordField
        label="Password"
        value={form.password}
        onChangeText={(value) => handleFieldChange('password', value)}
        placeholder="Enter your password"
        error={errors.password}
        isFocused={focusedField === 'password'}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField('')}
        textContentType="password"
      />

      <TouchableOpacity
        style={styles.forgotPasswordLink}
        onPress={() => navigation.navigate('ForgotPasswordEmail')}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Reset your password"
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogin}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Sign in to your account"
      >
        <View pointerEvents="none" style={styles.primaryButtonGlow} />
        <View style={styles.primaryButtonContent}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Create a new account"
        >
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
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
  footerRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: colors.authSecondaryText,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});
