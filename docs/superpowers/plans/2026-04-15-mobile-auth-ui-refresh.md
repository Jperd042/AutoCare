# Mobile Auth UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the Expo mobile login and register experience so it matches the approved dark orange reference direction, while simplifying the register form to the six selected fields and keeping the auth flow working end to end.

**Architecture:** Add a small Jest + `jest-expo` test harness for the mobile workspace first, then lock the shortened register contract with tests, then refresh the shared auth presentation layer, and finally rebuild `LoginPage` and `RegisterPage` on top of that shared UI. Keep behavior logic in the existing screen and validation files so the redesign stays focused and does not create a parallel auth system.

**Tech Stack:** Expo 55, React Native 0.83, React Navigation, Jest via `jest-expo`, React Native Testing Library, Android emulator for final visual verification

---

## File Structure

### Existing files to modify

- `apps/mobile/package.json`
  Purpose: add mobile test scripts, dev dependencies, and Jest configuration.
- `apps/mobile/src/utils/validation.js`
  Purpose: remove the old birthday, license plate, and vehicle model requirements from mobile registration validation.
- `apps/mobile/src/theme.js`
  Purpose: expose any additional dark auth tokens needed by the refreshed shell and fields.
- `apps/mobile/src/components/AuthFrame.js`
  Purpose: refresh the branded auth shell to better match the approved reference direction.
- `apps/mobile/src/components/FormField.js`
  Purpose: tighten field spacing and update input chrome for the new auth styling.
- `apps/mobile/src/components/PasswordField.js`
  Purpose: keep password fields visually aligned with the refreshed form fields.
- `apps/mobile/src/components/PasswordChecklist.js`
  Purpose: restyle the password requirements block to match the new register layout.
- `apps/mobile/src/screens/LoginPage.js`
  Purpose: rebuild the login screen on the new shared shell while preserving login and OTP behavior.
- `apps/mobile/src/screens/RegisterPage.js`
  Purpose: simplify the register screen to the approved six-field contract and apply the new inspo-led UI.

### New files to create

- `apps/mobile/jest.setup.js`
  Purpose: Jest setup for Expo mobile tests and icon mocking.
- `apps/mobile/src/test/renderScreen.js`
  Purpose: reusable mobile screen test helper for navigation and route props.
- `apps/mobile/src/utils/__tests__/validation.test.js`
  Purpose: lock the shortened mobile register validator contract.
- `apps/mobile/src/screens/__tests__/RegisterPage.test.js`
  Purpose: lock the simplified register field set and successful account creation behavior.
- `apps/mobile/src/screens/__tests__/LoginPage.test.js`
  Purpose: lock the refreshed login CTA accessibility and forgot-password navigation behavior.

## Task 1: Bootstrap the Mobile Test Harness and Lock the New Register Validator Contract

**Files:**
- Create: `apps/mobile/jest.setup.js`
- Create: `apps/mobile/src/test/renderScreen.js`
- Create: `apps/mobile/src/utils/__tests__/validation.test.js`
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/src/utils/validation.js`

- [ ] **Step 1: Write the failing validator tests**

`apps/mobile/src/utils/__tests__/validation.test.js`

```js
import { validateRegisterForm } from '../validation';

describe('validateRegisterForm', () => {
  test('accepts the shortened six-field registration contract', () => {
    expect(
      validateRegisterForm({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        confirmPassword: 'Admin@123',
      }),
    ).toEqual({});
  });

  test('still reports a password mismatch on the shortened contract', () => {
    expect(
      validateRegisterForm({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        confirmPassword: 'Admin@124',
      }),
    ).toEqual({
      confirmPassword: 'Passwords do not match.',
    });
  });
});
```

- [ ] **Step 2: Run the validator test to verify the project is missing a mobile test harness**

Run:

```bash
npm -w @autocare/mobile run test -- src/utils/__tests__/validation.test.js
```

Expected:
- FAIL because `@autocare/mobile` does not have a `test` script yet.

- [ ] **Step 3: Add Jest and React Native Testing Library to the mobile workspace**

Run from the repository root:

```bash
npm -w @autocare/mobile install -D jest jest-expo @testing-library/react-native
```

Then update `apps/mobile/package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --runInBand"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*))"
    ]
  }
}
```

Create `apps/mobile/jest.setup.js`:

```js
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    MaterialCommunityIcons: ({ name, ...props }) => React.createElement(Text, props, name),
  };
});
```

Create `apps/mobile/src/test/renderScreen.js`:

```js
import { render } from '@testing-library/react-native';

export const createNavigation = (overrides = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  ...overrides,
});

export const createRoute = (params = {}) => ({ params });

