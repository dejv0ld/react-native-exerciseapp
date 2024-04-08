import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button } from '@rneui/base';
import TrainingSessions from './src/screens/TrainingSessions/TrainingSessions';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionInfo } from './src/screens/SessionInfo/SessionInfo';
import { BodyPartsList } from './src/screens/BodyPartsList/BodyPartsList';
import { ExercisesScreen } from './src/screens/ExercisesScreen/ExercisesScreen';
import { RootStackParamList } from './src/types/navigationType';
import {
  ActionSheetProvider,
  useActionSheet
} from '@expo/react-native-action-sheet';
import { useDeleteSessionMutation } from './src/store/api/sessionsApi';
import { HandleMenuPressProvider } from './src/HandleMenuPressContext';
import { Menu, MenuProvider } from 'react-native-popup-menu';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const SessionStack = createNativeStackNavigator<RootStackParamList>();

function SessionStackNavigator() {
  return (
    <SessionStack.Navigator>
      <SessionStack.Screen
        name="Training Sessions"
        component={TrainingSessions}
      />
      <SessionStack.Screen name="Session Info" component={SessionInfo} />
      <SessionStack.Screen name="BodyPartsList" component={BodyPartsList} />
      <SessionStack.Screen name="ExercisesScreen" component={ExercisesScreen} />
    </SessionStack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <HandleMenuPressProvider>
          <NavigationContainer>
            <MenuProvider>
              <Tab.Navigator>
                <Tab.Screen
                  name="Logg"
                  component={SessionStackNavigator}
                  options={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                      display: getTabBarVisibility(route) ? 'none' : 'flex'
                    } // Use tabBarStyle to hide/show the tab bar
                  })}
                />
                {/* Define other Tab.Screens if needed*/}
              </Tab.Navigator>
            </MenuProvider>
          </NavigationContainer>
        </HandleMenuPressProvider>
      </ActionSheetProvider>
    </Provider>
  );
}

function getTabBarVisibility(route: any) {
  let routeName = 'Training Sessions';

  if (route.state) {
    routeName =
      getFocusedRouteNameFromRoute(route.state.routes[route.state.index]) ??
      'Training Sessions';
  }

  return !(routeName === 'Session Info'); // Returns true if routeName is NOT 'Session Info'
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
