import { createApi } from '@reduxjs/toolkit/query/react';
import { db } from '../../../firebase-config';
import { addDoc, collection, getDocs, doc, getDoc, deleteDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';

type SessionData = {
  sets: any;
  id: string;
  exercises?: any[];
  date: string;
};

const firebaseBaseQuery = async ({ baseUrl, url, method, body }) => {
  switch (method) {
    case 'GET':
      if (url.includes('/')) {
        const [collectionName, docId] = url.split('/');
        const docSnapshot = await getDoc(doc(db, collectionName, docId));
        if (docSnapshot.exists()) {

          let data: SessionData = { id: docSnapshot.id, ...docSnapshot.data() as SessionData };
          if (collectionName === 'sessions') {
            const exercisesSnapshot = await getDocs(collection(db, `${collectionName}/${docId}/exercises`));
            const exercisesData = await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
              const exerciseData = exerciseDoc.data();
              const setsSnapshot = await getDocs(collection(db, `${collectionName}/${docId}/exercises/${exerciseDoc.id}/sets`));
              const setsData = setsSnapshot.docs.map(setDoc => ({
                id: setDoc.id,
                ...setDoc.data()
              }));
              return {
                ...exerciseData,
                firestoreId: exerciseDoc.id,
                sets: setsData
              };
            }));
            data = {
              ...data,
              exercises: exercisesData
            };
          }
          return { data };
        } else {
          return { data: null, error: `No document with ID ${docId} found in collection ${collectionName}` };
        }
      } else {
        const sessionsSnapshot = await getDocs(collection(db, url));
        const sessionsData = await Promise.all(sessionsSnapshot.docs.map(async (sessionDoc) => {
          const sessionData = sessionDoc.data();
          const exercisesSnapshot = await getDocs(collection(db, `${url}/${sessionDoc.id}/exercises`));
          const exercisesData = await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
            const exerciseData = exerciseDoc.data();
            const setsSnapshot = await getDocs(collection(db, `${url}/${sessionDoc.id}/exercises/${exerciseDoc.id}/sets`));
            const setsData = setsSnapshot.docs.map(setDoc => setDoc.data());
            return {
              ...exerciseData,
              sets: setsData
            };
          }));
          return {
            id: sessionDoc.id,
            ...sessionData,
            date: sessionData.date?.toDate ? sessionData.date.toDate().toISOString() : sessionData.date,
            exercises: exercisesData
          };
        }));
        return { data: sessionsData };
      }

    case 'POST':
      const docRef = await addDoc(collection(db, url), body);
      return { data: { id: docRef.id, ...body } };

    case 'DELETE':
      if (url.includes('/')) {
        const [collectionName, docId] = url.split('/');
        await deleteDoc(doc(db, collectionName, docId));
        return { data: { id: docId } };
      } else {
        throw new Error(`No document ID provided for deletion`);
      }

    default:
      throw new Error(`Unhandled method ${method}`);
  }
};

