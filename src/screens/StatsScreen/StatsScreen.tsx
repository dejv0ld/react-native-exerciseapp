import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useGetAllExercisesQuery } from '../../store/api/sessionsApi';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export const StatsScreen = () => {
  const [exerciseName, setExerciseName] = useState('');

  // Fetch all exercises immediately when the component mounts
  const { data: exercises, isFetching, error } = useGetAllExercisesQuery({});

  // Filter exercises based on input and prepare chart data
  const chartData = exercises
    ? exercises
        .filter((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase())
        .map((ex) => ({
          value: ex.sets.reduce((acc, set) => acc + set.weight * set.reps, 0),
          date: new Date(ex.sessionDate),
          label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
          })
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((item) => ({ value: item.value, label: item.label }))
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Progress Over Time</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setExerciseName(text)}
        value={exerciseName}
        placeholder="Exercise name"
      />

      {isFetching ? (
        <View>
          <ActivityIndicator size="large" color="#3C748B" />
          <Text>Synchronizing...</Text>
        </View>
      ) : error ? (
        <Text>Error: {String(error)}</Text>
      ) : chartData && chartData.length > 0 ? (
        <LineChart
          data={chartData}
          isAnimated
          color={'#3C748B'}
          hideDataPoints
          thickness={2}
          yAxisColor="#EBEFF1"
          xAxisColor="#EBEFF1"
          width={windowWidth * 0.8}
        />
      ) : (
        <Text>Please Enter and exercise name</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
    marginBottom: 20,
    borderColor: '#EBEFF1',
    borderRadius: 5
  }
});
