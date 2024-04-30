import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { StatsStackParamList } from '../../types/navigationType';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type StatsScreenRouteProp = RouteProp<StatsStackParamList, 'StatsScreen'>;
type CategoryScreenNavigationProp = NativeStackNavigationProp<
  StatsStackParamList,
  'CategoryScreen'
>;

type Props = {
  route: StatsScreenRouteProp;
  navigation: CategoryScreenNavigationProp;
};

export const CategoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { exercise } = route.params;

  const category = [
    { title: 'Volume' },
    { title: 'Max Weight' },
    { title: 'Average Weight' },
    { title: 'Number of Sets' },
    { title: 'Number of Reps' },
    { title: 'Reps per Set' },
    { title: 'Number of Sessions' }
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('StatsScreen', { exercise, category: item.title })
      }
    >
      <View style={{ padding: 10 }}>
        <Text>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.categoryHeading}>Category Statistic</Text>

      <FlatList
        data={category}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryHeading: {
    fontSize: 12,
    padding: 10,
    color: 'grey'
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  }
});