export const sessionsApi = createApi({
  reducerPath: 'sessionsApi',
  baseQuery: firebaseBaseQuery,
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    // Create a new session
    createSession: builder.mutation({
      query: ({ session }) => ({
        baseUrl: '',
        url: 'sessions',
        method: 'POST',
        body: session
      }),
    }),
    // Get all sessions
    getSessions: builder.query({
      query: () => ({
        baseUrl: '',
        url: 'sessions',
        method: 'GET',
        body: ''
      }),

    }),

    // Add an exercise with an initial set to a session
    addExerciseWithInitialSetToSession: builder.mutation({
      queryFn: async ({ sessionId, exercise }) => {
        try {
          const exerciseRef = await addDoc(collection(db, `sessions/${sessionId}/exercises`), {
            ...exercise,
            timestamp: new Date().toISOString()
          })
          await addDoc(collection(db, `sessions/${sessionId}/exercises/${exerciseRef.id}/sets`),
            { reps: '', weight: '', timestamp: new Date().toISOString() });
          return { data: { id: exerciseRef.id, ...exercise } };
        } catch (error) {
          return { error: error };
        }
      }
    }),
    // Get a session by its ID
    getSessionById: builder.query<SessionData, string>({
      query: (sessionId) => ({
        baseUrl: '',
        url: `sessions/${sessionId}`,
        method: 'GET',
        body: ''
      }),
      providesTags: (result, error, sessionId) => [{ type: 'Session', id: sessionId }],
    }),
    // Add a set to an exercise
        addSetToExercise: builder.mutation({
      queryFn: async ({ sessionId, exerciseId, set }) => {
        console.log(`Attempting to add a set to exercise - Session ID: ${sessionId}, Exercise Firestore ID: ${exerciseId}`);
        try {
          const setWithTimestamp = { ...set, timestamp: new Date().toISOString() };
          const setRef = await addDoc(collection(db, `sessions/${sessionId}/exercises/${exerciseId}/sets`), setWithTimestamp);
          return { data: { id: setRef.id, ...setWithTimestamp } };
        } catch (error) {
          return { error: error };
        }
      }
    }),
    // Delete a set from an exercise
    deleteSetFromExercise: builder.mutation({
      queryFn: async ({ sessionId, exerciseId, setId }) => {
        console.log(`Deleting set with Session ID: ${sessionId}, Exercise ID: ${exerciseId}, Set ID: ${setId}`);


        const setDocRef = doc(db, `sessions/${sessionId}/exercises/${exerciseId}/sets`, setId);
        try {
          // Delete the set document
          await deleteDoc(setDocRef);
          return { data: { sessionId, exerciseId, setId } };
        } catch (error) {
          // Return error if operation fails
          return { error: error };
        }
      },

      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),
    deleteSession: builder.mutation({
      queryFn: async (sessionId) => {
        const sessionDocRef = doc(db, `sessions`, sessionId);
        try {
          // Fetch all exercises for the session
          const exercisesSnapshot = await getDocs(collection(db, `sessions/${sessionId}/exercises`));
          for (const exerciseDoc of exercisesSnapshot.docs) {
            const setsSnapshot = await getDocs(collection(db, `sessions/${sessionId}/exercises/${exerciseDoc.id}/sets`));
            // Delete all sets for each exercise
            for (const setDoc of setsSnapshot.docs) {
              await deleteDoc(doc(db, `sessions/${sessionId}/exercises/${exerciseDoc.id}/sets`, setDoc.id));
            }
            // Delete the exercise after all its sets are deleted
            await deleteDoc(doc(db, `sessions/${sessionId}/exercises`, exerciseDoc.id));
          }
          // Finally, delete the session itself
          await deleteDoc(sessionDocRef);
          return { data: { id: sessionId } }; // Return the deleted sessionId
        } catch (error) {
          return { error: error.message || 'Failed to delete session and its related data.' };
        }
      },
      invalidatesTags: (result, error, sessionId) => [{ type: 'Session', id: sessionId }],
    }),
    // Delete an exercise and all its sets
    deleteExerciseAndItsSets: builder.mutation({
      queryFn: async ({ sessionId, exerciseId }) => {
        try {
          // Fetch all sets for the exercise
          const setsSnapshot = await getDocs(collection(db, `sessions/${sessionId}/exercises/${exerciseId}/sets`));
          // Delete all sets for the exercise
          for (const setDoc of setsSnapshot.docs) {
            await deleteDoc(doc(db, `sessions/${sessionId}/exercises/${exerciseId}/sets`, setDoc.id));
          }
          // Delete the exercise after all its sets are deleted
          await deleteDoc(doc(db, `sessions/${sessionId}/exercises`, exerciseId));
          return { data: { id: sessionId } }; // Return the sessionId
        } catch (error) {
          return { error: error.message || 'Failed to delete exercise and its sets.' };
        }
      },
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),
    // Update a set in an exercise
    updateSetInExercise: builder.mutation({
      queryFn: async ({ sessionId, exerciseId, setId, updatedSet }) => {
        console.log(`Updating set with Session ID: ${sessionId}, Exercise ID: ${exerciseId}, Set ID: ${setId}`);

        if (!updatedSet) {
          throw new Error('updatedSet is undefined');
        }

        // Construct the reference to the specific set document
        const setDocRef = doc(db, `sessions/${sessionId}/exercises/${exerciseId}/sets`, setId);
        try {
          // Update the set document
          await updateDoc(setDocRef, updatedSet);
          return { data: { id: setId, ...updatedSet } }; // Return the updated set
        } catch (error) {
          // Return error if operation fails
          return { error: error };
        }
      },

      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],

    }),
    getAllExercises: builder.query({
      queryFn: async () => {
        try {
          const sessionSnapshot = await getDocs(collection(db, "sessions"));
          let allExercises = [];
          for (const sessionDoc of sessionSnapshot.docs) {
            const sessionData = sessionDoc.data();
            const exerciseSnapshot = await getDocs(collection(db, `sessions/${sessionDoc.id}/exercises`));
            for (const exerciseDoc of exerciseSnapshot.docs) {
              const exerciseData = exerciseDoc.data();
              const setsSnapshot = await getDocs(collection(db, `sessions/${sessionDoc.id}/exercises/${exerciseDoc.id}/sets`));
              let sets = [];
              setsSnapshot.forEach(setDoc => {
                sets.push({
                  id: setDoc.id,
                  ...setDoc.data()
                });
              });
              allExercises.push({
                ...exerciseData,
                sessionId: sessionDoc.id,
                sets: sets,
                sessionDate: sessionData.date?.toDate ? sessionData.date.toDate().toISOString() : sessionData.date
              });
            }
          }
          console.log("Fetched Exercises:", allExercises); // Log the fetched data
          return { data: allExercises };
        } catch (error) {
          console.error("Error fetching exercises:", error);
          return { error: error.message || 'Failed to fetch exercises' };
        }
      }
    }),
    // Endpoint to fetch the last session data for a specific exercise
    getLastExerciseData: builder.query({
      queryFn: async (exerciseId) => {
        try {
          const sessionsSnapshot = await getDocs(query(
            collection(db, "sessions"),
            where("exercises", "array-contains", exerciseId),
            orderBy("date", "desc"),
            limit(1)
          ));

          if (!sessionsSnapshot.empty) {
            const sessionDoc = sessionsSnapshot.docs[0]; // The most recent session
            const sessionData = sessionDoc.data();
            const exerciseSnapshot = await getDocs(collection(db, `sessions/${sessionDoc.id}/exercises`));
            let exerciseData;

            exerciseSnapshot.forEach((doc) => {
              if (doc.id === exerciseId) {
                exerciseData = doc.data();
                const setsData = exerciseData.sets.map((set) => ({
                  id: set.id,
                  reps: set.reps,
                  weight: set.weight
                }));
                exerciseData = { ...exerciseData, sets: setsData };
              }
            });

            return { data: exerciseData };
          } else {
            return { error: new Error("No sessions found for the specified exercise.") };
          }
        } catch (error) {
          return { error: error.message || 'Failed to fetch last exercise data' };
        }
      }
    }),
    createExercise: builder.mutation({
      query: (exercise) => ({
        baseUrl: '',
        url: 'global_exercises',
        method: 'POST',
        body: exercise,
      }),
    }),
    
  }),




});

export const {
  useCreateSessionMutation,
  useGetSessionsQuery,
  /* useAddExerciseToSessionMutation */
  useAddExerciseWithInitialSetToSessionMutation,
  useGetSessionByIdQuery, useAddSetToExerciseMutation,
  useDeleteSetFromExerciseMutation, useDeleteSessionMutation,
  useUpdateSetInExerciseMutation, useDeleteExerciseAndItsSetsMutation,
  useGetAllExercisesQuery, useGetLastExerciseDataQuery, useCreateExerciseMutation
} = sessionsApi;
