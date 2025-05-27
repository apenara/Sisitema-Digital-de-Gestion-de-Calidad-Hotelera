import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionMetrics,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionEvent
} from '../../../../shared/types/Subscription';
import { subscriptionService } from '../../services/subscriptionService';

interface SubscriptionState {
  // Planes
  plans: SubscriptionPlan[];
  
  // Subscripciones
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  
  // Métricas
  globalMetrics: SubscriptionMetrics | null;
  
  // Eventos
  subscriptionEvents: Record<string, SubscriptionEvent[]>; // subscriptionId -> events
  
  // Filtros y búsqueda
  filters: {
    status: string[];
    planType: string[];
    organizationId?: string;
    hotelId?: string;
  };
  
  // Paginación
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    hasMore: boolean;
  };
  
  // Estado de carga
  loading: {
    plans: boolean;
    subscriptions: boolean;
    currentSubscription: boolean;
    metrics: boolean;
    events: Record<string, boolean>; // subscriptionId -> loading
    creating: boolean;
    updating: boolean;
    canceling: boolean;
    reactivating: boolean;
  };
  
  // Errores
  errors: {
    plans: string | null;
    subscriptions: string | null;
    currentSubscription: string | null;
    metrics: string | null;
    events: Record<string, string | null>;
    creating: string | null;
    updating: string | null;
    canceling: string | null;
    reactivating: string | null;
  };
  
  // UI State
  selectedPlanForUpgrade: SubscriptionPlan | null;
  showUpgradeModal: boolean;
  showCancelModal: boolean;
}

const initialState: SubscriptionState = {
  plans: [],
  subscriptions: [],
  currentSubscription: null,
  globalMetrics: null,
  subscriptionEvents: {},
  filters: {
    status: [],
    planType: []
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    hasMore: true
  },
  loading: {
    plans: false,
    subscriptions: false,
    currentSubscription: false,
    metrics: false,
    events: {},
    creating: false,
    updating: false,
    canceling: false,
    reactivating: false
  },
  errors: {
    plans: null,
    subscriptions: null,
    currentSubscription: null,
    metrics: null,
    events: {},
    creating: null,
    updating: null,
    canceling: null,
    reactivating: null
  },
  selectedPlanForUpgrade: null,
  showUpgradeModal: false,
  showCancelModal: false
};

// ======================
// ASYNC THUNKS
// ======================

export const loadSubscriptionPlans = createAsyncThunk(
  'subscriptions/loadPlans',
  async (includeInactive: boolean = false) => {
    return await subscriptionService.getPlans(includeInactive);
  }
);

export const createSubscriptionPlan = createAsyncThunk(
  'subscriptions/createPlan',
  async (plan: Omit<SubscriptionPlan, 'id'>) => {
    return await subscriptionService.createPlan(plan);
  }
);

export const updateSubscriptionPlan = createAsyncThunk(
  'subscriptions/updatePlan',
  async ({ planId, updates }: { planId: string; updates: Partial<SubscriptionPlan> }) => {
    return await subscriptionService.updatePlan(planId, updates);
  }
);

export const initializeDefaultPlans = createAsyncThunk(
  'subscriptions/initializeDefaultPlans',
  async () => {
    await subscriptionService.initializeDefaultPlans();
    return await subscriptionService.getPlans(false);
  }
);

export const loadActiveSubscriptions = createAsyncThunk(
  'subscriptions/loadActive',
  async (limit?: number) => {
    return await subscriptionService.getActiveSubscriptions(limit);
  }
);

export const loadSubscription = createAsyncThunk(
  'subscriptions/loadOne',
  async (subscriptionId: string) => {
    return await subscriptionService.getSubscription(subscriptionId);
  }
);

export const loadSubscriptionsByOrganization = createAsyncThunk(
  'subscriptions/loadByOrganization',
  async (organizationId: string) => {
    return await subscriptionService.getSubscriptionsByOrganization(organizationId);
  }
);

export const loadSubscriptionByHotel = createAsyncThunk(
  'subscriptions/loadByHotel',
  async (hotelId: string) => {
    return await subscriptionService.getSubscriptionByHotel(hotelId);
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async ({ data, createdBy }: { data: CreateSubscriptionInput; createdBy: string }) => {
    return await subscriptionService.createSubscription(data, createdBy);
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ subscriptionId, updates }: { subscriptionId: string; updates: UpdateSubscriptionInput }) => {
    return await subscriptionService.updateSubscription(subscriptionId, updates);
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancel',
  async ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) => {
    return await subscriptionService.cancelSubscription(subscriptionId, reason);
  }
);

export const reactivateSubscription = createAsyncThunk(
  'subscriptions/reactivate',
  async (subscriptionId: string) => {
    return await subscriptionService.reactivateSubscription(subscriptionId);
  }
);

