import { render } from '@testing-library/react-native';

export const createNavigation = (overrides = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  ...overrides,
});

export const createRoute = (params = {}) => ({ params });

export const renderScreen = (ui) => render(ui);
