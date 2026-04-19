import { fireEvent } from '@testing-library/react-native';
import ChangePassword from '../ChangePassword';
import { createNavigation, renderScreen } from '../../test/renderScreen';

describe('ChangePassword', () => {
  test('shows the shared realtime validation checklist while entering a new password', () => {
    const navigation = createNavigation();
    const screen = renderScreen(
      <ChangePassword
        navigation={navigation}
        account={{ password: 'Admin@123' }}
        onChangePassword={jest.fn()}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Current Password'), 'Admin@123');
    fireEvent.changeText(screen.getByLabelText('New Password'), 'Stronger@456');
    fireEvent.changeText(screen.getByLabelText('Re-enter Password'), 'Stronger@456');

    expect(screen.getByText('Realtime Validation')).toBeTruthy();
    expect(screen.getByText('Current password matches your active credentials')).toBeTruthy();
    expect(screen.getByText('Re-entered password matches the new password')).toBeTruthy();
  });
});
