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
import {
  useAddExerciseToSessionMutation,
  useAddExerciseWithInitialSetToSessionMutation
} from '../../store/api/sessionsApi';
import { useGetSessionByIdQuery } from '../../store/api/sessionsApi';

export const ExercisesScreen = ({ route, navigation }) => {
  const { bodyPartType, sessionId, refetchSession } = route.params;
  const { refetch } = useGetSessionByIdQuery(sessionId);
  const [addExerciseWithInitialSetToSession] =
    useAddExerciseWithInitialSetToSessionMutation();

  const [addExerciseToSession] = useAddExerciseToSessionMutation();

  const {
    data: exercises,
    isLoading,
    error
  } = useGetExercisesByTypeQuery(bodyPartType);

  const handleSelectExercise = async (exercise) => {
    await addExerciseWithInitialSetToSession({ sessionId, exercise });
    // Navigate back or show a success message
    refetch();
    navigation.pop(2);
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
