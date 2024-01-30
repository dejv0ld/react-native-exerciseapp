import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Logg"
            component={SessionStackNavigator}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
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
