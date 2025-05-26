import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    autoHideDuration?: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  modals: {},
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },
    clearComponentLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.components[action.payload];
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date(),
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<{ modalId: string; data?: any }>) => {
      state.modals[action.payload.modalId] = {
        open: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].open = false;
        delete state.modals[action.payload].data;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalId => {
        state.modals[modalId].open = false;
        delete state.modals[modalId].data;
      });
    },

    // Snackbar
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity?: 'success' | 'error' | 'warning' | 'info';
      autoHideDuration?: number;
    }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        autoHideDuration: action.payload.autoHideDuration,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },

    // Reset
    resetUIState: () => initialState,
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  closeAllModals,
  showSnackbar,
  hideSnackbar,
  resetUIState,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectUnreadNotificationsCount = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.read).length;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.loading.global;
export const selectComponentLoading = (state: { ui: UIState }, component: string) => 
  state.ui.loading.components[component] || false;
export const selectModal = (state: { ui: UIState }, modalId: string) => 
  state.ui.modals[modalId] || { open: false };
export const selectSnackbar = (state: { ui: UIState }) => state.ui.snackbar;

export default uiSlice.reducer;