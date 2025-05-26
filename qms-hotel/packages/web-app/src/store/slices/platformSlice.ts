import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Platform,
  PlatformDashboardData,
  PlatformAlert,
  MaintenanceWindow,
  PlatformActivity,
  SystemHealth,
  FinancialMetrics,
  UpdatePlatformSettingsInput,
  CreateMaintenanceWindowInput
} from '../../../../shared/types';
import { platformService } from '../../services/platformService';

interface PlatformState {
  // Configuración
  settings: Platform | null;
  
  // Dashboard
  dashboard: PlatformDashboardData | null;
  
  // Alertas
  alerts: PlatformAlert[];
  unreadAlertsCount: number;
  
  // Actividad
  recentActivity: PlatformActivity[];
  
  // Mantenimiento
  maintenanceWindows: MaintenanceWindow[];
  currentMaintenance: MaintenanceWindow | null;
  
  // Estado de carga
  loading: {
    settings: boolean;
    dashboard: boolean;
    alerts: boolean;
    activity: boolean;
    maintenance: boolean;
  };
  
  // Errores
  errors: {
    settings: string | null;
    dashboard: string | null;
    alerts: string | null;
    activity: string | null;
    maintenance: string | null;
  };
}

const initialState: PlatformState = {
  settings: null,
  dashboard: null,
  alerts: [],
  unreadAlertsCount: 0,
  recentActivity: [],
  maintenanceWindows: [],
  currentMaintenance: null,
  loading: {
    settings: false,
    dashboard: false,
    alerts: false,
    activity: false,
    maintenance: false
  },
  errors: {
    settings: null,
    dashboard: null,
    alerts: null,
    activity: null,
    maintenance: null
  }
};

// ======================
// ASYNC THUNKS
// ======================

export const loadPlatformSettings = createAsyncThunk(
  'platform/loadSettings',
  async () => {
    return await platformService.getPlatformSettings();
  }
);

export const updatePlatformSettings = createAsyncThunk(
  'platform/updateSettings',
  async (updates: UpdatePlatformSettingsInput) => {
    return await platformService.updatePlatformSettings(updates);
  }
);

export const loadPlatformDashboard = createAsyncThunk(
  'platform/loadDashboard',
  async () => {
    return await platformService.getPlatformDashboardData();
  }
);

export const loadPlatformAlerts = createAsyncThunk(
  'platform/loadAlerts',
  async () => {
    return await platformService.getActiveAlerts();
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'platform/acknowledgeAlert',
  async ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy: string }) => {
    await platformService.acknowledgeAlert(alertId, acknowledgedBy);
    return alertId;
  }
);

export const resolveAlert = createAsyncThunk(
  'platform/resolveAlert',
  async ({ alertId, resolvedBy }: { alertId: string; resolvedBy: string }) => {
    await platformService.resolveAlert(alertId, resolvedBy);
    return alertId;
  }
);

export const loadRecentActivity = createAsyncThunk(
  'platform/loadActivity',
  async (limit: number = 50) => {
    return await platformService.getRecentActivity(limit);
  }
);

export const logPlatformActivity = createAsyncThunk(
  'platform/logActivity',
  async (activity: Omit<PlatformActivity, 'id' | 'timestamp'>) => {
    await platformService.logActivity(activity);
    return activity;
  }
);

export const loadMaintenanceWindows = createAsyncThunk(
  'platform/loadMaintenance',
  async () => {
    return await platformService.getMaintenanceWindows();
  }
);

export const createMaintenanceWindow = createAsyncThunk(
  'platform/createMaintenance',
  async (data: CreateMaintenanceWindowInput) => {
    return await platformService.createMaintenanceWindow(data);
  }
);

export const updateMaintenanceWindow = createAsyncThunk(
  'platform/updateMaintenance',
  async ({ id, updates }: { id: string; updates: Partial<MaintenanceWindow> }) => {
    return await platformService.updateMaintenanceWindow(id, updates);
  }
);

// ======================
// SLICE
// ======================

