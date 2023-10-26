import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiWithoutAuth, apiWithAuth } from '../utils/api';

export const loginAsync = createAsyncThunk(
    'auth/login',
    async (values, { dispatch, rejectWithValue }) => { 
        try {
            const response = await apiWithoutAuth.post('/auth/login', values);
            localStorage.setItem('token', response.data.token);
            dispatch(redirectToHome());
            return response.data.token;
        } catch (error) {
            return rejectWithValue('Failed to login. Please check your credentials.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, redirectToHome: false, shouldRedirectToLogin: false },
    reducers: {
        logout(state) {
            state.token = null;
        },
        resetRedirect(state) {
            state.redirectToHome = false; 
            state.shouldRedirectToLogin = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginAsync.fulfilled, (state, action) => {
            state.token = action.payload;
            state.redirectToHome = true;
        });
    },
});

export const { resetRedirect } = authSlice.actions;

export const fetchSalaryReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiWithAuth.get('api/salaryreview');
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

export default authSlice.reducer;