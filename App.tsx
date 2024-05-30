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
import { StatsScreen } from './src/screens/StatsScreen/StatsScreen';
import { TrainingProgramsScreen } from './src/screens/TrainingPrograms/TrainingProgramsScreen';
import {
  RootStackParamList,
  StatsStackParamList
} from './src/types/navigationType';
import {
  ActionSheetProvider,
  useActionSheet
} from '@expo/react-native-action-sheet';
import { useDeleteSessionMutation } from './src/store/api/sessionsApi';
import { HandleMenuPressProvider } from './src/HandleMenuPressContext';
import { Menu, MenuProvider } from 'react-native-popup-menu';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatsCategoryListScreen from './src/screens/StatsCategoryList/StatsCategoryListScreen';
import ExerciseStatsListScreen from './src/screens/ExerciseStatsList/ExerciseStatsListScreen';
import { CategoryScreen } from './src/screens/CategoryScreen/CategoryScreen';
import CreateExerciseScreen from './src/screens/CreateExerciseScreen/CreateExerciseScreen';

const Tab = createBottomTabNavigator();

// Session stack navigator
const SessionStack = createNativeStackNavigator<RootStackParamList>();
function SessionStackNavigator() {
  return (
    <SessionStack.Navigator>
      <SessionStack.Screen
        name="Exercise Sessions"
        component={TrainingSessions}
      />
      <SessionStack.Screen name="Session Info" component={SessionInfo} />
      <SessionStack.Screen name="BodyPartsList" component={BodyPartsList} />
      <SessionStack.Screen name="ExercisesScreen" component={ExercisesScreen} />
      <SessionStack.Screen name="CreateExerciseScreen" component={CreateExerciseScreen} options={{ title: 'Create Exercise' }} />
    </SessionStack.Navigator>
  );
}

// Stats stack navigator
const StatsStack = createNativeStackNavigator<StatsStackParamList>();
function StatsStackNavigator() {
  return (
    <StatsStack.Navigator>
      <StatsStack.Screen
        name="StatsCategoryList"
        component={StatsCategoryListScreen}
        options={{ title: 'Statistics' }}
      />
      <StatsStack.Screen
        name="StatsScreen"
        component={StatsScreen}
        options={({ route }) => ({ title: route.params.exercise })}
      />
      <StatsStack.Screen
        name="ExerciseStatsListScreen"
        component={ExerciseStatsListScreen}
        options={({ route }) => ({ title: route.params.bodyPart })}
      />
      <StatsStack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={({ route }) => ({ title: route.params.exercise })}
      />
          </StatsStack.Navigator>
  );
}

// Main app component
export default function App() {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <HandleMenuPressProvider>
          <NavigationContainer>
            <MenuProvider>
              <Tab.Navigator
                screenOptions={{
                  tabBarStyle: {
                    backgroundColor: '#EBEFF1',
                    height: 60
                  }
                }}
              >
                <Tab.Screen
                  name="Log"
                  component={SessionStackNavigator}
                  options={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => (
                      <View
                        style={
                          focused ? styles.focusedIcon : styles.unfocusedIcon
                        }
                      >
                        <MaterialCommunityIcons
                          name={
                            focused
                              ? 'clipboard-text-clock'
                              : 'clipboard-text-clock-outline'
                          }
                          size={30}
                          color={focused ? '#3C748B' : color}
                        />
                      </View>
                    ),
                    tabBarLabel: ({ focused, color }) => (
                      <Text
                        style={{
                          color: focused ? '#3C748B' : color,
                          fontSize: 14,
                          marginBottom: 4
                        }}
                      >
                        Log
                      </Text>
                    ),
                    headerShown: false,
                    tabBarStyle: {
                      display: getTabBarVisibility(route) ? 'none' : 'flex',
                      backgroundColor: '#EBEFF1',
                      height: 60
                    }
                  })}
                />
                <Tab.Screen
                  name="Programs"
                  component={TrainingProgramsScreen}
                  options={{
                    tabBarIcon: ({ focused, color }) => (
                      <View
                        style={
                          focused ? styles.focusedIcon : styles.unfocusedIcon
                        }
                      >
                        <MaterialCommunityIcons
                          name={focused ? 'dumbbell' : 'dumbbell'}
                          size={30}
                          color={focused ? '#3C748B' : color}
                        />
                      </View>
                    ),
                    tabBarLabel: ({ focused, color }) => (
                      <Text
                        style={{
                          color: focused ? '#3C748B' : color,
                          fontSize: 14,
                          marginBottom: 4
                        }}
                      >
                        Programs
                      </Text>
                    )
                  }}
                />
                <Tab.Screen
                  name="Stats"
                  component={StatsStackNavigator}
                  options={{
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => (
                      <View
                        style={
                          focused ? styles.focusedIcon : styles.unfocusedIcon
                        }
                      >
                        <MaterialCommunityIcons
                          name={focused ? 'chart-box' : 'chart-box-outline'}
                          size={30}
                          color={focused ? '#3C748B' : color}
                        />
                      </View>
                    ),
                    tabBarLabel: ({ focused, color }) => (
                      <Text
                        style={{
                          color: focused ? '#3C748B' : color,
                          fontSize: 14,
                          marginBottom: 4
                        }}
                      >
                        Stats
                      </Text>
                    )
                  }}
                />
              </Tab.Navigator>
            </MenuProvider>
          </NavigationContainer>
        </HandleMenuPressProvider>
      </ActionSheetProvider>
    </Provider>
  );
}

// Function to hide the tab bar
function getTabBarVisibility(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Exercise Sessions';

  if (routeName === 'Session Info') {
    return true;
  }

  return false;
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  focusedIcon: {
    paddingTop: 5
  },
  unfocusedIcon: {
    paddingTop: 5
  }
});
