// ./store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { buildInitialAuthState } from '../utils/slice'; 

const store = configureStore({
  reducer: {
      auth: authReducer,
  },
  preloadedState: {
      auth: buildInitialAuthState(),
  },
});

export default store;
