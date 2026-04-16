import { ScrollView, StyleSheet } from 'react-native';
import Dashboard from '../Dashboard';
import { createNavigation, createRoute, renderScreen } from '../../test/renderScreen';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style }) => React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({
      top: 24,
      right: 0,
      bottom: 0,
      left: 0,
    }),
  };
});

const account = {
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

describe('Dashboard', () => {
  test('opens the insurance section when route params request it', () => {
    const screen = renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'menu',
          profileSection: 'insurance',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByText('Insurance Tools')).toBeTruthy();
  });

  test('adds the Android top safe area to sub-screen content so back buttons stay tappable', () => {
    const screen = renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'menu',
          initialMenuScreen: 'personal',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    const scrollView = screen.UNSAFE_getByType(ScrollView);
    const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);

    expect(contentStyle.paddingTop).toBe(42);
  });
});