export const renderScreen = (ui) => render(ui);
```

- [ ] **Step 4: Run the validator test again to verify it fails for the real behavior**

Run:

```bash
npm -w @autocare/mobile run test -- src/utils/__tests__/validation.test.js
```

Expected:
- FAIL because `validateRegisterForm()` still requires `birthday`, `licensePlate`, and `vehicleModel`.

- [ ] **Step 5: Write the minimal validator implementation**

Update `apps/mobile/src/utils/validation.js` so the register validator only checks the six approved fields:

```js
export const validateRegisterForm = (form) => {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'Enter your first name.';
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Enter your last name.';
  }

  const emailError = validateEmail(form.email);
  if (emailError) {
    errors.email = emailError;
  }

  const phoneError = validatePhoneNumber(form.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  const passwordError = validatePassword(form.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Re-enter your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
```

- [ ] **Step 6: Run the validator test to verify it passes**

Run:

```bash
npm -w @autocare/mobile run test -- src/utils/__tests__/validation.test.js
```

Expected:
- PASS for both validator tests.

- [ ] **Step 7: Commit the harness and validator work**

```bash
git add apps/mobile/package.json apps/mobile/jest.setup.js apps/mobile/src/test/renderScreen.js apps/mobile/src/utils/validation.js apps/mobile/src/utils/__tests__/validation.test.js
git commit -m "test: add mobile auth test harness and register validator coverage"
```

## Task 2: Simplify RegisterPage to the Approved Six-Field Flow

**Files:**
- Create: `apps/mobile/src/screens/__tests__/RegisterPage.test.js`
- Modify: `apps/mobile/src/screens/RegisterPage.js`

- [ ] **Step 1: Write the failing register screen tests**

`apps/mobile/src/screens/__tests__/RegisterPage.test.js`

```js
import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import RegisterPage from '../RegisterPage';
import { createNavigation, renderScreen } from '../../test/renderScreen';

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders only the shortened inspiration-led field set', () => {
    const navigation = createNavigation();
    const onRegister = jest.fn();
    const screen = renderScreen(
      <RegisterPage navigation={navigation} onRegister={onRegister} />,
    );

    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.queryByText('Birthday')).toBeNull();
    expect(screen.queryByText('License Plate')).toBeNull();
    expect(screen.queryByText('Vehicle Make/Model')).toBeNull();
  });

  test('creates an account and returns to login using only the shortened field contract', () => {
    const navigation = createNavigation();
    const onRegister = jest.fn();
    const screen = renderScreen(
      <RegisterPage navigation={navigation} onRegister={onRegister} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Juan'), 'Juan');
    fireEvent.changeText(screen.getByPlaceholderText('Dela Cruz'), 'Dela Cruz');
    fireEvent.changeText(screen.getByPlaceholderText('you@email.com'), 'juan@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('+63 912-345-6789'), '09123456789');
    fireEvent.changeText(screen.getByPlaceholderText('Create a strong password'), 'Admin@123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'Admin@123');

    fireEvent.press(screen.getByText('Create Account'));

    expect(onRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan@email.com',
        phoneNumber: '09123456789',
        password: 'Admin@123',
        username: expect.any(String),
      }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Login', {
      prefilledEmail: 'juan@email.com',
    });
  });
});
```

- [ ] **Step 2: Run the register screen tests to verify they fail**

Run:

```bash
npm -w @autocare/mobile run test -- src/screens/__tests__/RegisterPage.test.js
```

Expected:
- FAIL because `RegisterPage` still renders birthday, license plate, and vehicle model fields.
- FAIL because successful registration still depends on the removed fields.

- [ ] **Step 3: Write the minimal register screen implementation**

Update the initial form state in `apps/mobile/src/screens/RegisterPage.js`:

```js
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
});
```

Update the saved account payload so it only depends on the shortened contract:

```js
const trimmedAccount = {
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: normalizeEmail(form.email),
  phoneNumber: normalizePhoneNumber(form.phoneNumber),
  username: buildUsername(form.email, form.firstName, form.lastName),
  password: form.password,
};
```

Remove the `DatePickerField`, `License Plate`, and `Vehicle Make/Model` blocks entirely so the screen only renders:

```jsx
<View style={styles.nameRow}>
  <FormField ... label="First Name" placeholder="Juan" />
  <FormField ... label="Last Name" placeholder="Dela Cruz" />
</View>

