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
