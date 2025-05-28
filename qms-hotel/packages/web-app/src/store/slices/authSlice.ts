import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../../../shared/types';
import type { RootState } from '../store';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  requiresTwoFactor: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      // Convertir Timestamp a Date si existe
      const user = {
        ...action.payload,
        security: action.payload.security ? {
          ...action.payload.security,
          lastLoginAt: action.payload.security.lastLoginAt instanceof Date 
            ? action.payload.security.lastLoginAt 
            : new Date(action.payload.security.lastLoginAt.seconds * 1000)
        } : undefined
      };
      state.user = user;
      state.isLoading = false;
      state.error = null;
      state.requiresTwoFactor = false;
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.requiresTwoFactor = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    requireTwoFactor: (state) => {
      state.requiresTwoFactor = true;
      state.isLoading = false;
    },
    clearTwoFactor: (state) => {
      state.requiresTwoFactor = false;
    }
  }
});

export const {
  login,
  logout,
  setLoading,
  setError,
  requireTwoFactor,
  clearTwoFactor
} = authSlice.actions;

// Selectores
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectRequiresTwoFactor = (state: RootState) => state.auth.requiresTwoFactor;

export default authSlice.reducer;