export const loadSubscriptionMetrics = createAsyncThunk(
  'subscriptions/loadMetrics',
  async () => {
    return await subscriptionService.getSubscriptionMetrics();
  }
);

export const loadSubscriptionEvents = createAsyncThunk(
  'subscriptions/loadEvents',
  async ({ subscriptionId, limit }: { subscriptionId: string; limit?: number }) => {
    const events = await subscriptionService.getSubscriptionEvents(subscriptionId, limit);
    return { subscriptionId, events };
  }
);

export const checkSubscriptionLimits = createAsyncThunk(
  'subscriptions/checkLimits',
  async (subscriptionId: string) => {
    return await subscriptionService.checkLimits(subscriptionId);
  }
);

export const updateSubscriptionUsage = createAsyncThunk(
  'subscriptions/updateUsage',
  async (subscriptionId: string) => {
    return await subscriptionService.calculateUsageForSubscription(subscriptionId);
  }
);

export const processExpiringTrials = createAsyncThunk(
  'subscriptions/processExpiringTrials',
  async () => {
    await subscriptionService.processExpiringTrials();
    return true;
  }
);

// ======================
// SLICE
// ======================

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearSubscriptionErrors: (state) => {
      state.errors = {
        plans: null,
        subscriptions: null,
        currentSubscription: null,
        metrics: null,
        events: {},
        creating: null,
        updating: null,
        canceling: null,
        reactivating: null
      };
    },
    
    setSubscriptionFilters: (state, action: PayloadAction<Partial<SubscriptionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearSubscriptionFilters: (state) => {
      state.filters = {
        status: [],
        planType: []
      };
    },
    
    setSubscriptionPagination: (state, action: PayloadAction<Partial<SubscriptionState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setCurrentSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.currentSubscription = action.payload;
    },
    
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
    
    // UI State Management
    setSelectedPlanForUpgrade: (state, action: PayloadAction<SubscriptionPlan | null>) => {
      state.selectedPlanForUpgrade = action.payload;
    },
    
    showUpgradeModal: (state) => {
      state.showUpgradeModal = true;
    },
    
    hideUpgradeModal: (state) => {
      state.showUpgradeModal = false;
      state.selectedPlanForUpgrade = null;
    },
    
    showCancelModal: (state) => {
      state.showCancelModal = true;
    },
    
    hideCancelModal: (state) => {
      state.showCancelModal = false;
    },
    
    // Actualización en tiempo real
    updateSubscriptionInList: (state, action: PayloadAction<Subscription>) => {
      const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
      
      if (state.currentSubscription?.id === action.payload.id) {
        state.currentSubscription = action.payload;
      }
    },
    
    addSubscriptionEvent: (state, action: PayloadAction<{ subscriptionId: string; event: SubscriptionEvent }>) => {
      const { subscriptionId, event } = action.payload;
      if (!state.subscriptionEvents[subscriptionId]) {
        state.subscriptionEvents[subscriptionId] = [];
      }
      state.subscriptionEvents[subscriptionId].unshift(event);
    },
    
    updateGlobalMetrics: (state, action: PayloadAction<SubscriptionMetrics>) => {
      state.globalMetrics = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    // ======================
    // PLANES
    // ======================
    builder
      .addCase(loadSubscriptionPlans.pending, (state) => {
        state.loading.plans = true;
        state.errors.plans = null;
      })
      .addCase(loadSubscriptionPlans.fulfilled, (state, action) => {
        state.loading.plans = false;
        state.plans = action.payload;
      })
      .addCase(loadSubscriptionPlans.rejected, (state, action) => {
        state.loading.plans = false;
        state.errors.plans = action.error.message || 'Error cargando planes';
      });
    
    builder
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      });
    
    builder
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      });
    
    builder
      .addCase(initializeDefaultPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      });
    
    // ======================
    // SUBSCRIPCIONES
    // ======================
    builder
      .addCase(loadActiveSubscriptions.pending, (state) => {
        state.loading.subscriptions = true;
        state.errors.subscriptions = null;
      })
      .addCase(loadActiveSubscriptions.fulfilled, (state, action) => {
        state.loading.subscriptions = false;
        state.subscriptions = action.payload;
        state.pagination.totalItems = action.payload.length;
      })
      .addCase(loadActiveSubscriptions.rejected, (state, action) => {
        state.loading.subscriptions = false;
        state.errors.subscriptions = action.error.message || 'Error cargando subscripciones';
      });
    
    builder
      .addCase(loadSubscription.pending, (state) => {
        state.loading.currentSubscription = true;
        state.errors.currentSubscription = null;
      })
      .addCase(loadSubscription.fulfilled, (state, action) => {
        state.loading.currentSubscription = false;
        state.currentSubscription = action.payload;
      })
      .addCase(loadSubscription.rejected, (state, action) => {
        state.loading.currentSubscription = false;
        state.errors.currentSubscription = action.error.message || 'Error cargando subscripción';
      });
    
    builder
      .addCase(loadSubscriptionsByOrganization.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
        state.pagination.totalItems = action.payload.length;
      });
    
    builder
      .addCase(loadSubscriptionByHotel.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentSubscription = action.payload;
        }
      });
    
    // ======================
    // CREAR SUBSCRIPCIÓN
    // ======================
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading.creating = true;
        state.errors.creating = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.subscriptions.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading.creating = false;
        state.errors.creating = action.error.message || 'Error creando subscripción';
      });
    
    // ======================
    // ACTUALIZAR SUBSCRIPCIÓN
    // ======================
    builder
      .addCase(updateSubscription.pending, (state) => {
        state.loading.updating = true;
        state.errors.updating = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        
        if (state.currentSubscription?.id === action.payload.id) {
          state.currentSubscription = action.payload;
        }
        
        // Cerrar modal de upgrade si estaba abierto
        state.showUpgradeModal = false;
        state.selectedPlanForUpgrade = null;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.updating = action.error.message || 'Error actualizando subscripción';
      });
    
    // ======================
    // CANCELAR SUBSCRIPCIÓN
    // ======================
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading.canceling = true;
        state.errors.canceling = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading.canceling = false;
        
        const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        
        if (state.currentSubscription?.id === action.payload.id) {
          state.currentSubscription = action.payload;
        }
        
        // Cerrar modal de cancelación
        state.showCancelModal = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading.canceling = false;
        state.errors.canceling = action.error.message || 'Error cancelando subscripción';
      });
    
    // ======================
    // REACTIVAR SUBSCRIPCIÓN
    // ======================
    builder
      .addCase(reactivateSubscription.pending, (state) => {
        state.loading.reactivating = true;
        state.errors.reactivating = null;
      })
      .addCase(reactivateSubscription.fulfilled, (state, action) => {
        state.loading.reactivating = false;
        
        const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        
        if (state.currentSubscription?.id === action.payload.id) {
          state.currentSubscription = action.payload;
        }
      })
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.loading.reactivating = false;
        state.errors.reactivating = action.error.message || 'Error reactivando subscripción';
      });
    
    // ======================
    // MÉTRICAS
    // ======================
    builder
      .addCase(loadSubscriptionMetrics.pending, (state) => {
        state.loading.metrics = true;
        state.errors.metrics = null;
      })
      .addCase(loadSubscriptionMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.globalMetrics = action.payload;
      })
      .addCase(loadSubscriptionMetrics.rejected, (state, action) => {
        state.loading.metrics = false;
        state.errors.metrics = action.error.message || 'Error cargando métricas';
      });
    
    // ======================
    // EVENTOS
    // ======================
    builder
      .addCase(loadSubscriptionEvents.pending, (state, action) => {
        const subscriptionId = action.meta.arg.subscriptionId;
        state.loading.events[subscriptionId] = true;
        state.errors.events[subscriptionId] = null;
      })
      .addCase(loadSubscriptionEvents.fulfilled, (state, action) => {
        const { subscriptionId, events } = action.payload;
        state.loading.events[subscriptionId] = false;
        state.subscriptionEvents[subscriptionId] = events;
      })
      .addCase(loadSubscriptionEvents.rejected, (state, action) => {
        const subscriptionId = action.meta.arg.subscriptionId;
        state.loading.events[subscriptionId] = false;
        state.errors.events[subscriptionId] = action.error.message || 'Error cargando eventos';
      });
    
    // ======================
    // LÍMITES Y USO
    // ======================
    builder
      .addCase(checkSubscriptionLimits.fulfilled, (state, action) => {
        // Manejar alertas de límites si es necesario
        const { exceeded, warnings } = action.payload;
        if (exceeded && warnings.length > 0) {
          console.warn('Límites de subscripción excedidos:', warnings);
        }
      });
    
    builder
      .addCase(updateSubscriptionUsage.fulfilled, (state, action) => {
        // Actualizar el uso en la subscripción actual si corresponde
        if (state.currentSubscription) {
          state.currentSubscription.usage = action.payload;
        }
      });
    
    // ======================
    // UTILIDADES
    // ======================
    builder
      .addCase(processExpiringTrials.fulfilled, (state) => {
        // Podría disparar una recarga de subscripciones activas
        console.log('Procesamiento de trials expirados completado');
      });
  }
});

