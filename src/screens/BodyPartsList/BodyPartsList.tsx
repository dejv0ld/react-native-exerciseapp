import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationType';

export const BodyPartsList = ({ route }) => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'BodyPartsList'>
    >();

  useEffect(() => {
    navigation.setOptions({
      title: 'Select Exercise'
    });
  }, [navigation]);

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
    navigation.navigate('ExercisesScreen', {
      bodyPartType,
      sessionId: route.params.sessionId
    });
  };

  return (
    <View style={styles.container}>
      {bodyParts.map((bodyPart, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSelectBodyPart(bodyPart)}
        >
          <Text key={index} style={styles.bodyPartItem}>
            {bodyPart}
          </Text>
          <View style={styles.lineStyle} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  bodyPartItem: {
    fontSize: 18,
    padding: 10
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: '#EBEFF1',
    marginTop: 10
  }
});
