import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu';

export const SessionInfoMenu = ({}) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Menu>
        <MenuTrigger>
          <TouchableOpacity>
            <Text style={{ fontSize: 24 }}>⋮</Text> {/* Three dots icon */}
          </TouchableOpacity>
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => alert('Delete Item')} text="Delete" />
        </MenuOptions>
      </Menu>
    </View>
  );
};
