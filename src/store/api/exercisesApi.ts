import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../../firebase-config';
import { addDoc, collection, getDocs, deleteDoc, doc, setDoc, where, query } from 'firebase/firestore';

const firebaseBaseQuery = async ({ baseUrl, url, method, body, params }) => {
  switch (method) {
    case 'GET':
      const { type } = params;
      const q = query(collection(db, url), where("type", "==", type));
      const querySnapshot = await getDocs(q);
      const exercises = [];
      querySnapshot.forEach((doc) => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return { data: exercises };

    // Add other cases (POST, DELETE, etc.) as needed

    default:
      throw new Error(`Unhandled method ${method}`);
  }
};

export const exercisesApi = createApi({
  reducerPath: 'exercisesApi',
  baseQuery: firebaseBaseQuery,
  tagTypes: ['Exercises'],
  endpoints: (builder) => ({
    getExercisesByType: builder.query({
      query: (type) => ({
        baseUrl: '',
        url: 'global_exercises',
        method: 'GET',
        params: { type }, // passing the type parameter to the base query
        body: ''
      }),
      // You can add providesTags here if needed for caching and invalidation
    }),
    // Define other endpoints such as createExercise, deleteExercise, etc.
  }),
});

export const { useGetExercisesByTypeQuery } = exercisesApi;
