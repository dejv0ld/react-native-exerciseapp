import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Touchable,
  Dimensions
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
import { MaterialCommunityIcons } from 'react-native-vector-icons';

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
            <Text style={{ fontSize: 24, marginRight: 0, padding: 7 }}>⋮</Text>
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation, handleMenuPress, sessionId, handleUpdateSets]);

  /////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const loadInitialData = async () => {
      // Retrieve local storage data first
      const storedSetsDataString = await AsyncStorage.getItem('setsData');
      const storedSetsData = storedSetsDataString
        ? JSON.parse(storedSetsDataString)
        : {};

      setSetsData(storedSetsData); // Set local storage data first

      if (sessionData && sessionData.exercises.length > 0) {
        let dbSetsData = {};
        sessionData.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            // Consider what constitutes as empty in your context (here, both must be non-empty)
            if (set.reps !== '' && set.weight !== '') {
              dbSetsData[set.id] = { reps: set.reps, weight: set.weight };
            } else if (storedSetsData[set.id]) {
              // Only override with local storage if DB data is considered 'empty'
              dbSetsData[set.id] = storedSetsData[set.id];
            }
          });
        });

        // Update the state only if necessary to prevent unnecessary re-renders
        setSetsData((prevData) => ({ ...prevData, ...dbSetsData }));
      }
    };

    loadInitialData();
  }, [sessionData]);

  /////////////////////////////////////////////////////////////////////////

  // Update the AsyncStorage whenever the input values change
  useEffect(() => {
    AsyncStorage.setItem('setsData', JSON.stringify(setsData));
  }, [setsData]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => handleMenuPress(sessionId)}>
          <Text style={{ fontSize: 24 }}>⋮</Text>
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

  const handleInputChange = (setId, field, value) => {
    const newSetsData = {
      ...setsData,
      [setId]: {
        ...setsData[setId],
        [field]: value
      }
    };

    setSetsData(newSetsData);
    AsyncStorage.setItem('setsData', JSON.stringify(newSetsData));
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
                      <Text
                        style={{
                          fontSize: 24,
                          marginTop: 13,
                          padding: 7,
                          marginRight: 5
                        }}
                      >
                        ⋮
                      </Text>
                    </MenuTrigger>
                    <MenuOptions
                      customStyles={{
                        optionsContainer: styles.menuOptionsContainer
                      }}
                    >
                      <MenuOption
                        onSelect={() =>
                          handleDeleteExercise(exercise.firestoreId)
                        }
                      >
                        <View style={styles.deleteExerciseBtnContainer}>
                          <Icon
                            style={styles.deleteExerciseIcon}
                            name="trash"
                            type="evilicon"
                            color="red"
                            size={32}
                          />
                          <Text style={styles.deleteExerciseBtn}>Delete</Text>
                        </View>
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
                          handleInputChange(set.id, 'weight', weight)
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
                          handleInputChange(set.id, 'reps', reps)
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
                        color="#3C748B"
                        size={32}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addSetContainer}>
                  <TouchableOpacity
                    onPress={() => handleAddSet(exercise.firestoreId)}
                  >
                    <Text style={styles.addSetText}>Add Set</Text>
                  </TouchableOpacity>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="star"
                      type="evilicon"
                      color="#3C748B"
                      size={32}
                    />
                    <Icon
                      name="chart"
                      type="evilicon"
                      color="#3C748B"
                      size={32}
                    />
                    <MaterialCommunityIcons
                      name="star"
                      color="#3C748B"
                      size={30}
                    />
                    <MaterialCommunityIcons name="chart-box-outline" color="#3C748B" size={30} />
                  </View>
                </View>
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

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  exerciseHeading: {
    marginLeft: windowWidth * 0.07,
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
    alignItems: 'stretch',
    width: windowWidth
  },
  exerciseContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    width: windowWidth,
    margin: windowWidth * 0.01
  },
  setContainer: {
    flexDirection: 'row',
    width: windowWidth,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    margin: windowWidth * 0.02
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: windowWidth * 0.015
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: windowWidth * 0.2,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  repsInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: windowWidth * 0.15,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    width: windowWidth * 0.32,
    height: 40,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16
  },
  setText: {
    textAlign: 'center'
  },
  addButton: {
    borderRadius: 15,
    width: windowWidth * 0.45,
    height: 60,
    marginBottom: windowHeight * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3C748B',
    elevation: 5
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'relative',
    top: windowWidth * 0.05,
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
    marginBottom: windowWidth * 0.03
  },
  inputDescText: {
    fontSize: 11
  },
  addSetText: {
    fontSize: 16,
    color: '#3C748B'
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: '#EBEFF1',
    marginTop: windowWidth * 0.025
  },
  deleteExerciseBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    verticalAlign: 'center'
  },
  deleteExerciseIcon: {
    margin: 6
  },
  deleteExerciseBtn: {
    fontSize: 16,
    color: 'red',
    marginTop: 5
  },
  menuOptionsContainer: {
    width: Dimensions.get('window').width,
    position: 'absolute',
    height: 50
  },
  addSetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: windowWidth * 0.11
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: windowWidth * 0.035
  }
});
