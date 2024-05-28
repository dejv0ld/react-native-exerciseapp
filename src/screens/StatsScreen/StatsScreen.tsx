import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback
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
  /*   label: string;
   */
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
  const { category } = route.params;

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
            case 'Number of Sets':
              value = ex.sets.length;
              break;
            case 'Number of Reps':
              value = ex.sets.reduce((acc, set) => acc + Number(set.reps), 0);
              break;
            case 'Reps per Set':
              const totalReps = ex.sets.reduce(
                (acc, set) => acc + Number(set.reps),
                0
              );
              value = totalReps / ex.sets.length;
              break;
            /*        case 'Number of Sessions':
              const uniqueDates = new Set(
                exercises
                  .filter(
                    (ex) => ex.name.toLowerCase() === exercise.toLowerCase()
                  )
                  .map((ex) => new Date(ex.sessionDate).toDateString())
              );
              value = uniqueDates.size;
              break; */
            default:
              value = ex.sets.reduce(
                (acc, set) => acc + Number(set.weight) * set.reps,
                0
              );
              break;
          }

          console.log(`Date: ${ex.sessionDate}, Value: ${value}`); // Log the values

          //round value to integer
          value = Math.round(value);

          return {
            value: value,
            date: new Date(ex.sessionDate).toISOString()
            /*             label: value.toString()
             */
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

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const chartRef = useRef(null);
  const [chartPosition, setChartPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.measure((x, y, width, height, pageX, pageY) => {
        setChartPosition({ x: pageX, y: pageY });
      });
    }
  }, []);

  console.log('Chart Data for Rendering:', chartData);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category}</Text>
            {isFetching ? (
        <View>
          <ActivityIndicator size="large" color="#3C748B" />
          <Text>Synchronizing...</Text>
        </View>
      ) : error ? (
        <Text>Error: {String(error)}</Text>
      ) : chartData && chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <View
            ref={chartRef}
            onLayout={() => {
              if (chartRef.current) {
                chartRef.current.measure(
                  (x, y, width, height, pageX, pageY) => {
                    setChartPosition({ x: pageX, y: pageY });
                  }
                );
              }
            }}
          >
            <VictoryChart
              width={windowWidth * 1}
              height={windowHeight * 0.6}
              theme={VictoryTheme.material}
            >
              <VictoryLine
                data={chartData}
                x="date"
                y="value"
                style={{
                  data: { stroke: '#3C748B' }
                }}
                interpolation="natural"
              />
              <VictoryScatter
                data={chartData}
                size={3}
                style={{ data: { fill: '#3C748B' } }}
                x="date"
                y="value"
                events={[
                  {
                    target: 'data',
                    eventHandlers: {
                      onPress: () => {
                        return [
                          {
                            target: 'data',
                            mutation: (props) => {
                              setTooltipVisible(true);
                              setTooltipData(props.datum);
                              setModalPosition({
                                x: props.x + chartPosition.x,
                                y: props.y + chartPosition.y
                              }); // Set Modal Position
                              return null;
                            }
                          }
                        ];
                      }
                    }
                  }
                ]}
              />

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
          </View>
          {tooltipVisible && (
            <Modal
              style={[
                styles.centeredView,
                {
                  top: modalPosition.y,
                  left: modalPosition.x
                }
              ]}
              animationType="slide"
              transparent={true}
              visible={tooltipVisible}
              onRequestClose={() => {
                setTooltipVisible(!tooltipVisible);
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => setTooltipVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View
                      style={[
                        styles.centeredView,
                        { top: modalPosition.y, left: modalPosition.x }
                      ]}
                    >
                      <View style={styles.modalView}>
                        <Text style={styles.modalText}>
                          {tooltipData.value}
                        </Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}
        </View>
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
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  //Modal styling below:

  centeredView: {
    display: 'flex',

    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