const platformSlice = createSlice({
  name: 'platform',
  initialState,
  reducers: {
    clearPlatformErrors: (state) => {
      state.errors = {
        settings: null,
        dashboard: null,
        alerts: null,
        activity: null,
        maintenance: null
      };
    },
    
    markAlertsAsRead: (state) => {
      state.unreadAlertsCount = 0;
    },
    
    addRealtimeAlert: (state, action: PayloadAction<PlatformAlert>) => {
      state.alerts.unshift(action.payload);
      state.unreadAlertsCount += 1;
    },
    
    addRealtimeActivity: (state, action: PayloadAction<PlatformActivity>) => {
      state.recentActivity.unshift(action.payload);
      // Mantener solo los últimos 100 elementos
      if (state.recentActivity.length > 100) {
        state.recentActivity = state.recentActivity.slice(0, 100);
      }
    },
    
    setCurrentMaintenance: (state, action: PayloadAction<MaintenanceWindow | null>) => {
      state.currentMaintenance = action.payload;
    },
    
    updateSystemHealth: (state, action: PayloadAction<SystemHealth>) => {
      if (state.dashboard) {
        state.dashboard.systemHealth = action.payload;
      }
    },
    
    updateFinancialMetrics: (state, action: PayloadAction<FinancialMetrics>) => {
      if (state.dashboard) {
        state.dashboard.financialMetrics = action.payload;
      }
    }
  },
  
  extraReducers: (builder) => {
    // ======================
    // CONFIGURACIÓN
    // ======================
    builder
      .addCase(loadPlatformSettings.pending, (state) => {
        state.loading.settings = true;
        state.errors.settings = null;
      })
      .addCase(loadPlatformSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
      })
      .addCase(loadPlatformSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.errors.settings = action.error.message || 'Error cargando configuración';
      });
    
    builder
      .addCase(updatePlatformSettings.pending, (state) => {
        state.loading.settings = true;
        state.errors.settings = null;
      })
      .addCase(updatePlatformSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
      })
      .addCase(updatePlatformSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.errors.settings = action.error.message || 'Error actualizando configuración';
      });
    
    // ======================
    // DASHBOARD
    // ======================
    builder
      .addCase(loadPlatformDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.errors.dashboard = null;
      })
      .addCase(loadPlatformDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(loadPlatformDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.errors.dashboard = action.error.message || 'Error cargando dashboard';
      });
    
    // ======================
    // ALERTAS
    // ======================
    builder
      .addCase(loadPlatformAlerts.pending, (state) => {
        state.loading.alerts = true;
        state.errors.alerts = null;
      })
      .addCase(loadPlatformAlerts.fulfilled, (state, action) => {
        state.loading.alerts = false;
        state.alerts = action.payload;
        state.unreadAlertsCount = action.payload.filter(alert => 
          alert.status === 'active' && !alert.acknowledgedAt
        ).length;
      })
      .addCase(loadPlatformAlerts.rejected, (state, action) => {
        state.loading.alerts = false;
        state.errors.alerts = action.error.message || 'Error cargando alertas';
      });
    
    builder
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const alertIndex = state.alerts.findIndex(alert => alert.id === action.payload);
        if (alertIndex !== -1) {
          state.alerts[alertIndex].status = 'acknowledged';
          state.alerts[alertIndex].acknowledgedAt = new Date();
          state.unreadAlertsCount = Math.max(0, state.unreadAlertsCount - 1);
        }
      });
    
    builder
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const alertIndex = state.alerts.findIndex(alert => alert.id === action.payload);
        if (alertIndex !== -1) {
          state.alerts[alertIndex].status = 'resolved';
          state.alerts[alertIndex].resolvedAt = new Date();
        }
      });
    
    // ======================
    // ACTIVIDAD
    // ======================
    builder
      .addCase(loadRecentActivity.pending, (state) => {
        state.loading.activity = true;
        state.errors.activity = null;
      })
      .addCase(loadRecentActivity.fulfilled, (state, action) => {
        state.loading.activity = false;
        state.recentActivity = action.payload;
      })
      .addCase(loadRecentActivity.rejected, (state, action) => {
        state.loading.activity = false;
        state.errors.activity = action.error.message || 'Error cargando actividad';
      });
    
    builder
      .addCase(logPlatformActivity.fulfilled, (state, action) => {
        // La actividad se agregará automáticamente via addRealtimeActivity
        // cuando se reciba la notificación en tiempo real
      });
    
    // ======================
    // MANTENIMIENTO
    // ======================
    builder
      .addCase(loadMaintenanceWindows.pending, (state) => {
        state.loading.maintenance = true;
        state.errors.maintenance = null;
      })
      .addCase(loadMaintenanceWindows.fulfilled, (state, action) => {
        state.loading.maintenance = false;
        state.maintenanceWindows = action.payload;
        
        // Buscar mantenimiento actual
        const now = new Date();
        state.currentMaintenance = action.payload.find(window => 
          window.status === 'in_progress' ||
          (window.startTime <= now && window.endTime >= now)
        ) || null;
      })
      .addCase(loadMaintenanceWindows.rejected, (state, action) => {
        state.loading.maintenance = false;
        state.errors.maintenance = action.error.message || 'Error cargando mantenimiento';
      });
    
    builder
      .addCase(createMaintenanceWindow.fulfilled, (state, action) => {
        state.maintenanceWindows.unshift(action.payload);
      });
    
    builder
      .addCase(updateMaintenanceWindow.fulfilled, (state, action) => {
        const index = state.maintenanceWindows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceWindows[index] = action.payload;
          
          // Actualizar mantenimiento actual si es necesario
          if (action.payload.status === 'in_progress') {
            state.currentMaintenance = action.payload;
          } else if (state.currentMaintenance?.id === action.payload.id) {
            state.currentMaintenance = null;
          }
        }
      });
  }
});

// ======================
// ACTIONS Y SELECTORS
// ======================

export const {
  clearPlatformErrors,
  markAlertsAsRead,
  addRealtimeAlert,
  addRealtimeActivity,
  setCurrentMaintenance,
  updateSystemHealth,
  updateFinancialMetrics
} = platformSlice.actions;

// Selectors
export const selectPlatformSettings = (state: { platform: PlatformState }) => state.platform.settings;
export const selectPlatformDashboard = (state: { platform: PlatformState }) => state.platform.dashboard;
export const selectPlatformAlerts = (state: { platform: PlatformState }) => state.platform.alerts;
export const selectUnreadAlertsCount = (state: { platform: PlatformState }) => state.platform.unreadAlertsCount;
export const selectRecentActivity = (state: { platform: PlatformState }) => state.platform.recentActivity;
export const selectMaintenanceWindows = (state: { platform: PlatformState }) => state.platform.maintenanceWindows;
export const selectCurrentMaintenance = (state: { platform: PlatformState }) => state.platform.currentMaintenance;
export const selectPlatformLoading = (state: { platform: PlatformState }) => state.platform.loading;
export const selectPlatformErrors = (state: { platform: PlatformState }) => state.platform.errors;

export default platformSlice.reducer;