import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from '@rneui/themed';
import { useGetSessionsQuery } from '../../store/api/sessionsApi';
import { DateDisplay } from '../../components/DateDisplay';

export const SessionInfo = ({ route }) => {
  const [sessions, setSessions] = useState([]);
  const { data } = useGetSessionsQuery({});
  const { sessionData } = route.params;

  useEffect(() => {
    if (data) {
      setSessions(data);
    }
  }, [data]);

  // Handler to update set data (you can add logic here to update the state or backend)
  const handleSetChange = (eIndex, sIndex, field, value) => {
    // Implement the logic to handle set change

    console.log(
      `Exercise ${eIndex}, Set ${sIndex}, Field ${field}, New Value ${value}`
    );
  };

  return (
    <View style={styles.container}>
      <Text>Session Info</Text>
      <DateDisplay dateString={sessionData.date} />
      {sessionData.exercises
        .slice()
        .reverse()
        .map((exercise, eIndex) => (
          <View key={eIndex} style={styles.exerciseContainer}>
            <Text h4>{exercise.name}</Text>
            {exercise.sets.map((set, sIndex) => (
              <View key={sIndex} style={styles.setContainer}>
                <Text style={styles.setText}>Set {sIndex + 1}</Text>
                <View style={styles.inputLabelContainer}>
                  <Text>Reps</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) =>
                      handleSetChange(eIndex, sIndex, 'reps', value)
                    }
                    value={set.reps.toString()}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputLabelContainer}>
                  <Text>Weight</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) =>
                      handleSetChange(eIndex, sIndex, 'weight', value)
                    }
                    value={set.weight.toString()}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
          </View>
        ))}
    </View>
  );
};

//STYLING BELOW

const styles = StyleSheet.create({
  container: {
    // Your container style
  },
  exerciseContainer: {
    // Styles for each exercise block
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 5 // Adjust the spacing between sets
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 10 // Adjust the spacing between label-input pairs
  },
  input: {
    borderWidth: 1,
    width: 40, // Adjust width as needed
    textAlign: 'center',
    marginTop: 5 // Space between label and input
  },
  setText: {
    width: 50, // Adjust width as needed
    textAlign: 'center'
  }
});

export default SessionInfo;