<FormField ... label="Email Address" placeholder="you@email.com" />
<FormField ... label="Phone Number" placeholder="+63 912-345-6789" />
<PasswordField ... label="Password" placeholder="Create a strong password" />
<PasswordChecklist password={form.password} visible={shouldShowPasswordChecklist} />
<PasswordField ... label="Re-enter Password" placeholder="Confirm your password" />
```

- [ ] **Step 4: Run the register screen tests to verify they pass**

Run:

```bash
npm -w @autocare/mobile run test -- src/screens/__tests__/RegisterPage.test.js
```

Expected:
- PASS for both register screen tests.

- [ ] **Step 5: Commit the simplified register flow**

```bash
git add apps/mobile/src/screens/RegisterPage.js apps/mobile/src/screens/__tests__/RegisterPage.test.js
git commit -m "feat: simplify mobile register flow"
```

## Task 3: Refresh the Shared Auth Shell and Rebuild the Login/Register UI

**Files:**
- Create: `apps/mobile/src/screens/__tests__/LoginPage.test.js`
- Modify: `apps/mobile/src/theme.js`
- Modify: `apps/mobile/src/components/AuthFrame.js`
- Modify: `apps/mobile/src/components/FormField.js`
- Modify: `apps/mobile/src/components/PasswordField.js`
- Modify: `apps/mobile/src/components/PasswordChecklist.js`
- Modify: `apps/mobile/src/screens/LoginPage.js`
- Modify: `apps/mobile/src/screens/RegisterPage.js`

- [ ] **Step 1: Write the failing login screen tests**

`apps/mobile/src/screens/__tests__/LoginPage.test.js`

```js
import { fireEvent } from '@testing-library/react-native';
import LoginPage from '../LoginPage';
import { createNavigation, createRoute, renderScreen } from '../../test/renderScreen';
import { radius } from '../../theme';

const registeredAccount = {
  email: 'juan@email.com',
  password: 'Admin@123',
};

describe('LoginPage', () => {
  test('renders an accessible full-width sign-in button with the refreshed auth chrome', () => {
    const navigation = createNavigation();
    const onLoginAccepted = jest.fn();
    const screen = renderScreen(
      <LoginPage
        navigation={navigation}
        route={createRoute()}
        registeredAccount={registeredAccount}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    expect(screen.getByRole('button', { name: 'Sign In' })).toHaveStyle({
      minHeight: 56,
      borderRadius: radius.large,
    });
  });

  test('opens the forgot-password flow from the login screen', () => {
    const navigation = createNavigation();
    const onLoginAccepted = jest.fn();
    const screen = renderScreen(
      <LoginPage
        navigation={navigation}
        route={createRoute()}
        registeredAccount={registeredAccount}
        onLoginAccepted={onLoginAccepted}
      />,
    );

    fireEvent.press(screen.getByText('Forgot password?'));

    expect(navigation.navigate).toHaveBeenCalledWith('ForgotPasswordEmail');
  });
});
```

- [ ] **Step 2: Run the login screen tests to verify they fail**

Run:

```bash
npm -w @autocare/mobile run test -- src/screens/__tests__/LoginPage.test.js
```

Expected:
- FAIL because the current sign-in CTA does not expose the refreshed accessible chrome asserted by the test.

- [ ] **Step 3: Write the minimal shared auth shell implementation**

Extend `apps/mobile/src/theme.js` with a few auth-specific dark tokens:

```js
export const authColors = {
  backdrop: '#0C101A',
  orbSoft: 'rgba(255, 122, 0, 0.08)',
  orbStrong: 'rgba(255, 122, 0, 0.14)',
  ctaGlow: 'rgba(255, 122, 0, 0.32)',
  panelLine: '#22293C',
};
```

Refresh `apps/mobile/src/components/AuthFrame.js` to tighten the shell and hero spacing around the existing brand block:

```js
heroBlock: {
  paddingHorizontal: 24,
  paddingTop: 18,
  paddingBottom: 18,
},
brandBadge: {
  width: 46,
  height: 46,
  borderRadius: 14,
  backgroundColor: colors.primary,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.34,
  shadowRadius: 22,
  elevation: 7,
},
title: {
  color: colors.text,
  fontSize: 22,
  fontWeight: '800',
  lineHeight: 28,
  marginBottom: 8,
},
subtitle: {
  color: colors.mutedText,
  fontSize: 15,
  lineHeight: 23,
},
```

Refresh `apps/mobile/src/components/FormField.js` and `apps/mobile/src/components/PasswordField.js` so both field types share the same darker, cleaner chrome:

```js
container: {
  marginBottom: 18,
},
label: {
  color: colors.labelText,
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 2,
  marginBottom: 9,
  textTransform: 'uppercase',
},
inputWrap: {
  minHeight: 56,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.medium,
  backgroundColor: colors.input,
  paddingHorizontal: 14,
},
inputFocused: {
  borderColor: colors.primary,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 2,
},
```

Refresh `apps/mobile/src/components/PasswordChecklist.js` so the requirement card feels like part of the register form:

```js
container: {
  marginTop: -2,
  marginBottom: 18,
  gap: 10,
  borderWidth: 1,
  borderColor: colors.borderSoft,
  borderRadius: radius.large,
  backgroundColor: colors.surface,
  paddingHorizontal: 16,
  paddingVertical: 16,
},
complete: {
  color: '#7BFFAF',
},
pending: {
  color: colors.mutedText,
},
```

- [ ] **Step 4: Write the minimal login and register screen implementation**

Update `apps/mobile/src/screens/LoginPage.js` so the primary CTA is fully accessible and styled like the approved reference:

```jsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Sign In"
  style={styles.primaryButton}
  onPress={handleLogin}
  activeOpacity={0.88}
>
  <View style={styles.primaryButtonContent}>
    <Text style={styles.primaryButtonText}>Sign In</Text>
    <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimary} />
  </View>
