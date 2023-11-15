// ./store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../utils/slice'; 

const store = configureStore({
  reducer: {
      auth: authReducer,
  },
  preloadedState: {
      auth: {
          token: localStorage.getItem('token') || null,
          redirectToHome: false,
          shouldRedirectToLogin: !localStorage.getItem('token'),
      },
  },
});

export default store;
