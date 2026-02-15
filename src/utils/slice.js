//slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiWithoutAuth, apiWithAuth } from '../utils/api';
import { decodeTokenClaims } from './token';

const baseAuthState = {
    token: null,
    userId: null,
    role: null,
    stream: null,
    personId: null,
    tokenExpiry: null,
    redirectToHome: false,
    shouldRedirectToLogin: false,
};

const applyTokenToState = (state, token) => {
    state.token = token || null;
    state.redirectToHome = false;
    state.shouldRedirectToLogin = false;

    if (!token) {
        state.userId = null;
        state.role = null;
        state.stream = null;
        state.personId = null;
        state.tokenExpiry = null;
        return;
    }

    const claims = decodeTokenClaims(token);

    state.userId = claims?.userId ?? null;
    state.role = claims?.role ?? null;
    state.stream = claims?.stream ?? null;
    state.personId = claims?.personId ?? null;
    state.tokenExpiry = claims?.expiresAt ?? null;
};

export const buildInitialAuthState = () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const initialState = { ...baseAuthState, shouldRedirectToLogin: !storedToken };

    if (!storedToken) {
        return initialState;
    }

    const claims = decodeTokenClaims(storedToken);

    return {
        ...initialState,
        token: storedToken,
        userId: claims?.userId ?? null,
        role: claims?.role ?? null,
        stream: claims?.stream ?? null,
        personId: claims?.personId ?? null,
        tokenExpiry: claims?.expiresAt ?? null,
        shouldRedirectToLogin: false,
    };
};

export const loginAsync = createAsyncThunk(
    'auth/login',
    async (values, { rejectWithValue }) => { 
        try {
            const response = await apiWithoutAuth.post('auth/login', values);
            const token = response.data.token ?? response.data.Token;
            localStorage.setItem('token', token);
            console.log('Login Async: Token saved to localStorage:', token);
            return token;
        } catch (error) {
            console.error('Login Async Error:', error);
            return rejectWithValue('Failed to login. Please check your credentials.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: baseAuthState,
    reducers: {
        logout(state) {
            console.log('Logout Action: Removing token');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            state.token = null;
            state.redirectToHome = false;
            state.shouldRedirectToLogin = true;
            state.userId = null;
            state.role = null;
            state.stream = null;
            state.personId = null;
            state.tokenExpiry = null;
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
            applyTokenToState(state, action.payload);
        },
        updateToken(state, action) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload);
            }
            applyTokenToState(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginAsync.fulfilled, (state, action) => {
            applyTokenToState(state, action.payload);
            state.redirectToHome = true;
            state.shouldRedirectToLogin = false;
        })
        .addCase(loginAsync.rejected, (state) => {
            state.redirectToHome = false;
            state.shouldRedirectToLogin = true;
        });
    },
});

export const { resetRedirect, redirectToLogin, redirectToHome } = authSlice.actions;

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

export const { logout, updateToken, setToken } = authSlice.actions;

export default authSlice.reducer;