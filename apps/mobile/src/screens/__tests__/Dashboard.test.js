import { fireEvent, screen } from '@testing-library/react-native';
import { ScrollView, StyleSheet } from 'react-native';
import Dashboard from '../Dashboard';
import { createNavigation, createRoute, renderScreen } from '../../test/renderScreen';
import * as bookingCalendar from '../../utils/bookingCalendar';
const actualBookingCalendar = jest.requireActual('../../utils/bookingCalendar');

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
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-19T08:00:00.000Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

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

  test('keeps rendering after the account name changes from settings', () => {
    const navigation = createNavigation();
    const route = createRoute({
      initialTab: 'explore',
    });
    const { rerender, getByText } = renderScreen(
      <Dashboard
        account={account}
        navigation={navigation}
        route={route}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    rerender(
      <Dashboard
        account={{
          ...account,
          firstName: 'Renan',
          lastName: 'Castro',
        }}
        navigation={navigation}
        route={route}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(getByText('Renan Castro')).toBeTruthy();
  });

  test('keeps rendering when a saved profile only has a single-word name', () => {
    const screen = renderScreen(
      <Dashboard
        account={{
          ...account,
          firstName: 'Renan',
          lastName: '',
        }}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'explore',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByText('Renan')).toBeTruthy();
    expect(screen.queryByText(/dela Cruz/)).toBeNull();
  });

  test('shows a month calendar and allows moving to the next visible month inside the 30-day window', () => {
    renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'notifications',
          bookingMode: 'book',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByText('April 2026')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Go to next booking month'));

    expect(screen.getByText('May 2026')).toBeTruthy();
    expect(screen.getByLabelText('Select May 1, 2026')).toBeTruthy();
  });

  test('falls back to the next open booking day when the selected day becomes closed', () => {
    const firstBookingDates = actualBookingCalendar.buildBookingDates(new Date('2026-04-19T12:00:00.000Z'));
    const secondBookingDates = actualBookingCalendar.buildBookingDates(new Date('2026-04-19T12:00:00.000Z')).map(
      (date) => ({
        ...date,
      }),
    );
    const closedSelectedDate = secondBookingDates.find((date) => date.key === '2026-04-19');

    closedSelectedDate.isOpen = false;
    closedSelectedDate.isSelectable = false;

    const buildBookingDatesSpy = jest.spyOn(bookingCalendar, 'buildBookingDates');
    buildBookingDatesSpy.mockImplementation(() => firstBookingDates);

    const { rerender } = renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'notifications',
          bookingMode: 'book',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Select Apr 19, 2026').props.accessibilityState.selected).toBe(true);

    buildBookingDatesSpy.mockImplementation(() => secondBookingDates);

    rerender(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'notifications',
          bookingMode: 'book',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Select Apr 20, 2026').props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Select Apr 19, 2026').props.accessibilityState.selected).toBe(false);
  });

  test('shows a dedicated empty state when the booking window has no open dates', () => {
    const closedDates = actualBookingCalendar.buildBookingDates(new Date('2026-04-19T12:00:00.000Z')).map((date) => ({
      ...date,
      isOpen: false,
      isSelectable: false,
    }));

    jest.spyOn(bookingCalendar, 'buildBookingDates').mockReturnValue(closedDates);

    renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'notifications',
          bookingMode: 'book',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    expect(screen.getByText('No booking dates are available')).toBeTruthy();
    expect(screen.getByText('The booking calendar is fully closed for the current 30-day window.')).toBeTruthy();
    expect(screen.getByText('Confirm Booking').parent.parent.props.accessibilityState.disabled).toBe(true);
  });

  test('resets the selected slot when the user switches to another date', () => {
    renderScreen(
      <Dashboard
        account={account}
        navigation={createNavigation()}
        route={createRoute({
          initialTab: 'notifications',
          bookingMode: 'book',
        })}
        onSignOut={jest.fn()}
        onSaveProfile={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Select 10:00 AM slot'));

    expect(screen.getByLabelText('Select 10:00 AM slot').props.accessibilityState.selected).toBe(true);

    fireEvent.press(screen.getByLabelText('Select Apr 29, 2026'));

    expect(screen.getByLabelText('Select 10:00 AM slot').props.accessibilityState.selected).toBe(false);
    expect(screen.getByLabelText('Select 8:00 AM slot').props.accessibilityState.selected).toBe(true);
  });
});
