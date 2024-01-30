import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationType';




export const BodyPartsList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'BodyPartsList'>>();
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

  const handleSelectBodyPart = (bodyPartType) => {
    navigation.navigate('ExercisesScreen', { bodyPartType })
  }

  return (

    <View style={styles.container}>
      {bodyParts.map((bodyPart, index) => (
        <TouchableOpacity key={index} onPress={() => handleSelectBodyPart(bodyPart)}>
        <Text key={index} style={styles.bodyPartItem}>
          {bodyPart}
        </Text>
        </TouchableOpacity>
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
    fontSize: 18,
    // Add additional styling as needed
    padding: 10, // For better touch feedback
    backgroundColor: 'lightgray', // For better visibility
    borderRadius: 5, // For rounded corners
    // Add additional styling as needed
  }
});
