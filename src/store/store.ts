import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { sessionsApi } from './api/sessionsApi';

export const store = configureStore({
  reducer: {
    [sessionsApi.reducerPath]: sessionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionsApi.middleware),
});

setupListeners(store.dispatch);