// ======================
// ACTIONS Y SELECTORS
// ======================

export const {
  clearSubscriptionErrors,
  setSubscriptionFilters,
  clearSubscriptionFilters,
  setSubscriptionPagination,
  setCurrentSubscription,
  clearCurrentSubscription,
  setSelectedPlanForUpgrade,
  showUpgradeModal,
  hideUpgradeModal,
  showCancelModal,
  hideCancelModal,
  updateSubscriptionInList,
  addSubscriptionEvent,
  updateGlobalMetrics
} = subscriptionSlice.actions;

// Selectors básicos
export const selectSubscriptionPlans = (state: { subscriptions: SubscriptionState }) => state.subscriptions.plans;
export const selectSubscriptions = (state: { subscriptions: SubscriptionState }) => state.subscriptions.subscriptions;
export const selectCurrentSubscription = (state: { subscriptions: SubscriptionState }) => state.subscriptions.currentSubscription;
export const selectGlobalMetrics = (state: { subscriptions: SubscriptionState }) => state.subscriptions.globalMetrics;
export const selectSubscriptionEvents = (state: { subscriptions: SubscriptionState }, subscriptionId: string) => 
  state.subscriptions.subscriptionEvents[subscriptionId] || [];
export const selectSubscriptionFilters = (state: { subscriptions: SubscriptionState }) => state.subscriptions.filters;
export const selectSubscriptionPagination = (state: { subscriptions: SubscriptionState }) => state.subscriptions.pagination;
export const selectSubscriptionLoading = (state: { subscriptions: SubscriptionState }) => state.subscriptions.loading;
export const selectSubscriptionErrors = (state: { subscriptions: SubscriptionState }) => state.subscriptions.errors;
export const selectSelectedPlanForUpgrade = (state: { subscriptions: SubscriptionState }) => state.subscriptions.selectedPlanForUpgrade;
export const selectShowUpgradeModal = (state: { subscriptions: SubscriptionState }) => state.subscriptions.showUpgradeModal;
export const selectShowCancelModal = (state: { subscriptions: SubscriptionState }) => state.subscriptions.showCancelModal;

