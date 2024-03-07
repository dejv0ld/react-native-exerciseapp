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

const SessionStack = createNativeStackNavigator<RootStackParamList>();

function SessionStackNavigator({ navigation }: any) {




  return (
    <SessionStack.Navigator>
      <SessionStack.Screen
        name="Training Sessions"
        component={TrainingSessions}
      />
      <SessionStack.Screen
        name="Session Info"
        component={SessionInfo}
             />
      <SessionStack.Screen name="BodyPartsList" component={BodyPartsList} />
      <SessionStack.Screen name="ExercisesScreen" component={ExercisesScreen} />
    </SessionStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

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
              options={{ headerShown: false }}
            />
          </Tab.Navigator>
          </MenuProvider>
        </NavigationContainer>
        </HandleMenuPressProvider>
      </ActionSheetProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
