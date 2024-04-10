import { ReactNode } from "react";

// navigationTypes.ts
export type RootStackParamList = {
  'Training Sessions': undefined;
  'Session Info': { sessionId: string, onDelete: (sessionId: string) => void }; // replace 'any' with the specific type you expect
  'BodyPartsList': { sessionId: string };
  'ExercisesScreen': { bodyPartType: string, sessionId: string, };
};

export type HandleMenuPressProviderProps = {
  children: ReactNode;
};