</TouchableOpacity>
```

Use these updated CTA styles in both `LoginPage.js` and `RegisterPage.js`:

```js
primaryButton: {
  backgroundColor: colors.primary,
  borderRadius: radius.large,
  minHeight: 56,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.32,
  shadowRadius: 24,
  elevation: 7,
},
primaryButtonText: {
  color: colors.onPrimary,
  fontSize: 17,
  fontWeight: '800',
},
```

Tighten the screen spacing in `LoginPage.js` and `RegisterPage.js` so they better echo the reference composition:

```js
forgotPasswordLink: {
  alignSelf: 'flex-end',
  marginTop: -4,
  marginBottom: 20,
},
footerRow: {
  marginTop: 20,
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
},
```

Keep the reference-inspired copy intact:

```jsx
<AuthFrame
  title="Welcome back"
  subtitle="Sign in to manage your vehicle services"
  ...
/>
```

```jsx
<AuthFrame
  title="Create Account"
  subtitle="Join and manage your vehicle services"
  ...
/>
```

- [ ] **Step 5: Run the mobile auth tests to verify they pass**

Run:

```bash
npm -w @autocare/mobile run test -- src/screens/__tests__/LoginPage.test.js src/screens/__tests__/RegisterPage.test.js src/utils/__tests__/validation.test.js
```

Expected:
- PASS for all mobile auth tests.

- [ ] **Step 6: Commit the shared auth UI refresh**

```bash
git add apps/mobile/src/theme.js apps/mobile/src/components/AuthFrame.js apps/mobile/src/components/FormField.js apps/mobile/src/components/PasswordField.js apps/mobile/src/components/PasswordChecklist.js apps/mobile/src/screens/LoginPage.js apps/mobile/src/screens/RegisterPage.js apps/mobile/src/screens/__tests__/LoginPage.test.js
git commit -m "feat: refresh mobile auth ui"
```

## Task 4: Verify the Full Mobile Auth Flow in Tests and in the Android Emulator

**Files:**
- Test: `apps/mobile/src/utils/__tests__/validation.test.js`
- Test: `apps/mobile/src/screens/__tests__/RegisterPage.test.js`
- Test: `apps/mobile/src/screens/__tests__/LoginPage.test.js`

- [ ] **Step 1: Run the full mobile test suite**

Run:

```bash
npm -w @autocare/mobile run test
```

Expected:
- PASS for all mobile Jest tests.

- [ ] **Step 2: Start the Android-targeted Expo app**

Run:

```bash
npm -w @autocare/mobile run android
```

Expected:
- Metro starts successfully.
- Expo opens the mobile app on the Android emulator.

- [ ] **Step 3: Manually verify the refreshed login and register flows**

Manual checklist:

- Open the login screen and verify the dark auth shell, orange badge glow, and full-width CTA match the approved reference direction.
- Verify the login screen still shows email, password, forgot-password, and sign-up affordances with clean spacing.
- Enter invalid login credentials and confirm inline field messaging still appears.
- Enter a valid login for the existing prototype account and confirm the app navigates to the OTP screen.
- Open the register screen and verify only six fields are present: first name, last name, email, phone number, password, and confirm password.
- Focus the password field and confirm the password checklist appears and feels visually integrated with the form.
- Submit the register form with a mismatch and confirm the confirm-password error appears.
- Submit a valid register form and confirm success returns to login with the email prefilled.
- Open forgot password and OTP flows and verify the shared shell still looks coherent after the auth-frame refresh.

- [ ] **Step 4: Commit the verified mobile auth refresh**

```bash
git add apps/mobile
git commit -m "feat: ship refreshed mobile auth screens"
```
