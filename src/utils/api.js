// api.js
import axios from 'axios';
import store from '../store/index';
import { redirectToLogin, logout } from './slice.js';
import { toast } from 'react-toastify';

const token = localStorage.getItem('token');


export const apiWithAuth = axios.create({
    baseURL: 'http://localhost:5000/api/',
    headers: token ? { 'Authorization': `Bearer ${token}`,
                       'Cache-Control': 'no-cache', } : {}
});

export const apiWithoutAuth = axios.create({
    baseURL: 'http://localhost:5000/api/'
});

apiWithAuth.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Interceptor Request: Token from localStorage', token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Interceptor Request Error:', error);
        return Promise.reject(error);
    }
  );
  
  apiWithAuth.interceptors.response.use(
      (response) => {
          return response;
      },
      (error) => {
          if (error.response && error.response.status === 401) {
              console.error('Interceptor Response: Unauthorized, removing token');
              localStorage.removeItem('token'); 
              store.dispatch(logout());
              toast.error("Your session has expired. Please log in again.");
              store.dispatch(redirectToLogin());
          }
          return Promise.reject(error);
      }
  );