// Selectors avanzados
export const selectActiveSubscriptionPlans = (state: { subscriptions: SubscriptionState }) => {
  return state.subscriptions.plans.filter(plan => plan.isActive);
};

export const selectPublicSubscriptionPlans = (state: { subscriptions: SubscriptionState }) => {
  return state.subscriptions.plans.filter(plan => plan.isActive && plan.isPublic);
};

export const selectFilteredSubscriptions = (state: { subscriptions: SubscriptionState }) => {
  const { subscriptions, filters } = state.subscriptions;
  
  return subscriptions.filter(subscription => {
    // Filtro por estado
    if (filters.status.length > 0 && !filters.status.includes(subscription.status)) {
      return false;
    }
    
    // Filtro por tipo de plan
    if (filters.planType.length > 0 && !filters.planType.includes(subscription.plan.type)) {
      return false;
    }
    
    // Filtro por organización
    if (filters.organizationId && subscription.organizationId !== filters.organizationId) {
      return false;
    }
    
    // Filtro por hotel
    if (filters.hotelId && subscription.hotelId !== filters.hotelId) {
      return false;
    }
    
    return true;
  });
};

export const selectSubscriptionsByStatus = (state: { subscriptions: SubscriptionState }) => {
  const subscriptions = state.subscriptions.subscriptions;
  
  return subscriptions.reduce((acc, subscription) => {
    acc[subscription.status] = (acc[subscription.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const selectSubscriptionsByPlan = (state: { subscriptions: SubscriptionState }) => {
  const subscriptions = state.subscriptions.subscriptions;
  
  return subscriptions.reduce((acc, subscription) => {
    const planName = subscription.plan.name;
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const selectTotalMonthlyRevenue = (state: { subscriptions: SubscriptionState }) => {
  const subscriptions = state.subscriptions.subscriptions;
  
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => {
      const amount = sub.plan.pricing.amount;
      return total + (sub.plan.pricing.interval === 'yearly' ? amount / 12 : amount);
    }, 0);
};

export const selectExpiredTrials = (state: { subscriptions: SubscriptionState }) => {
  const subscriptions = state.subscriptions.subscriptions;
  const now = new Date();
  
  return subscriptions.filter(sub => 
    sub.status === 'trialing' && 
    sub.currentPeriodEnd < now
  );
};

export const selectUpcomingRenewals = (state: { subscriptions: SubscriptionState }) => {
  const subscriptions = state.subscriptions.subscriptions;
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return subscriptions.filter(sub => 
    sub.status === 'active' && 
    sub.currentPeriodEnd <= nextWeek
  );
};

export default subscriptionSlice.reducer;