import { useEffect, useState } from 'react';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/i18n';

import TabBar from './src/components/tab-bar';
import Login from './src/screens/login';
import Register from './src/screens/register';
import Settings from './src/screens/settings';
import Profile from './src/screens/profile';
import EditProfile from './src/screens/edit';
import AddAccount from './src/screens/add-account';
import Notifications from './src/screens/notifications';
import Privacy from './src/screens/privacy';
import Data from './src/screens/data';
import Appearance from './src/screens/appearance';
import Chat from './src/screens/chat';
import Help from './src/screens/help';
import About from './src/screens/about';
import { ThemeProvider } from './src/context/theme';
import AuthProvider from './src/context/authprovider';
import { AuthContext } from './src/context/auth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Tabs = () => (
  <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 80 }}>
    <Tab.Screen name="SettingsTab" component={Settings} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150 }}>
          <Stack.Screen name="main" component={Tabs} />
          <Stack.Screen name="profile" component={Profile} />
          <Stack.Screen name="edit" component={EditProfile} />
          <Stack.Screen name="addAccount" component={AddAccount} />
          <Stack.Screen name="notifications" component={Notifications} />
          <Stack.Screen name="privacy" component={Privacy} />
          <Stack.Screen name="data" component={Data} />
          <Stack.Screen name="appearance" component={Appearance} />
          <Stack.Screen name="chat" component={Chat} />
          <Stack.Screen name="help" component={Help} />
          <Stack.Screen name="about" component={About} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="register" component={Register} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
