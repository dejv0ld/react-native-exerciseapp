import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useGetExercisesByTypeQuery } from '../../store/api/exercisesApi';
import { RouteProp } from '@react-navigation/native';
import { StatsStackParamList } from '../../types/navigationType';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ExerciseStatsListScreenRouteProp = RouteProp<
  StatsStackParamList,
  'ExerciseStatsListScreen'
>;

type ExerciseStatsListScreenNavigationProp = NativeStackNavigationProp<
  StatsStackParamList,
  'ExerciseStatsListScreen'
>;

type Props = {
  route: ExerciseStatsListScreenRouteProp;
  navigation: ExerciseStatsListScreenNavigationProp;
};

const ExerciseStatsListScreen: React.FC<Props> = ({ route, navigation }) => {
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
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CategoryScreen', { exercise: item.name })
      }
    >
      <View style={styles.item}>
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
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
    flex: 1,
    backgroundColor: 'white'
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
