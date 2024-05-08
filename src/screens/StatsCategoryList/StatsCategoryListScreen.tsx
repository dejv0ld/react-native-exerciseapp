import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatsStackParamList } from '../../types/navigationType';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
/* import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
 */
import { Icon } from '@rneui/themed';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

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
      style={{ marginTop: 5, marginBottom: 7, paddingHorizontal: 10 }}
      onPress={() => handlePressBodyPart(item)}
    >
      <View style={styles.itemContainer}>
        <Text>{item}</Text>
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
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bodyParts}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 10,
    elevation: 2,
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
    // Add boxShadow
  },
  Icon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: windowWidth * 0.02
  }
});

export default StatsCategoryListScreen;
