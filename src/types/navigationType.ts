import { ReactNode } from "react";


export type RootStackParamList = {
  'Exercise Sessions': undefined;
  'Session Info': { sessionId: string, onDelete: (sessionId: string) => void };
  'BodyPartsList': { sessionId: string };
  'ExercisesScreen': { bodyPartType: string, sessionId: string, };
  'CreateExerciseScreen': { sessionId: string };
};


export type StatsStackParamList = {
  'StatsCategoryList': { exercise: string};
  'CategoryScreen': { exercise: string };
  'StatsScreen': { exercise: string; category: string };
  'ExerciseStatsListScreen': { bodyPart: string };
};

export type HandleMenuPressProviderProps = {
  children: ReactNode;
};
