import { createApi } from '@reduxjs/toolkit/query/react';
import { db } from '../../../firebase-config';
import { addDoc, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseBaseQuery = async ({ baseUrl, url, method, body }) => {
  switch (method) {
    case 'GET':
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
          date: sessionData.date?.toDate ? sessionData.date.toDate().toISOString() : sessionData.date, // CHANGED
          exercises: exercisesData
        };
      }));
      return { data: sessionsData };

    case 'POST':
      const docRef = await addDoc(collection(db, url), body);
      return { data: { id: docRef.id, ...body } };

    default:
      throw new Error(`Unhandled method ${method}`);
  }

};

export const sessionsApi = createApi({
  reducerPath: 'sessionsApi',
  baseQuery: firebaseBaseQuery,
  tagTypes: ['Sessions'],
  endpoints: (builder) => ({
    createSession: builder.mutation({
      query: ({ session }) => ({
        baseUrl: '',
        url: 'sessions',
        method: 'POST',
        body: session
      }),
    }),
    //Get all sessions
    getSessions: builder.query({
      query: () => ({
        baseUrl: '',
        url: 'sessions',
        method: 'GET',
        body: ''
      }),
    }),

  }),
});



export const { useCreateSessionMutation, useGetSessionsQuery } = sessionsApi;
