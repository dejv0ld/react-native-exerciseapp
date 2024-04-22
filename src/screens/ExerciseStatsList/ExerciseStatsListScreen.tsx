import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGetExercisesByTypeQuery } from '../../store/api/exercisesApi';
import { RouteProp } from '@react-navigation/native';
import { StatsStackParamList } from '../../types/navigationType';

type ExerciseStatsListScreenRouteProp = RouteProp<
  StatsStackParamList,
  'ExerciseStatsListScreen'
>;

type Props = {
  route: ExerciseStatsListScreenRouteProp;
};

const ExerciseStatsListScreen: React.FC<Props> = ({ route }) => {
  
  const { bodyPart } = route.params;
  const {
    data: exercises,
    isLoading,
    error,
    isError
  } = useGetExercisesByTypeQuery(bodyPart);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Error loading exercises</Text>;
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
    padding: 10
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});


export default ExerciseStatsListScreen;
