import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, Button, Overlay } from '@rneui/themed';
import { useGetSessionsQuery } from '../../store/api/sessionsApi';
import { DateDisplay } from '../../components/DateDisplay';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationType'; // Adjust the import path as necessary

export const SessionInfo = ({ route }) => {
  const [sessions, setSessions] = useState([]);
  const { data } = useGetSessionsQuery({});
  const { sessionData } = route.params;
  
  type SessionInfoNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Session Info'
  >;
  const navigation = useNavigation<SessionInfoNavigationProp>();

  useEffect(() => {
    if (data) {
      setSessions(data);
    }
  }, [data]);

  const handleNavigateToBodyParts = () => {
    navigation.navigate('BodyPartsList', { sessionId: sessionData.id });
  };

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
      <Button
        onPress={handleNavigateToBodyParts}
        buttonStyle={styles.addButton}
        titleStyle={styles.addButtonText}
        containerStyle={styles.addExerciseBtn}
      >
        + Lägg till övning
      </Button>
    </View>
  );
};

//STYLING BELOW

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Aligns children to the start
    alignItems: 'stretch'
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
  },
  addButton: {
    borderRadius: 15,
    width: 160,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SessionInfo;
