import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Touchable
} from 'react-native';
import { Button, Text, Icon } from '@rneui/themed';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  useGetSessionByIdQuery,
  useAddSetToExerciseMutation,
  useDeleteSetFromExerciseMutation,
  useDeleteExerciseAndItsSetsMutation
} from '../../store/api/sessionsApi';
import { DateDisplay } from '../../components/DateDisplay';
import { formatDate } from '../../components/DateDisplay';
import { useHandleMenuPress } from '../../HandleMenuPressContext';
import { useUpdateSetInExerciseMutation } from '../../store/api/sessionsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu';

export const SessionInfo = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const handleMenuPress = useHandleMenuPress();
  const {
    data: sessionData,
    isLoading,
    isError,
    refetch
  } = useGetSessionByIdQuery(sessionId);

  const [addSetToExercise] = useAddSetToExerciseMutation();
  const [deleteSetFromExercise] = useDeleteSetFromExerciseMutation();
  const [localSessionData, setLocalSessionData] = useState(null);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [setsData, setSetsData] = useState({});
  const [updateSetInExercise] = useUpdateSetInExerciseMutation();
  const [deleteExerciseAndItsSets] = useDeleteExerciseAndItsSetsMutation();

  const handleDeleteExercise = async (exerciseId) => {
    await deleteExerciseAndItsSets({ sessionId, exerciseId }).unwrap();
    refetch();
  };

  ////////////////////////////////

  const handleUpdateSets = async () => {
    console.log('setsData:', setsData);
    for (const exercise of sessionData.exercises) {
      for (const set of exercise.sets) {
        console.log('set.id:', set.id);
        if (setsData[set.id]) {
          console.log('set to update:', setsData[set.id]);
          await updateSetInExercise({
            sessionId,
            exerciseId: exercise.firestoreId,
            setId: set.id,
            updatedSet: setsData[set.id]
          }).unwrap();
        }
      }
    }

    // Refetch the session data after updating the sets
    refetch();
  };

  // Step 3: Add a button in the header that calls this function when pressed
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleUpdateSets}>
            <Text style={{ fontSize: 24, marginRight: 20 }}>End</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMenuPress(sessionId)}>
            <Text style={{ fontSize: 24, marginRight: 0 }}>⋮</Text>
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation, handleMenuPress, sessionId, handleUpdateSets]);

  ///////////////////////////////

  useEffect(() => {
    const loadFromStorage = async () => {
      const storedSetsData = await AsyncStorage.getItem('setsData');
      if (storedSetsData) {
        setSetsData(JSON.parse(storedSetsData));
      }
    };

    loadFromStorage();
  }, []);

  // Update the AsyncStorage whenever the input values change
  useEffect(() => {
    AsyncStorage.setItem('setsData', JSON.stringify(setsData));
  }, [setsData]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => handleMenuPress(sessionId)}>
          <Text style={{ fontSize: 24, marginRight: 10 }}>⋮</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, handleMenuPress, sessionId]);

  useLayoutEffect(() => {
    if (sessionData && sessionData.date) {
      const formattedDate = formatDate(sessionData.date);
      navigation.setOptions({ title: formattedDate });
    }
  }, [sessionData, navigation]);

  useEffect(() => {
    if (!isLoading && (isError || !sessionData)) {
      // Navigate back to the previous screen if the session does not exist
      navigation.goBack();
    } else {
      setLocalSessionData(sessionData);
    }
  }, [sessionData, isError, isLoading, navigation]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError || !sessionData) {
    return <Text>Error fetching session data</Text>;
  }

  //Navigate to the BodyPartsList screen
  const handleNavigateToBodyParts = () => {
    navigation.navigate('BodyPartsList', { sessionId: sessionData.id });
  };

  //Add a new set to the exercise
  const handleAddSet = async (exerciseId) => {
    const newSet = { reps: '', weight: '' };
    await addSetToExercise({ sessionId, exerciseId, set: newSet }).unwrap();

    refetch();
  };

  //Delete a set from the exercise
  const handleDeleteSet = async (sessionId, exerciseId, setId) => {
    await deleteSetFromExercise({ sessionId, exerciseId, setId }).unwrap();
    // Handle success or error here, such as showing a notification or refreshing data
    refetch();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {sessionData.exercises &&
        [...sessionData.exercises]
          .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB;
          })
          .map((exercise, eIndex) => {
            const sortedSets = [...exercise.sets].sort((a, b) => {
              const dateA = new Date(a.timestamp).getTime();
              const dateB = new Date(b.timestamp).getTime();
              return dateA - dateB;
            });

            return (
              <View key={eIndex} style={styles.exerciseContainer}>
                <View style={styles.exerciseTitleContainer}>
                  <Text style={styles.exerciseHeading}>{exercise.name}</Text>
                  <Menu>
                    <MenuTrigger>
                      <Text style={{ fontSize: 24, marginTop: 13 }}>⋮</Text>
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() =>
                          handleDeleteExercise(exercise.firestoreId)
                        }
                      >
                        <Text style={{ color: 'red' }}>Delete</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
                {sortedSets.map((set, sIndex) => (
                  <View key={sIndex} style={styles.setContainer}>
                    <View style={styles.setNumberContainer}>
                      <Text style={styles.setNumberText}>{sIndex + 1}</Text>
                    </View>
                    <View style={styles.inputLabelContainer}>
                      <Text style={styles.inputDescText}>Weight</Text>
                      <TextInput
                        style={styles.weightInput}
                        keyboardType="numeric"
                        value={setsData[set.id]?.weight || ''}
                        onChangeText={(weight) =>
                          setSetsData((prev) => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], weight }
                          }))
                        }
                      />
                    </View>
                    <View style={styles.inputLabelContainer}>
                      <Text style={styles.inputDescText}>Reps</Text>
                      <TextInput
                        style={styles.repsInput}
                        keyboardType="numeric"
                        value={setsData[set.id]?.reps || ''}
                        onChangeText={(reps) =>
                          setSetsData((prev) => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], reps }
                          }))
                        }
                      />
                    </View>
                    <View style={styles.inputLabelContainer}>
                      <Text style={styles.inputDescText}>Notes</Text>
                      <TextInput
                        style={styles.noteInput}
                        keyboardType="default"
                        value={setsData[set.id]?.notes || ''}
                        onChangeText={(notes) =>
                          setSetsData((prev) => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], notes }
                          }))
                        }
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteSet(sessionId, exercise.firestoreId, set.id)
                      }
                    >
                      <Icon
                        style={styles.deleteIcon}
                        name="trash"
                        type="evilicon"
                        color="black"
                        size={32}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => handleAddSet(exercise.firestoreId)}
                >
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
                <View style={styles.lineStyle} />
              </View>
            );
          })}
      <Button
        onPress={handleNavigateToBodyParts}
        buttonStyle={styles.addButton}
        titleStyle={styles.addButtonText}
        containerStyle={styles.addExerciseBtn}
      >
        + Add Exercise
      </Button>
    </ScrollView>
  );
};

// Styles remain the same

const styles = StyleSheet.create({
  exerciseHeading: {
    marginLeft: 27,
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold'
  },
  exerciseTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15
  },
  setNumberContainer: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 8
  },
  setNumberText: {
    color: 'black'
  },
  container: {
    backgroundColor: 'white',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  exerciseContainer: {},
  setContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    margin: 10
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 5
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: 70,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  repsInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: 60,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: 100,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  setText: {
    width: 50,
    textAlign: 'center'
  },
  addButton: {
    borderRadius: 15,
    width: 160,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3C748B'
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'relative',
    top: 20,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  DateDisplay: {
    marginTop: 20,
    marginRight: 10,
    marginBottom: 30,
    marginLeft: 40
  },
  deleteText: {
    color: 'red',
    marginLeft: 5
  },
  deleteIcon: {
    marginLeft: 10,
    marginBottom: 10
  },
  inputDescText: {
    fontSize: 11
  },
  addSetText: {
    marginLeft: 42,
    fontSize: 16,
    color: '#3C748B'
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: '#EBEFF1',
    marginTop: 10
  }
});
