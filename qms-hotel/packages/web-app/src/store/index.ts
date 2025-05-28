import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import hotelSlice from './slices/hotelSlice';
import companySlice from './slices/companySlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import platformSlice from './slices/platformSlice';
import organizationSlice from './slices/organizationSlice';
import subscriptionSlice from './slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    hotel: hotelSlice,
    company: companySlice,
    ui: uiSlice,
    user: userSlice,
    platform: platformSlice,
    organizations: organizationSlice,
    subscriptions: subscriptionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: [
          // Auth slice
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'auth.user.lastLoginAt',
          // Platform slice
          'platform.settings.createdAt',
          'platform.settings.updatedAt',
          'platform.dashboard.statistics.lastCalculated',
          'platform.alerts',
          'platform.recentActivity',
          'platform.maintenanceWindows',
          'platform.currentMaintenance',
          // Organizations slice
          'organizations.organizations',
          'organizations.currentOrganization',
          'organizations.organizationMetrics',
          // Subscriptions slice
          'subscriptions.subscriptions',
          'subscriptions.currentSubscription',
          'subscriptions.subscriptionEvents',
          // Hotel slice
          'hotel.hotels',
          'hotel.currentHotel',
          // Company slice
          'company.companies',
          'company.selectedCompany',
          // User slice
          'user.users',
          'user.currentUser'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;