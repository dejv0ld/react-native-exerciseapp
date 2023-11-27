import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '@rneui/themed';
import { useGetSessionsQuery } from '../../store/api/sessionsApi';
import { DateDisplay } from '../../components/DateDisplay';

export const SessionInfo = ({ route }) => {
  const [sessions, setSessions] = useState([]);
  const { data } = useGetSessionsQuery({});
  const { sessionData } = route.params;

  useEffect(() => {
    if (data) {
      setSessions(data);
    }
  }, [data]);



  return (
    <View>
      <Text>Session Info</Text>
      <View>
      <DateDisplay dateString={sessionData.date} />
        {sessionData.exercises &&
          sessionData.exercises.map((exercise, eIndex) => (
            <View key={eIndex}>
              <Text h4>{exercise.name}</Text>
              {exercise.sets &&
                exercise.sets.map((set, sIndex) => (
                  <Text key={sIndex}>
                    Set {sIndex + 1}: {set.reps} reps, {set.weight} kg
                  </Text>
                ))}
            </View>
          ))}
      </View>
    </View>
  );
};
