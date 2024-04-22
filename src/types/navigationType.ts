import { ReactNode } from "react";

// navigationTypes.ts
export type RootStackParamList = {
  'Exercise Sessions': undefined;
  'Session Info': { sessionId: string, onDelete: (sessionId: string) => void }; // replace 'any' with the specific type you expect
  'BodyPartsList': { sessionId: string };
  'ExercisesScreen': { bodyPartType: string, sessionId: string, };

};

export type StatsStackParamList = {
  'StatsCategoryList': { exercise: string };
  'CategoryChoice': undefined;
  'StatsScreen': undefined;
  'ExerciseStatsListScreen': { bodyPart: string};
};

export type HandleMenuPressProviderProps = {
  children: ReactNode;
};
