  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';

  export const StatsScreen = ({}) => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Stats Screen</Text>
        {/* Add your stats components here */}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
  });
