import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useGetSessionsQuery } from '../../store/api/sessionsApi';
import { Text, Card } from '@rneui/themed';
import { DateDisplay } from '../../components/DateDisplay';

const TrainingSessions = ({ navigation }) => {
  const { data } = useGetSessionsQuery({});
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (data) {
      setSessions(data);
    }
  }, [data]);

  const handleDateClick = (sessionData) => {
    navigation.navigate('Session Info', { sessionData });
  };

  return (
    <View>
      <Text h1>Training Sessions</Text>
      {sessions.map((session, index) => (
        <TouchableOpacity key={index} onPress={() => handleDateClick(session)}>
        <Card key={index}>
          <Card.Title onPress={() => handleDateClick(session)}>
          <DateDisplay dateString={session.date} />
          </Card.Title>
          <Card.Divider />
          {session.exercises &&
            session.exercises.map((exercise, eIndex) => (
              <View key={eIndex}>
                <Text>Exercise: {exercise.name}</Text>
                {exercise.sets &&
                  exercise.sets.map((set, sIndex) => (
                    <Text key={sIndex}>
                      Set {sIndex + 1}: {set.reps} reps, {set.weight} kg
                    </Text>
                  ))}
              </View>
            ))}
        </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TrainingSessions;
