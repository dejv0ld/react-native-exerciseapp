import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const BodyPartsList = ({ navigation }) => {
  // Body parts array
  const bodyParts = [
    'Abs',
    'Back',
    'Biceps',
    'Cardio',
    'Chest',
    'Legs',
    'Shoulders',
    'Triceps'
  ];

  return (
    <View style={styles.container}>
      {bodyParts.map((bodyPart, index) => (
        <Text style={styles.bodyPartItem}>{bodyPart}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bodyPartItem: {
    margin: 10,
    fontSize: 18
    // Add additional styling as needed
  }
});
