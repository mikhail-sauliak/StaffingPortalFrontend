// api.js
import axios from 'axios';
import store from '../store/index';
import { resetRedirect } from './slice.js';

const token = localStorage.getItem('token');


export const apiWithAuth = axios.create({
    baseURL: 'https://staffportalbackend.azurewebsites.net/',
    headers: token ? { 'Authorization': `Bearer ${token}`,
                       'Cache-Control': 'no-cache', } : {}
});

export const apiWithoutAuth = axios.create({
    baseURL: 'https://staffportalbackend.azurewebsites.net/'
});

apiWithAuth.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
  },
  (error) => Promise.reject(error)
);

apiWithAuth.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            store.dispatch(resetRedirect(true));
        }
        return Promise.reject(error);
    }
);
