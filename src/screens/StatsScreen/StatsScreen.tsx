import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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
              const totalWeight = ex.sets.reduce(
                (acc, set) => acc + Number(set.weight),
                0
              );
              const averageWeight = totalWeight / ex.sets.length;
              return {
                value: averageWeight,
                date: new Date(ex.sessionDate),
                label: new Date(ex.sessionDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit'
                })
              };
            default:
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
          }
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((item) => ({ value: item.value, label: item.label }))
    : [];

  // Determine the maximum number of labels to display
  const maxLabels = 10;

  // Calculate the interval between labels
  const labelInterval = Math.ceil(chartData.length / maxLabels);

  // Only include a label if its index is a multiple of the interval
  const reducedLabels = chartData.filter(
    (_, index) => index % labelInterval === 0
  );

  console.log('Chart Data for Rendering:', chartData);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volume</Text>

      {isFetching ? (
        <View>
          <ActivityIndicator size="large" color="#3C748B" />
          <Text>Synchronizing...</Text>
        </View>
      ) : error ? (
        <Text>Error: {String(error)}</Text>
      ) : chartData && chartData.length > 0 ? (
        <LineChart
          data={{
            labels: reducedLabels.map((item) => item.label),
            datasets: [
              {
                data: chartData.map((item) => item.value)
              }
            ]
          }}
          width={windowWidth * 0.95}
          height={windowHeight * 0.45}
          chartConfig={{
            backgroundColor: 'white',
            backgroundGradientFrom: 'white',
            backgroundGradientTo: 'white',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            fillShadowGradient: 'rgba(185, 239, 243, 1)', // Change the color of the area below the line here
            fillShadowGradientOpacity: 1,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '3.5',
              strokeWidth: '',
              stroke: '',
              fill: `rgba(0, 0, 0, 0.5)` // Change the color of the dots here
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
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
