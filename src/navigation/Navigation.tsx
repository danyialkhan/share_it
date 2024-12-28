import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '../utils/NavigationUtil';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import ReceiveFileScreen from '../screens/ReceiveFileScreen';
import {TCPProvider} from '../service/TCPProvider';
import ConnectionScreen from '../screens/ConnectionScreen';
import SendScreen from '../screens/SendScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import ReceivedFilesScreen from '../screens/ReceivedFilesScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <TCPProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen
            name="ReceiveFileScreen"
            component={ReceiveFileScreen}
          />
          <Stack.Screen name="ConnectionScreen" component={ConnectionScreen} />
          <Stack.Screen name="SendScreen" component={SendScreen} />
          <Stack.Screen name="ReceiveScreen" component={ReceiveScreen} />
          <Stack.Screen
            name="ReceivedFilesScreen"
            component={ReceivedFilesScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TCPProvider>
  );
};

export default Navigation;
