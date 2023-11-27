import React from 'react';
import { Text } from '@rneui/themed';

export const DateDisplay = ({ dateString }) => {
  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return <Text h3>{formatDate(dateString)}</Text>;
};
