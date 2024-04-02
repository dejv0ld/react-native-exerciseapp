import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Touchable
} from 'react-native';
import { Button, Text } from '@rneui/themed';
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

  useEffect(() => {
    if (sessionData) {
      const initialSetsData = {};
      for (const exercise of sessionData.exercises) {
        for (const set of exercise.sets) {
          initialSetsData[set.id] = { reps: set.reps, weight: set.weight };
        }
      }
      setSetsData(initialSetsData);
    }
  }, [sessionData]);
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
            <Text style={{ fontSize: 24, marginRight: 10 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMenuPress(sessionId)}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>⋮</Text>
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
      <Text>Session Info</Text>
      <DateDisplay dateString={sessionData.date} />
      {sessionData.exercises &&
        [...sessionData.exercises] //sort by timestamp
          .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB;
          })
          .map((exercise, eIndex) => (
            <View key={eIndex} style={styles.exerciseContainer}>
              <View style={styles.exerciseTitleContainer}>
                <Text h4>{exercise.name}</Text>
                <Menu>
                  <MenuTrigger>
                    <Text style={{ fontSize: 24 }}>⋮</Text>
                  </MenuTrigger>
                  <MenuOptions>
                    {/* Step 3: Add a delete option that calls handleDeleteExercise */}
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
              {exercise.sets.map((set, sIndex) => (
                <View key={sIndex} style={styles.setContainer}>
                  <View style={styles.setNumberContainer}>
                    <Text style={styles.setNumberText}>{sIndex + 1}</Text>
                  </View>
                  <View style={styles.inputLabelContainer}>
                    <Text>Weight</Text>
                    <TextInput
                      style={styles.weightInput}
                      keyboardType="numeric"
                      value={setsData[set.id]?.weight.toString() || ''}
                      onChangeText={(weight) =>
                        setSetsData((prev) => ({
                          ...prev,
                          [set.id]: { ...prev[set.id], weight }
                        }))
                      }
                    />
                  </View>
                  <View style={styles.inputLabelContainer}>
                    <Text>Reps</Text>
                    <TextInput
                      style={styles.repsInput}
                      keyboardType="numeric"
                      value={setsData[set.id]?.reps.toString() || ''}
                      onChangeText={(reps) =>
                        setSetsData((prev) => ({
                          ...prev,
                          [set.id]: { ...prev[set.id], reps }
                        }))
                      }
                    />
                  </View>
                  <View style={styles.inputLabelContainer}>
                    <Text>Notes</Text>
                    <TextInput style={styles.noteInput}></TextInput>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteSet(sessionId, exercise.firestoreId, set.id)
                    }
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => handleAddSet(exercise.firestoreId)}
              >
                <Text>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}
      <Button
        onPress={handleNavigateToBodyParts}
        buttonStyle={styles.addButton}
        titleStyle={styles.addButtonText}
        containerStyle={styles.addExerciseBtn}
      >
        + Lägg till övning
      </Button>
    </ScrollView>
  );
};

// Styles remain the same

const styles = StyleSheet.create({
  exerciseTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 0
  },
  setNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  setNumberText: {
    color: '#fff'
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 20,
    backgroundColor: '#fff'
  },
  exerciseContainer: { marginBottom: 15 },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginVertical: 5
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 10
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 70,
    textAlign: 'center',
    marginTop: 5,
    borderRadius: 3
  },
  repsInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    width: 50,
    textAlign: 'center',
    marginTop: 5
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    width: 100,
    marginTop: 5
  },
  setText: {
    width: 50,
    textAlign: 'center'
  },
  addSetButton: {
    padding: 5,
    borderRadius: 5,

    marginTop: 10
  },
  addButton: {
    borderRadius: 15,
    width: 160,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 40,
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
