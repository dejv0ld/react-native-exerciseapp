// src/HandleMenuPressContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDeleteSessionMutation } from './store/api/sessionsApi';
import { HandleMenuPressProviderProps } from './types/navigationType';

// Create a context
export const HandleMenuPressContext = createContext<
  ((sessionId: string) => void) | undefined
>(undefined);

// Create a provider component
export const HandleMenuPressProvider: React.FC<
  HandleMenuPressProviderProps
> = ({ children }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const [deleteSession] = useDeleteSessionMutation();

  const handleMenuPress = (sessionId: string) => {
    const options = ['Delete', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          try {
            await deleteSession(sessionId).unwrap();
          } catch (error) {
            console.error('Error deleting session!', error);
          }
        }
      }
    );
  };

  return (
    <HandleMenuPressContext.Provider value={handleMenuPress}>
      {children}
    </HandleMenuPressContext.Provider>
  );
};

// Create a hook to use the context
export const useHandleMenuPress = () => {
  const context = useContext(HandleMenuPressContext);
  if (context === undefined) {
    throw new Error(
      'useHandleMenuPress must be used within a HandleMenuPressProvider'
    );
  }
  return context;
};
