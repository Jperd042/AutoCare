import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => {
  const React = require('react');

  const createStackNavigator = () => {
    const Screen = () => null;
    const Navigator = ({ initialRouteName, children }) => {
      const childArray = React.Children.toArray(children);
      const activeChild =
        childArray.find((child) => child.props.name === initialRouteName) ?? childArray[0];

      if (!activeChild) {
        return null;
      }

      const navigation = {
        navigate: jest.fn(),
        reset: jest.fn(),
        goBack: jest.fn(),
      };
      const route = { name: activeChild.props.name, params: {} };
      const renderedScreen =
        typeof activeChild.props.children === 'function'
          ? activeChild.props.children({ navigation, route })
          : activeChild.props.children;

      return React.createElement(React.Fragment, null, renderedScreen);
    };

    return { Navigator, Screen };
  };

  return { createStackNavigator };
});

describe('App', () => {
  test('boots into the customer login flow instead of the admin portal', () => {
    const screen = render(<App />);

    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.queryByText('Admin Access Portal')).toBeNull();
  });
});
