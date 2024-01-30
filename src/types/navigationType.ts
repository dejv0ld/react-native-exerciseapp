// navigationTypes.ts
export type RootStackParamList = {
  'Training Sessions': undefined;
  'Session Info': { sessionData: any }; // replace 'any' with the specific type you expect
  'BodyPartsList': undefined;
  'ExercisesScreen': { bodyPartType: string };
};
