import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { sessionsApi } from './api/sessionsApi';

/* export const store = configureStore({
  reducer: {
    [sessionsApi.reducerPath]: sessionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionsApi.middleware),
}); */

export const store = configureStore({
  reducer: {
    [sessionsApi.reducerPath]: sessionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['sessionsApi.queries'],
        // Ignore these action types
        ignoredActions: ['sessionsApi/executeQuery/pending', 'sessionsApi/subscriptions/internal_probeSubscription']
      }
    }).concat(sessionsApi.middleware),
});


setupListeners(store.dispatch);
