import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../../firebase-config';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseBaseQuery = async ({ url, method, body }) => {
  switch (method) {
    case 'GET':
      // Assuming 'type' is sent via body for a GET which is unusual; typically sent via 'params'
      const q = query(collection(db, url), where("type", "==", body.type));
      const querySnapshot = await getDocs(q);
      const exercises = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data: exercises };

    case 'POST':
      const newDocRef = await addDoc(collection(db, url), body);
      return { data: { id: newDocRef.id, ...body } };

    default:
      throw new Error(`Unhandled method ${method}`);
  }
};

export const exercisesApi = createApi({
  reducerPath: 'exercisesApi',
  baseQuery: firebaseBaseQuery,
  endpoints: (builder) => ({
    getExercisesByType: builder.query({
      query: (type) => ({
        url: 'global_exercises',
        method: 'GET',
        body: { type }, // Normally, GET requests don't have a body, consider using 'params'
      }),
    }),

  }),
});

export const { useGetExercisesByTypeQuery } = exercisesApi;
