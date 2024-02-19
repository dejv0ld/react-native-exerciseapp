// navigationTypes.ts
export type RootStackParamList = {
  'Training Sessions': undefined;
  'Session Info': { sessionId: string }; // replace 'any' with the specific type you expect
  'BodyPartsList': {sessionId: string };
  'ExercisesScreen': { bodyPartType: string, sessionId: string, };
};
