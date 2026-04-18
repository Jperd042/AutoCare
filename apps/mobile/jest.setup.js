const mockNativeModules = jest.requireActual('react-native/jest/mocks/NativeModules').default;
const mockUIManager = jest.requireActual('react-native/jest/mocks/UIManager').default;

const turboUIManager = {
  ...mockUIManager,
  clearJSResponder: jest.fn(),
  configureNextLayoutAnimation: jest.fn(),
  getConstants: jest.fn(() => ({})),
  getConstantsForViewManager: jest.fn(() => null),
  lazilyLoadView: jest.fn(() => null),
  measureInWindow: jest.fn(),
  measureLayout: jest.fn(),
  measureLayoutRelativeToParent: jest.fn(),
  setJSResponder: jest.fn(),
  viewIsDescendantOf: jest.fn(),
};

const turboModules = {
  PlatformConstants: mockNativeModules.PlatformConstants,
  UIManager: turboUIManager,
};

mockNativeModules.UIManager = turboUIManager;

if (!global.nativeModuleProxy) {
  global.nativeModuleProxy = mockNativeModules;
}

if (!global.__turboModuleProxy) {
  global.__turboModuleProxy = (name) => turboModules[name] ?? null;
}

if (!global.__fbBatchedBridgeConfig) {
  global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
  };
}

jest.mock('react-native/Libraries/Components/TextInput/TextInput', () =>
  jest.requireActual('react-native/jest/mocks/TextInput'),
);

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');

  const MockModal = ({ children, visible = true, ...props }) => {
    if (visible === false) {
      return null;
    }

    return React.createElement('Modal', props, children);
  };

  MockModal.displayName = 'Modal';

  return {
    __esModule: true,
    default: MockModal,
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');

  return {
    MaterialCommunityIcons: ({ name, ...props }) =>
      React.createElement('MaterialCommunityIcon', props, name),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const createHostComponent = (displayName) => {
    const MockComponent = ({ children, ...props }) =>
      React.createElement(displayName, props, children);

    MockComponent.displayName = displayName;
    return MockComponent;
  };

  const GestureHandlerRootView = createHostComponent('GestureHandlerRootView');
  const GestureHandlerView = createHostComponent('GestureHandlerView');

  return {
    GestureHandlerRootView,
    Swipeable: GestureHandlerView,
    DrawerLayout: GestureHandlerView,
    State: {},
    ScrollView: GestureHandlerView,
    Slider: GestureHandlerView,
    Switch: GestureHandlerView,
    TextInput: GestureHandlerView,
    ToolbarAndroid: GestureHandlerView,
    ViewPagerAndroid: GestureHandlerView,
    DrawerLayoutAndroid: GestureHandlerView,
    WebView: GestureHandlerView,
    NativeViewGestureHandler: GestureHandlerView,
    TapGestureHandler: GestureHandlerView,
    FlingGestureHandler: GestureHandlerView,
    ForceTouchGestureHandler: GestureHandlerView,
    LongPressGestureHandler: GestureHandlerView,
    PanGestureHandler: GestureHandlerView,
    PinchGestureHandler: GestureHandlerView,
    RotationGestureHandler: GestureHandlerView,
    Directions: {},
  };
});
