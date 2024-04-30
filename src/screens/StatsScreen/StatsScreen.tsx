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
import { StatsStackParamList } from '../../types/navigationType';
import { RouteProp } from '@react-navigation/native';

type StatsScreenRouteProp = RouteProp<StatsStackParamList, 'StatsScreen'>;

type Props = {
  route: StatsScreenRouteProp;
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const StatsScreen: React.FC<Props> = ({ route }) => {
  const { exercise } = route.params;

  // Fetch all exercises immediately when the component mounts
  const { data: exercises, isFetching, error } = useGetAllExercisesQuery({});

  // Filter exercises based on input and prepare chart data
  const chartData = exercises
    ? exercises
        .filter((ex) => ex.name.toLowerCase() === exercise.toLowerCase())
        .map((ex) => {
          switch (route.params.category) {
            case 'Volume':
              return {
                value: ex.sets.reduce(
                  (acc, set) => acc + Number(set.weight) * set.reps,
                  0
                ),
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };
            case 'Max Weight':
              return {
                value: Math.max(...ex.sets.map((set) => Number(set.weight))),
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };
            case 'Average Weight':
              console.log('Sets:', ex.sets);
              if (ex.sets && ex.sets.length > 0) {
                const totalWeight = ex.sets.reduce((acc, set) => {
                  console.log('Set:', set);
                  return acc + (Number(set.weight) || 0);
                }, 0);
                const averageWeight = totalWeight / ex.sets.length;
                return {
                  value: averageWeight,
                  date: new Date(ex.sessionDate),
                  label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit'
                  })
                };
              } else {
                return {
                  value: 0,
                  date: new Date(),
                  label: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit'
                  })
                };
              }
            case 'Number of Sets':
              return {
                value: ex.sets.length,
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };
            case 'Number of Reps':
              return {
                value: ex.sets.reduce((acc, set) => acc + Number(set.reps), 0),
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };
            case 'Reps per Set':
              console.log('Processing Reps per Set for exercise:', ex.name);
              if (ex.sets && ex.sets.length > 0) {
                const setsWithReps = ex.sets.filter((set) => {
                  const hasReps =
                    set.reps !== undefined &&
                    set.reps !== null &&
                    !isNaN(Number(set.reps));
                  console.log(
                    `Checking set: ${JSON.stringify(set)}, hasReps: ${hasReps}`
                  );
                  return hasReps;
                });
                console.log('Filtered sets with reps:', setsWithReps);
                if (setsWithReps.length > 0) {
                  const totalReps = setsWithReps.reduce((acc, set) => {
                    const reps = Number(set.reps); // Ensure conversion to Number
                    console.log(
                      `Accumulating reps, current set: ${JSON.stringify(
                        set
                      )}, converted reps: ${reps}`
                    );
                    return acc + reps;
                  }, 0);
                  const averageReps = totalReps / setsWithReps.length;
                  console.log(
                    `Total reps: ${totalReps}, Average: ${averageReps}`
                  );
                  return {
                    value: averageReps,
                    date: new Date(ex.sessionDate),
                    label: new Date(ex.sessionDate).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: '2-digit'
                      }
                    )
                  };
                } else {
                  console.log('No valid sets found for averaging reps.');
                  return {
                    value: 0,
                    date: new Date(ex.sessionDate),
                    label: new Date(ex.sessionDate).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: '2-digit'
                      }
                    )
                  };
                }
              }
              return null;

            case 'Number of Sessions':
              return {
                value: 1, // Each exercise occurrence represents one session
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };

            // Add more cases here for other categories

            default:
              return null;
          }
        })
        .filter((item) => item !== null) // Remove null items
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((item) => ({ value: item.value, label: item.label }))
    : [];
  console.log('Chart Data for Rendering:', chartData);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.category}</Text>

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
          color={'#B9EFF3'}
          thickness={2}
          hideDataPoints
          dataPointsColor1="#3C748B"
          focusedDataPointColor={'#3C748B'}
          yAxisColor="#EBEFF1"
          xAxisColor="#EBEFF1"
          width={windowWidth * 0.71}
          height={windowHeight * 0.45}
          secondaryYAxis={{}}
          noOfSections={5}
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          yAxisTextStyle={{ color: 'lightgray' }}
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
    backgroundColor: 'white',
    padding: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16
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
