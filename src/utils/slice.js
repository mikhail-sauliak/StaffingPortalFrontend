//slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiWithoutAuth, apiWithAuth } from '../utils/api';

export const loginAsync = createAsyncThunk(
    'auth/login',
    async (values, { dispatch, rejectWithValue }) => { 
        try {
            const response = await apiWithoutAuth.post('auth/login', values);
            localStorage.setItem('token', response.data.token);
            console.log('Login Async: Token saved to localStorage:', response.data.token);
            dispatch(redirectToHome());
            return response.data.token;
        } catch (error) {
            console.error('Login Async Error:', error);
            return rejectWithValue('Failed to login. Please check your credentials.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, redirectToHome: false, shouldRedirectToLogin: false },
    reducers: {
        logout(state) {
            console.log('Logout Action: Removing token');
            state.token = null;
            state.redirectToHome = false;
            state.shouldRedirectToLogin = true;
        },
        resetRedirect(state) {
            state.redirectToHome = false;
        },
        redirectToHome(state) {
            state.redirectToHome = true;
        },
        redirectToLogin(state) {
            state.shouldRedirectToLogin = true;
        },
        setToken(state, action) {
            state.token = action.payload;
        },
        updateToken(state, action) {
            state.token = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginAsync.fulfilled, (state, action) => {
            state.token = action.payload;
            state.redirectToHome = true;
            state.shouldRedirectToLogin = false;
        })
        .addCase(loginAsync.rejected, (state, action) => {
            state.redirectToHome = false;
        });
    },
});

export const { resetRedirect, redirectToLogin } = authSlice.actions;

export const fetchSalaryReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiWithAuth.get('salaryreview');
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch reviews.');
        }
    }
);

export const changePasswordAsync = createAsyncThunk(
    'auth/changePassword',
    async (passwords, { rejectWithValue }) => {
        try {
            await apiWithAuth.post('/auth/change-password', passwords);
        } catch (error) {
            return rejectWithValue('Failed to change password.');
        }
    }
);

export const redirectToHome = () => ({
    type: 'REDIRECT_TO_HOME'
  });

export const { logout } = authSlice.actions;
export const { updateToken } = authSlice.actions;

export default authSlice.reducer;