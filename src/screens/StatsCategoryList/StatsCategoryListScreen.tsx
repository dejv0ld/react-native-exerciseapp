import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatsStackParamList } from '../../types/navigationType';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';



type NavigationProp = NativeStackNavigationProp<
  StatsStackParamList,
  'StatsCategoryList'
>;

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

const StatsCategoryListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePressBodyPart = (bodyPart: string) => {
    navigation.navigate('ExerciseStatsListScreen', { bodyPart });
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={{ padding: 10 }}
      onPress={() => handlePressBodyPart(item)}
    >
      <View>
        <Text>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={bodyParts}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

export default StatsCategoryListScreen;
