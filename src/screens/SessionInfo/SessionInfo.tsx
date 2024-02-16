import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { DateDisplay } from '../../components/DateDisplay';
import { Button, Text } from '@rneui/themed';

export const SessionInfo = ({ route, navigation }) => {
  const { sessionData } = route.params;

  const handleNavigateToBodyParts = () => {
    navigation.navigate('BodyPartsList', { sessionId: sessionData.id });
  };

  // Handler to update set data (you can add logic here to update the state or backend)
  const handleSetChange = (eIndex, sIndex, field, value) => {
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

// Styling remains the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  exerciseContainer: {},
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 5
  },
  inputLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 10
  },
  input: {
    borderWidth: 1,
    width: 40,
    textAlign: 'center',
    marginTop: 5
  },
  setText: {
    width: 50,
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
