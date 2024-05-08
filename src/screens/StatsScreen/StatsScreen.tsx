import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useGetAllExercisesQuery } from '../../store/api/sessionsApi';
import { StatsStackParamList } from '../../types/navigationType';
import { RouteProp } from '@react-navigation/native';
import {
  VictoryLine,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryScatter,
  VictoryTooltip
} from 'victory-native';

type StatsScreenRouteProp = RouteProp<StatsStackParamList, 'StatsScreen'>;

type Props = {
  route: StatsScreenRouteProp;
};

type ChartData = {
  value: number;
  date: string;
  label: string;
};

// Function to get month abbreviation in TypeScript
const formatMonth = (date: Date): string => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return months[date.getMonth()]; // getMonth returns 0 for January, 11 for December
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const StatsScreen: React.FC<Props> = ({ route }) => {
  const { exercise } = route.params;

  // Fetch all exercises immediately when the component mounts
  const { data: exercises, isFetching, error } = useGetAllExercisesQuery({});

  // Filter exercises based on input and prepare chart data
  const chartData: ChartData[] = exercises
    ? exercises
        .filter((ex) => ex.name.toLowerCase() === exercise.toLowerCase())
        .map((ex) => {
          let value: number;
          switch (route.params.category) {
            case 'Max Weight':
              value = Math.max(...ex.sets.map((set) => Number(set.weight)));
              break;
            case 'Average Weight':
              const totalWeight = ex.sets.reduce(
                (acc, set) => acc + Number(set.weight),
                0
              );
              value = totalWeight / ex.sets.length;
              break;
            default:
              value = ex.sets.reduce(
                (acc, set) => acc + Number(set.weight) * set.reps,
                0
              );
              break;
          }
          return {
            value: value,
            date: new Date(ex.sessionDate).toISOString(),
            label: value.toString()
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Determine the maximum number of labels to display
  const maxLabels = 10;

  // Calculate the interval between labels
  const labelInterval = Math.ceil(chartData.length / maxLabels);

  // Only include a label if its index is a multiple of the interval
  // Adjust this to ensure you always include the first and last date
  const reducedLabels = [
    chartData[0],
    ...chartData.filter(
      (_, index) =>
        index % labelInterval === 0 || index === chartData.length - 1
    )
  ];

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
        <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            data={chartData}
            x="date"
            y="value"
            style={{
              data: { stroke: '#c43a31' }
            }}
          />
          <VictoryScatter data={chartData} size={3} x="date" y="value" />
          <VictoryAxis dependentAxis tickFormat={(value) => `${value}`} />
          <VictoryAxis
            tickValues={chartData.map((data) => data.date)}
            tickFormat={(date) => {
              const displayDate = new Date(date);
              return `${displayDate.getDate()} ${formatMonth(displayDate)}`;
            }}
            fixLabelOverlap={true}
          />
        </VictoryChart>
      ) : (
        <Text>Please Enter an exercise name</Text>
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
