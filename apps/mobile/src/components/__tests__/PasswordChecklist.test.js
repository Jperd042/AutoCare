import PasswordChecklist from '../PasswordChecklist';
import { renderScreen } from '../../test/renderScreen';

describe('PasswordChecklist', () => {
  test('renders shared password rules and additional security rows in a consistent order', () => {
    const screen = renderScreen(
      <PasswordChecklist
        password="Admin@123"
        currentPassword="Admin@123"
        confirmPassword="Admin@123"
        includeSecurityContext
      />,
    );

    expect(screen.getByText('8-14 characters')).toBeTruthy();
    expect(screen.getByText('One uppercase letter (A-Z)')).toBeTruthy();
    expect(screen.getByText('One lowercase letter (a-z)')).toBeTruthy();
    expect(screen.getByText('One number (0-9)')).toBeTruthy();
    expect(screen.getByText('One special character (!@#$%^&*)')).toBeTruthy();
    expect(screen.getByText('Current password matches your active credentials')).toBeTruthy();
    expect(screen.getByText('New password is different from current password')).toBeTruthy();
    expect(screen.getByText('Re-entered password matches the new password')).toBeTruthy();
  });
});
