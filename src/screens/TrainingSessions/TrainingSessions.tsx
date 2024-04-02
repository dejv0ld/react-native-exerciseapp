import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
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

  const renderItem = ({ item: session }) => (
    <TouchableOpacity onPress={() => handleDateClick(session)}>
      <Card containerStyle={styles.sessionCard}>
        <Card.Title>
          <DateDisplay dateString={session.date} />
        </Card.Title>
        <Card.Divider />
        {session.exercises?.map((exercise, eIndex) => (
          <View key={eIndex}>
            <Text>
              {exercise.sets?.length}x {exercise.name}
            </Text>
          </View>
        ))}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({
  sessionCard: {
    margin: 15,
    borderRadius: 8
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
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 30
  }
});

export default TrainingSessions;
