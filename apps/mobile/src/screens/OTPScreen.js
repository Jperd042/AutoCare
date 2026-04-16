import { useEffect, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OtpInputGroup from '../components/OtpInputGroup';
import ScreenShell from '../components/ScreenShell';
import { colors, radius } from '../theme';

const RESEND_SECONDS = 17;
const MAX_ATTEMPTS = 3;
const TRANSITION_DELAY_MS = 1400;

const getScreenCopy = (otpPurpose) => {
  if (otpPurpose === 'passwordChange') {
    return {
      title: 'Verify Your Email',
      icon: 'shield-check-outline',
      codeLabel: 'Enter 6-digit code',
      buttonLabel: 'Verify & Change Password',
      buttonIcon: 'shield-check-outline',
      successTitle: 'Verified!',
      successMessage: 'Saving your password...',
    };
  }

  if (otpPurpose === 'register') {
    return {
      title: 'Verify Your Email',
      icon: 'email-outline',
      codeLabel: 'Enter 6-digit code',
      buttonLabel: 'Verify & Create Account',
      buttonIcon: 'account-check-outline',
      successTitle: 'Verified!',
      successMessage: 'Creating your account...',
    };
  }

  if (otpPurpose === 'deleteAccount') {
    return {
      title: 'Confirm Account Deletion',
      icon: 'shield-alert-outline',
      codeLabel: 'Enter 6-digit code',
      buttonLabel: 'Verify & Delete Account',
      buttonIcon: 'delete-outline',
      successTitle: 'Verified!',
      successMessage: 'Completing your request...',
    };
  }

  return {
    title: 'Verify Your Email',
    icon: 'email-outline',
    codeLabel: 'Enter 6-digit code',
    buttonLabel: 'Verify & Sign In',
    buttonIcon: 'login',
    successTitle: 'Verified!',
    successMessage: 'Signing you in...',
  };
};

function AttemptDots({ remainingAttempts, tone = 'default' }) {
  return (
    <View style={styles.attemptDotsRow}>
      {Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
        const isActive = index < remainingAttempts;

        return (
          <View
            key={`attempt-${index + 1}`}
            accessible
            accessibilityLabel={`OTP attempt ${index + 1} ${isActive ? 'active' : 'inactive'}`}
            style={[
              styles.attemptDot,
              tone === 'success' ? styles.attemptDotSuccess : styles.attemptDotDefault,
              !isActive && styles.attemptDotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

export default function OTPScreen({ navigation, route, onVerified }) {
  const [otp, setOtp] = useState('');
  const [screenState, setScreenState] = useState('idle');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
  const transitionTimeoutRef = useRef(null);
  const otpPurpose = route.params?.otpPurpose || 'login';
  const screenCopy = getScreenCopy(otpPurpose);
  const isLocked = screenState === 'success' || screenState === 'exhausted';
  const otpStatus = screenState === 'success' ? 'success' : screenState === 'error' || screenState === 'exhausted' ? 'error' : 'idle';

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const countdownTimer = setInterval(() => {
      setResendCountdown((currentValue) => (currentValue > 0 ? currentValue - 1 : 0));
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [resendCountdown]);

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    },
    [],
  );

  const clearFeedback = () => {
    setFeedbackTitle('');
    setFeedbackMessage('');
    if (screenState === 'error') {
      setScreenState('idle');
    }
  };

  const navigateAfterVerification = (verificationResult) => {
    const nextRoute = verificationResult?.nextRoute || 'Menu';

    if (verificationResult?.resetStack) {
      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      });
      return;
    }

    navigation.navigate(nextRoute);
  };

  const scheduleTransition = (callback) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      callback();
    }, TRANSITION_DELAY_MS);
  };

  const handleVerifyOtp = () => {
    if (isLocked) {
      return;
    }

    if (otp.length !== 6) {
      setScreenState('error');
      setFeedbackTitle('Incomplete Code');
      setFeedbackMessage('Enter the full 6-digit code to continue.');
      return;
    }

    if (otp !== '123456') {
      const nextRemainingAttempts = remainingAttempts - 1;

      setRemainingAttempts(nextRemainingAttempts);
      setOtp('');
      setFeedbackMessage(
        nextRemainingAttempts > 0
          ? `Incorrect code. ${nextRemainingAttempts} attempts remaining.`
          : 'No attempts left. Returning to login.',
      );

      if (nextRemainingAttempts > 0) {
        setScreenState('error');
        setFeedbackTitle('Incorrect Code');
        return;
      }

      setScreenState('exhausted');
      setFeedbackTitle('Too Many Attempts');
      scheduleTransition(() => {
        navigation.navigate('Login');
      });
      return;
    }

    const verificationResult = onVerified?.(route.params) || { status: 'success' };

    if (verificationResult.status === 'error') {
      setScreenState('error');
      setFeedbackTitle(verificationResult.title || 'Verification Failed');
      setFeedbackMessage(verificationResult.message || 'Unable to complete OTP verification.');
      return;
    }

    setScreenState('success');
    setFeedbackTitle('');
    setFeedbackMessage('');
    scheduleTransition(() => navigateAfterVerification(verificationResult));
  };

  const handleResend = () => {
    if (resendCountdown > 0 || isLocked) {
      return;
    }

    setOtp('');
    setScreenState('idle');
    setFeedbackTitle('');
    setFeedbackMessage('');
    setRemainingAttempts(MAX_ATTEMPTS);
    setResendCountdown(RESEND_SECONDS);
  };

  if (screenState === 'success') {
    return (
      <ScreenShell contentContainerStyle={[styles.content, styles.successShell]} scrollEnabled={false}>
        <View style={styles.successState}>
          <View style={styles.successHaloOuter}>
            <View style={styles.successHaloInner}>
              <MaterialCommunityIcons name="check" size={34} color={colors.success} />
            </View>
          </View>
          <Text style={styles.successTitle}>{screenCopy.successTitle}</Text>
          <Text style={styles.successMessage}>{screenCopy.successMessage}</Text>
          <AttemptDots remainingAttempts={MAX_ATTEMPTS} tone="success" />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.mutedText} />
          <Text style={styles.backLinkText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons name={screenCopy.icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.title}>{screenCopy.title}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            We sent a <Text style={styles.messageStrong}>6-digit verification code</Text> to
          </Text>
          <Text style={styles.emailText}>{route.params?.email || 'your email address'}</Text>
          <Text style={styles.messageSubtitle}>Check your inbox and spam folder</Text>
        </View>

        <View style={styles.timerWrap}>
          <View style={styles.timerRing}>
            <Text style={styles.timerText}>
              {String(Math.floor(resendCountdown / 60)).padStart(2, '0')}:
              {String(resendCountdown % 60).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <Text style={styles.codeLabel}>{screenCopy.codeLabel}</Text>

        <OtpInputGroup
          value={otp}
          onChange={(value) => {
            setOtp(value);
            clearFeedback();
          }}
          error=""
          hideHelperText
          hideErrorText
          status={otpStatus}
        />

        {feedbackTitle ? (
          <View
            style={[styles.feedbackCard, styles.feedbackCardError]}
          >
            <View style={styles.feedbackRow}>
              <MaterialCommunityIcons
                name={screenState === 'exhausted' ? 'shield-alert-outline' : 'close-circle-outline'}
                size={18}
                color={colors.danger}
              />
              <View style={styles.feedbackCopy}>
                <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
                <Text style={styles.feedbackMessage}>{feedbackMessage}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, (otp.length !== 6 || isLocked) && styles.primaryButtonDisabled]}
          onPress={handleVerifyOtp}
          activeOpacity={0.88}
          disabled={isLocked}
        >
          <View style={styles.primaryButtonContent}>
            <MaterialCommunityIcons name={screenCopy.buttonIcon} size={18} color={colors.onPrimary} />
            <Text style={styles.primaryButtonText}>{screenCopy.buttonLabel}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendHint}>Didn't receive it? </Text>
          {resendCountdown > 0 ? (
            <Text style={styles.resendCountdown}>Resend in {resendCountdown}s</Text>
          ) : (
            <Text style={styles.resendAction} onPress={handleResend}>
              Resend now
            </Text>
          )}
        </View>

        <AttemptDots remainingAttempts={remainingAttempts} />

        <View style={styles.demoCard}>
          <Text style={styles.demoText}>
            Demo code: <Text style={styles.demoCode}>1 2 3 4 5 6</Text>
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 32,
  },
  successShell: {
    justifyContent: 'center',
  },
  page: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingTop: 18,
    paddingBottom: 24,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backLinkText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 22,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: 18,
  },
  timerWrap: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 24,
  },
  timerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: colors.authPanelInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: '800',
  },
  messageCard: {
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  messageTitle: {
    color: colors.labelText,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  messageStrong: {
    color: colors.text,
    fontWeight: '800',
  },
  emailText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 6,
  },
  messageSubtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  codeLabel: {
    color: colors.labelText,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 18,
  },
  feedbackCard: {
    marginHorizontal: 24,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  feedbackCardError: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  feedbackCopy: {
    flex: 1,
  },
  feedbackTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackMessage: {
    color: '#FF9B9B',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.72,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 18,
  },
  resendHint: {
    color: colors.mutedText,
    fontSize: 15,
  },
  resendCountdown: {
    color: colors.labelText,
    fontSize: 15,
    fontWeight: '700',
  },
  resendAction: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  attemptDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  attemptDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  attemptDotDefault: {
    backgroundColor: colors.primary,
  },
  attemptDotSuccess: {
    backgroundColor: colors.success,
  },
  attemptDotInactive: {
    opacity: 0.26,
  },
  demoCard: {
    marginHorizontal: 24,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: '#20406A',
    backgroundColor: '#0D1A31',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoText: {
    color: '#6FB1FF',
    fontSize: 14,
  },
  demoCode: {
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 2,
  },
  successState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  successHaloOuter: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 209, 136, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(17, 209, 136, 0.46)',
    marginBottom: 24,
  },
  successHaloInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 209, 136, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(17, 209, 136, 0.7)',
  },
  successTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  successMessage: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 22,
  },
});
