import React from 'react';
import { Text, TextStyle } from 'react-native';

export const formatDate = (dateString: string): string => {
  const options = {
    weekday: 'short' as const,
    month: 'short' as const,
    day: '2-digit' as const
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

interface DateDisplayProps {
  dateString: string;
  style?: TextStyle;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ dateString, style }) => {
  return <Text style={[{ fontSize: 24 }, style]}>{formatDate(dateString)}</Text>;
};
