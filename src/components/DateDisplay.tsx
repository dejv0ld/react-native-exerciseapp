import React from 'react';
import { Text, TextStyle, View } from 'react-native';

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

export const DateDisplay: React.FC<DateDisplayProps> = ({
  dateString,
  style
}) => {
  const dateParts = formatDate(dateString)
    .split(', ')
    .flatMap((part) => part.split(' ')); // Further split the date parts by space and flatten the array

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      {dateParts.map((part, index) => (
        <Text key={index} style={[{ fontSize: index === 2 ? 18 : 12, }, style]}>
          {part}
        </Text>
      ))}
    </View>
  );
};
