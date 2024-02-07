import React from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Touchable,
  TouchableOpacity
} from 'react-native';
import { useGetExercisesByTypeQuery } from '../../store/api/exercisesApi';
import { useAddExerciseToSessionMutation } from '../../store/api/sessionsApi';

export const ExercisesScreen = ({ route }) => {
  const { bodyPartType, sessionId } = route.params;
  const [addExerciseToSession] = useAddExerciseToSessionMutation();
  const {
    data: exercises,
    isLoading,
    error
  } = useGetExercisesByTypeQuery(bodyPartType);

  const handleSelectExercise = async (exercise) => {
    await addExerciseToSession({ sessionId, exercise });
    // Navigate back or show a success message
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error Occure: {error.toString()}</Text>;

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectExercise(item)}>
      <Text style={styles.item}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={(item, index) => `exercise-${index}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  item: {
    backgroundColor: 'lightgray',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  }
});
