import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import LandingPage from './src/screens/LandingPage';
import LoginPage from './src/screens/LoginPage';
import RegisterPage from './src/screens/RegisterPage';
import OTPScreen from './src/screens/OTPScreen';
import ForgotPasswordEmail from './src/screens/ForgotPasswordEmail';
import ForgotPasswordOTP from './src/screens/ForgotPasswordOTP';
import ResetPassword from './src/screens/ResetPassword';
import Dashboard from './src/screens/Dashboard';
import { colors } from './src/theme';

const Stack = createStackNavigator();

const demoCustomerAccount = {
  id: 'customer-demo-001',
  firstName: 'Jasper',
  lastName: 'Sanchez',
  email: 'jasper@cruiserscrib.com',
  phoneNumber: '09123456789',
  password: 'Admin@123',
  city: 'Quezon City',
  gender: 'Male',
  birthday: new Date(1999, 3, 15),
  address: 'Quezon City, Metro Manila',
};

const customerShortcutRoutes = [
  {
    name: 'BookingScreen',
    params: {
      initialTab: 'notifications',
      bookingMode: 'book',
    },
  },
  {
    name: 'VehicleLifecycleScreen',
    params: {
      initialTab: 'messages',
    },
  },
  {
    name: 'StoreScreen',
    params: {
      initialTab: 'store',
    },
  },
  {
    name: 'InsuranceInquiryScreen',
    params: {
      initialTab: 'menu',
      profileSection: 'insurance',
    },
  },
  {
    name: 'ChatbotScreen',
    params: {
      initialTab: 'explore',
    },
  },
];

export default function App() {
  const [registeredAccount, setRegisteredAccount] = useState(demoCustomerAccount);
  const [activeAccount, setActiveAccount] = useState(null);
  const [pendingOtpAccount, setPendingOtpAccount] = useState(null);

  const handleRegister = (account) => {
    const nextAccount = {
      id: `customer-${Date.now()}`,
      city: 'Quezon City',
      gender: '',
      birthday: null,
      address: 'Quezon City, Metro Manila',
      ...account,
    };

    setRegisteredAccount(nextAccount);
    setActiveAccount(null);
    setPendingOtpAccount(null);
  };

  const handleLoginAccepted = (account) => {
    setPendingOtpAccount(account);
  };

  const handleSignOut = () => {
    setActiveAccount(null);
    setPendingOtpAccount(null);
  };

  const handleSaveProfile = (profileUpdates) => {
    setRegisteredAccount((currentAccount) =>
      currentAccount ? { ...currentAccount, ...profileUpdates } : currentAccount,
    );

    setActiveAccount((currentActiveAccount) =>
      currentActiveAccount ? { ...currentActiveAccount, ...profileUpdates } : currentActiveAccount,
    );
  };

  const handleResetPassword = (nextPassword) => {
    setRegisteredAccount((currentAccount) =>
      currentAccount ? { ...currentAccount, password: nextPassword } : currentAccount,
    );

    setActiveAccount((currentActiveAccount) =>
      currentActiveAccount
        ? { ...currentActiveAccount, password: nextPassword }
        : currentActiveAccount,
    );
  };

  const handleOtpVerified = (routeParams) => {
    const otpPurpose = routeParams?.otpPurpose || 'login';

    if (otpPurpose === 'login') {
      if (!pendingOtpAccount) {
        return {
          status: 'error',
          title: 'Session Expired',
          message: 'Your sign-in session expired. Please try again.',
          nextRoute: 'Login',
          resetStack: true,
        };
      }

      setActiveAccount(pendingOtpAccount);
      setPendingOtpAccount(null);

      return {
        status: 'success',
        nextRoute: 'Dashboard',
        resetStack: true,
      };
    }

    if (otpPurpose === 'passwordChange') {
      if (!activeAccount || !routeParams?.pendingPassword) {
        return {
          status: 'error',
          title: 'Password Update Failed',
          message: 'We could not find the pending password change for this account.',
          nextRoute: 'Dashboard',
          resetStack: true,
        };
      }

      const nextAccount = {
        ...activeAccount,
        password: routeParams.pendingPassword,
      };

      setActiveAccount(nextAccount);
      setRegisteredAccount((currentAccount) =>
        currentAccount?.id === nextAccount.id ? nextAccount : currentAccount,
      );

      return {
        status: 'success',
        nextRoute: 'Dashboard',
        resetStack: true,
      };
    }

    if (otpPurpose === 'deleteAccount') {
      if (!activeAccount) {
        return {
          status: 'error',
          title: 'Account Deletion Failed',
          message: 'We could not find the signed-in account to delete.',
          nextRoute: 'Login',
          resetStack: true,
        };
      }

      const deletedAccountId = activeAccount.id;

      setActiveAccount(null);
      setPendingOtpAccount(null);
      setRegisteredAccount((currentAccount) =>
        currentAccount?.id === deletedAccountId ? null : currentAccount,
      );

      return {
        status: 'success',
        nextRoute: 'Register',
        resetStack: true,
      };
    }

    return {
      status: 'success',
      nextRoute: 'Dashboard',
      resetStack: true,
    };
  };

  const renderLoginScreen = (props) => (
    <LoginPage
      {...props}
      registeredAccount={registeredAccount}
      onLoginAccepted={handleLoginAccepted}
    />
  );

  const renderDashboardScreen = (props) =>
    activeAccount ? (
      <Dashboard
        {...props}
        account={activeAccount}
        onSignOut={handleSignOut}
        onSaveProfile={handleSaveProfile}
      />
    ) : (
      renderLoginScreen(props)
    );

  const renderShortcutScreen = (props, shortcutParams) =>
    activeAccount ? (
      <Dashboard
        {...props}
        route={{
          ...props.route,
          params: {
            ...props.route?.params,
            ...shortcutParams,
          },
        }}
        account={activeAccount}
        onSignOut={handleSignOut}
        onSaveProfile={handleSaveProfile}
      />
    ) : (
      renderLoginScreen(props)
    );

  return (
    <View style={styles.appRoot}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={activeAccount ? 'Dashboard' : 'Login'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Landing" component={LandingPage} />

          <Stack.Screen name="Login">{renderLoginScreen}</Stack.Screen>

          <Stack.Screen name="Register">
            {(props) => <RegisterPage {...props} onRegister={handleRegister} />}
          </Stack.Screen>

          <Stack.Screen name="OTP">
            {(props) => <OTPScreen {...props} onVerified={handleOtpVerified} />}
          </Stack.Screen>

          <Stack.Screen name="ForgotPasswordEmail">
            {(props) => (
              <ForgotPasswordEmail {...props} registeredAccount={registeredAccount} />
            )}
          </Stack.Screen>

          <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTP} />

          <Stack.Screen name="ResetPassword">
            {(props) => <ResetPassword {...props} onResetPassword={handleResetPassword} />}
          </Stack.Screen>

          <Stack.Screen name="Dashboard">{renderDashboardScreen}</Stack.Screen>
          <Stack.Screen name="Menu">{renderDashboardScreen}</Stack.Screen>

          {customerShortcutRoutes.map((shortcutRoute) => (
            <Stack.Screen key={shortcutRoute.name} name={shortcutRoute.name}>
              {(props) => renderShortcutScreen(props, shortcutRoute.params)}
            </Stack.Screen>
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  },
});
