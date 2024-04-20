import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions
} from 'react-native';
import {
  useGetSessionsQuery,
  useCreateSessionMutation
} from '../../store/api/sessionsApi';
import { Text, Card, Button } from '@rneui/themed';
import { DateDisplay } from '../../components/DateDisplay';
import { useFocusEffect } from '@react-navigation/native';

const TrainingSessions = ({ navigation }) => {
  const { data, refetch } = useGetSessionsQuery({});
  const [createSession] = useCreateSessionMutation();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const sessions = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return dateB - dateA; // For descending order
    });
  }, [data]);

  const handleDateClick = (sessionData) => {
    navigation.navigate('Session Info', { sessionId: sessionData.id });
  };

  const handleCreateSession = async () => {
    try {
      const newSession = {
        date: new Date().toISOString()
      };
      const result = await createSession({ session: newSession }).unwrap();
      if (result.id) {
        navigation.navigate('Session Info', { sessionId: result.id });
      }
      await refetch();
    } catch {
      console.error('Error creating session!', Error);
    }
  };

  const renderItem = ({ item: session }) => {
    return (
      <View style={styles.container}>
        <View style={styles.dateTextContainer}>
          <DateDisplay
            style={styles.dateDisplayText}
            dateString={session.date}
          />
        </View>
        <TouchableOpacity onPress={() => handleDateClick(session)}>
          <View style={styles.sessionCard}>
            {session.exercises?.map((exercise, eIndex) => (
              <View key={eIndex}>
                <Text style={styles.exercisesText}>
                  {exercise.sets?.length}x {exercise.name}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.sessionCardContainer}>
      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Button
        title="+"
        onPress={handleCreateSession}
        buttonStyle={styles.addButton}
        titleStyle={styles.addButtonText}
        containerStyle={styles.addSessionBtn}
      />
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  dateTextContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: windowHeight * 0.07,
    width: windowWidth * 0.08,
    margin: 5
  },
  addSessionBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  addButton: {
    borderRadius: 15,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3C748B'
  },
  addButtonText: {
    fontSize: 30
  },
  sessionCardContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  sessionCard: {
    borderRadius: 5,
    margin: 5,
    padding: 5,
    backgroundColor: '#E2EEF3',
    width: windowWidth * 0.8,
    minHeight: windowHeight * 0.07
  },
  dateDisplayText: {
    fontWeight: '300',
    marginVertical: -1
  },
  exercisesText: {
    fontSize: 14
  }
});

export default TrainingSessions;
