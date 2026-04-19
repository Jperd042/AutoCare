import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import {
  getChangePasswordChecklistState,
  getPasswordChecks,
  passwordRequirementItems,
} from '../utils/validation';

function ChecklistRow({ label, met }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, met ? styles.iconWrapComplete : styles.iconWrapPending]}>
        <MaterialCommunityIcons
          name={met ? 'check-circle' : 'checkbox-blank-circle-outline'}
          size={14}
          color={met ? colors.success : colors.mutedText}
        />
      </View>
      <Text style={[styles.label, met ? styles.complete : styles.pending]}>{label}</Text>
    </View>
  );
}

export default function PasswordChecklist({
  password,
  currentPassword = '',
  confirmPassword = '',
  savedPassword = '',
  visible = true,
  title = 'Realtime Validation',
  includeSecurityContext = false,
}) {
  if (!visible) {
    return null;
  }

  const requirements = includeSecurityContext
    ? getChangePasswordChecklistState({
        currentPassword,
        newPassword: password,
        confirmPassword,
        savedPassword,
      })
    : {
        requirements: getPasswordChecks(password),
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {passwordRequirementItems.map((item) => (
        <ChecklistRow
          key={item.key}
          label={item.label}
          met={requirements.requirements[item.key]}
        />
      ))}

      {includeSecurityContext ? (
        <>
          <ChecklistRow
            label="Current password matches your active credentials"
            met={requirements.currentPasswordMatches}
          />
          <ChecklistRow
            label="New password is different from current password"
            met={requirements.newPasswordDiffersFromCurrent}
          />
          <ChecklistRow
            label="Re-entered password matches the new password"
            met={requirements.confirmPasswordMatches}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.authPanelBorder,
    borderRadius: radius.large,
    backgroundColor: colors.authPanel,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    color: colors.authSecondaryText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapComplete: {
    backgroundColor: colors.successSoft,
  },
  iconWrapPending: {
    backgroundColor: colors.authPanelInset,
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  complete: {
    color: colors.text,
  },
  pending: {
    color: colors.authSecondaryText,
  },
});
