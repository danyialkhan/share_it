/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (Text.defaultProps) {
  Text.defaultProps.allowScaling = false;
} else {
  Text.defaultProps = {};
  Text.defaultProps.allowScaling = false;
}

if (TextInput.defaultProps) {
  TextInput.defaultProps.allowScaling = false;
} else {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowScaling = false;
}

AppRegistry.registerComponent(appName, () => App);
