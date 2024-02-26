import React, { useState, useEffect } from 'react';
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
  useDeleteSetFromExerciseMutation
} from '../../store/api/sessionsApi';
import { DateDisplay } from '../../components/DateDisplay';

export const SessionInfo = ({ route, navigation }) => {
  const { sessionId } = route.params;

  const {
    data: sessionData,
    isLoading,
    isError,
    refetch
  } = useGetSessionByIdQuery(sessionId);
  const [addSetToExercise] = useAddSetToExerciseMutation();
  const [deleteSetFromExercise] = useDeleteSetFromExerciseMutation();
  const [localSessionData, setLocalSessionData] = useState(null);

  useEffect(() => {
    setLocalSessionData(sessionData);
  }, [sessionData]);

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

  const handleSetChange = (eIndex, sIndex, field, value) => {
    let newSessionData = { ...localSessionData };
    newSessionData.exercises[eIndex].sets[sIndex][field] = value;
    setLocalSessionData(newSessionData);
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
              <Text h4>{exercise.name}</Text>
              {exercise.sets.map((set, sIndex) => (
                <View key={sIndex} style={styles.setContainer}>
                  <Text style={styles.setText}>Set {sIndex + 1}</Text>
                  <View style={styles.inputLabelContainer}>
                    <Text>Reps</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(value) =>
                        handleSetChange(eIndex, sIndex, 'reps', value)
                      }
                      value={set.reps.toString()}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputLabelContainer}>
                    <Text>Weight</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(value) =>
                        handleSetChange(eIndex, sIndex, 'weight', value)
                      }
                      value={set.weight.toString()}
                      keyboardType="numeric"
                    />
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
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  exerciseContainer: {},
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 5
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 10
  },
  input: {
    borderWidth: 1,
    width: 60,
    textAlign: 'center',
    marginTop: 5
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
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
