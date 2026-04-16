import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { getPasswordChecks } from '../utils/validation';

const checklistItems = [
  { key: 'hasValidLength', label: '8-14 characters' },
  { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
  { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
  { key: 'hasNumber', label: 'One number (0-9)' },
  { key: 'hasSpecialCharacter', label: 'One special character (!@#$%^&*)' },
];

export default function PasswordChecklist({
  password,
  visible = true,
  title = 'Password Requirements',
}) {
  if (!visible) {
    return null;
  }

  const checks = getPasswordChecks(password);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {checklistItems.map((item) => {
        const isComplete = checks[item.key];

        return (
          <View key={item.key} style={styles.row}>
            <View style={[styles.iconWrap, isComplete && styles.iconWrapComplete]}>
              <MaterialCommunityIcons
                name={isComplete ? 'check' : 'minus'}
                size={12}
                color={isComplete ? colors.onPrimary : colors.mutedText}
              />
            </View>
            <Text style={[styles.label, isComplete ? styles.complete : styles.pending]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 18,
    gap: 9,
    borderWidth: 1,
    borderColor: colors.authPanelBorder,
    borderRadius: radius.large,
    backgroundColor: colors.authPanel,
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    color: colors.authSecondaryText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.authInputBorder,
    backgroundColor: colors.authPanelInset,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapComplete: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  complete: {
    color: colors.text,
  },
  pending: {
    color: colors.authSecondaryText,
  },
});
