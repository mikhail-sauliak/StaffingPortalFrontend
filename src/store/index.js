import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../utils/slice'; 

const preloadedState = {
  auth: {
    token: localStorage.getItem('token') || null,
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState, 
});

export default store;
