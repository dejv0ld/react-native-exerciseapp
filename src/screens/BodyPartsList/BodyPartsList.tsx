import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationType';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Icon } from '@rneui/themed';

export const BodyPartsList = ({ route }) => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'BodyPartsList'>
    >();

  useEffect(() => {
    navigation.setOptions({
      title: 'Select Exercise',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            navigation.navigate('CreateExerciseScreen', {
              sessionId: route.params.sessionId
            });
          }}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#3C748B" />
        </TouchableOpacity>
      )
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
          style={{ marginTop: 5, marginBottom: 7, paddingHorizontal: 10 }}
          key={index}
          onPress={() => handleSelectBodyPart(bodyPart)}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 10,
              elevation: 2,
              borderRadius: 3,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Text>{bodyPart}</Text>
            <View style={styles.Icon}>
              <Icon
                name="chevron-right"
                type="evilicon"
                color="#3C748B"
                size={36}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
Icon: {
  marginBottom: 5
},

  headerButton: {
    marginRight: 10
  }
});
