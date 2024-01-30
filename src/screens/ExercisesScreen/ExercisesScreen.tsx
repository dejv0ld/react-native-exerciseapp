import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useGetExercisesByTypeQuery } from '../../store/api/exercisesApi';

export const ExercisesScreen = ({ route }) => {
  const { bodyPartType } = route.params;
  const {
    data: exercises,
    isLoading,
    error
  } = useGetExercisesByTypeQuery(bodyPartType);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error Occure: {error.toString()}</Text>;

  const renderItem = ({ item }) => <Text style={styles.item}>{item.name}</Text>;

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
