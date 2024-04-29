import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@rneui/base';
import {
  useCreateExerciseMutation,
  useAddExerciseWithInitialSetToSessionMutation
} from '../../store/api/sessionsApi';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CreateExerciseScreen = ({ route, navigation }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [createExercise, { isLoading }] = useCreateExerciseMutation();
  const [addExerciseToSession, { isLoading: isAdding }] =
    useAddExerciseWithInitialSetToSessionMutation();

  const { sessionId } = route.params;

  const handlePickerChange = (itemValue: string) => {
    setSelectedItem(itemValue);
  };

  const handleSave = async () => {
    if (exerciseName && selectedItem) {
      try {
        const result = await createExercise({
          name: exerciseName,
          type: selectedItem
        });
        if ('data' in result) {
          const exercise = await addExerciseToSession({
            sessionId,
            exercise: result.data
          });
          console.log('Added exercise:', exercise);
        }
        setExerciseName('');
        setSelectedItem('');
        navigation.pop(2);
      } catch (error) {
        console.error('Failed to create exercise and add to session', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.TextInput}
        placeholder="Exercise name"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      <View style={styles.dropDownContainer}>
        <Picker selectedValue={selectedItem} onValueChange={handlePickerChange}>
          <Picker.Item style={{ fontSize: 16 }} label="Category" value={null} />
          <Picker.Item style={{ fontSize: 16 }} label="Abs" value="Abs" />
          <Picker.Item style={{ fontSize: 16 }} label="Back" value="Back" />
          <Picker.Item style={{ fontSize: 16 }} label="Biceps" value="Biceps" />
          <Picker.Item style={{ fontSize: 16 }} label="Cardio" value="Cardio" />
          <Picker.Item style={{ fontSize: 16 }} label="Chest" value="Chest" />
          <Picker.Item style={{ fontSize: 16 }} label="Legs" value="Legs" />
          <Picker.Item
            style={{ fontSize: 16 }}
            label="Shoulders"
            value="Shoulders"
          />
          <Picker.Item
            style={{ fontSize: 16 }}
            label="Triceps"
            value="Triceps"
          />
        </Picker>
      </View>
      <Button
        buttonStyle={styles.addButton}
        titleStyle={styles.addButtonText}
        containerStyle={styles.addExerciseBtn}
        onPress={handleSave}
        disabled={isLoading}
      >
        Save
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  TextInput: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    height: 55,
    padding: 15,
    marginHorizontal: windowWidth * 0.035,
    marginBottom: windowHeight * 0.015,
    marginTop: windowHeight * 0.015,
    fontSize: 16,
    color: 'black'
  },

  dropDownContainer: {
    borderWidth: 1,
    borderColor: '#EBEFF1',
    borderRadius: 3,
    height: 55,
    marginHorizontal: windowWidth * 0.035,
    marginBottom: windowHeight * 0.015
  },
  addButton: {
    borderRadius: 15,
    width: windowWidth * 0.4,
    height: 55,
    marginBottom: windowHeight * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3C748B',
    elevation: 5
  },
  addButtonText: {
    fontSize: 18
  },
  addExerciseBtn: {
    position: 'relative',
    top: windowWidth * 0.05,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CreateExerciseScreen;
