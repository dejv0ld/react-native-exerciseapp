import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CreateExerciseScreen = () => {
  const [selectedItem, setSelectedItem] = useState('');

  const handlePickerChange = (itemValue: string) => {
    setSelectedItem(itemValue);
  };

  return (
    <View>
      <Text>Select an item:</Text>
      <Picker selectedValue="{selectedItem}" onValueChange={handlePickerChange}>
        <Picker.Item style={{ fontSize: 16 }} label="Category" value="null" />
        <Picker.Item style={{ fontSize: 16 }} label="Abs" value="item1" />
        <Picker.Item style={{ fontSize: 16 }} label="Back" value="item2" />
        <Picker.Item style={{ fontSize: 16 }} label="Biceps" value="item3" />
        <Picker.Item style={{ fontSize: 16 }} label="Cardio" value="item4" />
        <Picker.Item style={{ fontSize: 16 }} label="Chest" value="item5" />
        <Picker.Item style={{ fontSize: 16 }} label="Legs" value="item6" />
        <Picker.Item style={{ fontSize: 16 }} label="Shoulders" value="item7" />
        <Picker.Item style={{ fontSize: 16 }} label="Triceps" value="item8" />
      </Picker>
    </View>
  );
};

export default CreateExerciseScreen;
