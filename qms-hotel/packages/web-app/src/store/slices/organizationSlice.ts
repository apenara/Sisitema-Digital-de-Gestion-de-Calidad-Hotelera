import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Organization,
  OrganizationMetrics,
  OrganizationUser,
  CreateOrganizationInput,
  UpdateOrganizationInput
} from '../../../../shared/types/Organization';
import type { HotelListItem } from '../../../../shared/types';
import { organizationService } from '../../services/organizationService';

interface OrganizationState {
  // Datos principales
  organizations: Organization[];
  currentOrganization: Organization | null;
  
  // Usuarios de organizaciones
  organizationUsers: Record<string, OrganizationUser[]>; // organizationId -> users
  
  // Hoteles de organizaciones
  organizationHotels: Record<string, HotelListItem[]>; // organizationId -> hotels
  
  // Métricas
  organizationMetrics: Record<string, OrganizationMetrics>; // organizationId -> metrics
  
  // Estado de búsqueda y filtros
  searchQuery: string;
  filters: {
    type: string[];
    status: string[];
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
    organizations: boolean;
    currentOrganization: boolean;
    users: Record<string, boolean>; // organizationId -> loading
    hotels: Record<string, boolean>; // organizationId -> loading
    metrics: Record<string, boolean>; // organizationId -> loading
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };
  
  // Errores
  errors: {
    organizations: string | null;
    currentOrganization: string | null;
    users: Record<string, string | null>;
    hotels: Record<string, string | null>;
    metrics: Record<string, string | null>;
    creating: string | null;
    updating: string | null;
    deleting: string | null;
  };
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  organizationUsers: {},
  organizationHotels: {},
  organizationMetrics: {},
  searchQuery: '',
  filters: {
    type: [],
    status: []
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    hasMore: true
  },
  loading: {
    organizations: false,
    currentOrganization: false,
    users: {},
    hotels: {},
    metrics: {},
    creating: false,
    updating: false,
    deleting: false
  },
  errors: {
    organizations: null,
    currentOrganization: null,
    users: {},
    hotels: {},
    metrics: {},
    creating: null,
    updating: null,
    deleting: null
  }
};

// ======================
// ASYNC THUNKS
// ======================

export const loadOrganizations = createAsyncThunk(
  'organizations/loadAll',
  async (limit?: number) => {
    return await organizationService.getOrganizations(limit);
  }
);

export const loadOrganization = createAsyncThunk(
  'organizations/loadOne',
  async (organizationId: string) => {
    return await organizationService.getOrganization(organizationId);
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async ({ data, createdBy }: { data: CreateOrganizationInput; createdBy: string }) => {
    return await organizationService.createOrganization(data, createdBy);
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, updates }: { id: string; updates: UpdateOrganizationInput }) => {
    return await organizationService.updateOrganization(id, updates);
  }
);

export const deleteOrganization = createAsyncThunk(
  'organizations/delete',
  async (organizationId: string) => {
    await organizationService.deleteOrganization(organizationId);
    return organizationId;
  }
);

export const searchOrganizations = createAsyncThunk(
  'organizations/search',
  async (searchQuery: string) => {
    return await organizationService.searchOrganizations(searchQuery);
  }
);

export const loadOrganizationUsers = createAsyncThunk(
  'organizations/loadUsers',
  async (organizationId: string) => {
    const users = await organizationService.getOrganizationUsers(organizationId);
    return { organizationId, users };
  }
);

export const addUserToOrganization = createAsyncThunk(
  'organizations/addUser',
  async ({ 
    organizationId, 
    userId, 
    role, 
    invitedBy 
  }: { 
    organizationId: string; 
    userId: string; 
    role: OrganizationUser['role']; 
    invitedBy: string; 
  }) => {
    const orgUser = await organizationService.addUserToOrganization(organizationId, userId, role, invitedBy);
    return { organizationId, orgUser };
  }
);

export const removeUserFromOrganization = createAsyncThunk(
  'organizations/removeUser',
  async ({ organizationId, userId }: { organizationId: string; userId: string }) => {
    await organizationService.removeUserFromOrganization(organizationId, userId);
    return { organizationId, userId };
  }
);

export const updateUserRole = createAsyncThunk(
  'organizations/updateUserRole',
  async ({ 
    organizationId, 
    userId, 
    newRole 
  }: { 
    organizationId: string; 
    userId: string; 
    newRole: OrganizationUser['role']; 
  }) => {
    await organizationService.updateUserRole(organizationId, userId, newRole);
    return { organizationId, userId, newRole };
  }
);

export const loadOrganizationHotels = createAsyncThunk(
  'organizations/loadHotels',
  async (organizationId: string) => {
    const hotels = await organizationService.getOrganizationHotels(organizationId);
    return { organizationId, hotels };
  }
);

export const addHotelToOrganization = createAsyncThunk(
  'organizations/addHotel',
  async ({ 
    organizationId, 
    hotelId, 
    addedBy 
  }: { 
    organizationId: string; 
    hotelId: string; 
    addedBy: string; 
  }) => {
    await organizationService.addHotelToOrganization(organizationId, hotelId, addedBy);
    return { organizationId, hotelId };
  }
);

export const removeHotelFromOrganization = createAsyncThunk(
  'organizations/removeHotel',
  async ({ organizationId, hotelId }: { organizationId: string; hotelId: string }) => {
    await organizationService.removeHotelFromOrganization(organizationId, hotelId);
    return { organizationId, hotelId };
  }
);

export const loadOrganizationMetrics = createAsyncThunk(
  'organizations/loadMetrics',
  async (organizationId: string) => {
    const metrics = await organizationService.getOrganizationMetrics(organizationId);
    return { organizationId, metrics };
  }
);

export const loadUserOrganizations = createAsyncThunk(
  'organizations/loadUserOrganizations',
  async (userId: string) => {
    return await organizationService.getUserOrganizations(userId);
  }
);

// ======================
// SLICE
// ======================

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearOrganizationErrors: (state) => {
      state.errors = {
        organizations: null,
        currentOrganization: null,
        users: {},
        hotels: {},
        metrics: {},
        creating: null,
        updating: null,
        deleting: null
      };
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<OrganizationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        type: [],
        status: []
      };
      state.searchQuery = '';
    },
    
    setPagination: (state, action: PayloadAction<Partial<OrganizationState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setCurrentOrganization: (state, action: PayloadAction<Organization | null>) => {
      state.currentOrganization = action.payload;
    },
    
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    
    // Actualización en tiempo real
    updateOrganizationInList: (state, action: PayloadAction<Organization>) => {
      const index = state.organizations.findIndex(org => org.id === action.payload.id);
      if (index !== -1) {
        state.organizations[index] = action.payload;
      }
      
      if (state.currentOrganization?.id === action.payload.id) {
        state.currentOrganization = action.payload;
      }
    },
    
    removeOrganizationFromList: (state, action: PayloadAction<string>) => {
      state.organizations = state.organizations.filter(org => org.id !== action.payload);
      
      if (state.currentOrganization?.id === action.payload) {
        state.currentOrganization = null;
      }
    }
  },
  
  extraReducers: (builder) => {
    // ======================
    // CARGAR ORGANIZACIONES
    // ======================
    builder
      .addCase(loadOrganizations.pending, (state) => {
        state.loading.organizations = true;
        state.errors.organizations = null;
      })
      .addCase(loadOrganizations.fulfilled, (state, action) => {
        state.loading.organizations = false;
        state.organizations = action.payload;
        state.pagination.totalItems = action.payload.length;
      })
      .addCase(loadOrganizations.rejected, (state, action) => {
        state.loading.organizations = false;
        state.errors.organizations = action.error.message || 'Error cargando organizaciones';
      });
    
    // ======================
    // CARGAR ORGANIZACIÓN INDIVIDUAL
    // ======================
    builder
      .addCase(loadOrganization.pending, (state) => {
        state.loading.currentOrganization = true;
        state.errors.currentOrganization = null;
      })
      .addCase(loadOrganization.fulfilled, (state, action) => {
        state.loading.currentOrganization = false;
        state.currentOrganization = action.payload;
      })
      .addCase(loadOrganization.rejected, (state, action) => {
        state.loading.currentOrganization = false;
        state.errors.currentOrganization = action.error.message || 'Error cargando organización';
      });
    
    // ======================
    // CREAR ORGANIZACIÓN
    // ======================
    builder
      .addCase(createOrganization.pending, (state) => {
        state.loading.creating = true;
        state.errors.creating = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.organizations.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading.creating = false;
        state.errors.creating = action.error.message || 'Error creando organización';
      });
    
    // ======================
    // ACTUALIZAR ORGANIZACIÓN
    // ======================
    builder
      .addCase(updateOrganization.pending, (state) => {
        state.loading.updating = true;
        state.errors.updating = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        const index = state.organizations.findIndex(org => org.id === action.payload.id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.updating = action.error.message || 'Error actualizando organización';
      });
    
    // ======================
    // ELIMINAR ORGANIZACIÓN
    // ======================
    builder
      .addCase(deleteOrganization.pending, (state) => {
        state.loading.deleting = true;
        state.errors.deleting = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.organizations = state.organizations.filter(org => org.id !== action.payload);
        
        if (state.currentOrganization?.id === action.payload) {
          state.currentOrganization = null;
        }
        
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading.deleting = false;
        state.errors.deleting = action.error.message || 'Error eliminando organización';
      });
    
    // ======================
    // BÚSQUEDA
    // ======================
    builder
      .addCase(searchOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload;
        state.pagination.totalItems = action.payload.length;
      });
    
    // ======================
    // USUARIOS DE ORGANIZACIÓN
    // ======================
    builder
      .addCase(loadOrganizationUsers.pending, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.users[orgId] = true;
        state.errors.users[orgId] = null;
      })
      .addCase(loadOrganizationUsers.fulfilled, (state, action) => {
        const { organizationId, users } = action.payload;
        state.loading.users[organizationId] = false;
        state.organizationUsers[organizationId] = users;
      })
      .addCase(loadOrganizationUsers.rejected, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.users[orgId] = false;
        state.errors.users[orgId] = action.error.message || 'Error cargando usuarios';
      });
    
    builder
      .addCase(addUserToOrganization.fulfilled, (state, action) => {
        const { organizationId, orgUser } = action.payload;
        if (state.organizationUsers[organizationId]) {
          state.organizationUsers[organizationId].push(orgUser);
        }
      });
    
    builder
      .addCase(removeUserFromOrganization.fulfilled, (state, action) => {
        const { organizationId, userId } = action.payload;
        if (state.organizationUsers[organizationId]) {
          state.organizationUsers[organizationId] = state.organizationUsers[organizationId]
            .filter(user => user.userId !== userId);
        }
      });
    
    builder
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { organizationId, userId, newRole } = action.payload;
        if (state.organizationUsers[organizationId]) {
          const userIndex = state.organizationUsers[organizationId]
            .findIndex(user => user.userId === userId);
          if (userIndex !== -1) {
            state.organizationUsers[organizationId][userIndex].role = newRole;
          }
        }
      });
    
    // ======================
    // HOTELES DE ORGANIZACIÓN
    // ======================
    builder
      .addCase(loadOrganizationHotels.pending, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.hotels[orgId] = true;
        state.errors.hotels[orgId] = null;
      })
      .addCase(loadOrganizationHotels.fulfilled, (state, action) => {
        const { organizationId, hotels } = action.payload;
        state.loading.hotels[organizationId] = false;
        state.organizationHotels[organizationId] = hotels;
      })
      .addCase(loadOrganizationHotels.rejected, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.hotels[orgId] = false;
        state.errors.hotels[orgId] = action.error.message || 'Error cargando hoteles';
      });
    
    builder
      .addCase(addHotelToOrganization.fulfilled, (state, action) => {
        // Recargar los hoteles de la organización después de agregar uno
        const { organizationId } = action.payload;
        // Se podría disparar loadOrganizationHotels automáticamente
      });
    
    builder
      .addCase(removeHotelFromOrganization.fulfilled, (state, action) => {
        const { organizationId, hotelId } = action.payload;
        if (state.organizationHotels[organizationId]) {
          state.organizationHotels[organizationId] = state.organizationHotels[organizationId]
            .filter(hotel => hotel.id !== hotelId);
        }
      });
    
    // ======================
    // MÉTRICAS
    // ======================
    builder
      .addCase(loadOrganizationMetrics.pending, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.metrics[orgId] = true;
        state.errors.metrics[orgId] = null;
      })
      .addCase(loadOrganizationMetrics.fulfilled, (state, action) => {
        const { organizationId, metrics } = action.payload;
        state.loading.metrics[organizationId] = false;
        state.organizationMetrics[organizationId] = metrics;
      })
      .addCase(loadOrganizationMetrics.rejected, (state, action) => {
        const orgId = action.meta.arg;
        state.loading.metrics[orgId] = false;
        state.errors.metrics[orgId] = action.error.message || 'Error cargando métricas';
      });
    
    // ======================
    // ORGANIZACIONES DEL USUARIO
    // ======================
    builder
      .addCase(loadUserOrganizations.fulfilled, (state, action) => {
        // Actualizar la lista de organizaciones con las del usuario
        // Esto es útil para usuarios con acceso limitado
        state.organizations = action.payload;
      });
  }
});

// ======================
// ACTIONS Y SELECTORS
// ======================

export const {
  clearOrganizationErrors,
  setSearchQuery,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentOrganization,
  clearCurrentOrganization,
  updateOrganizationInList,
  removeOrganizationFromList
} = organizationSlice.actions;

// Selectors
export const selectOrganizations = (state: { organizations: OrganizationState }) => state.organizations.organizations;
export const selectCurrentOrganization = (state: { organizations: OrganizationState }) => state.organizations.currentOrganization;
export const selectOrganizationUsers = (state: { organizations: OrganizationState }, organizationId: string) => 
  state.organizations.organizationUsers[organizationId] || [];
export const selectOrganizationHotels = (state: { organizations: OrganizationState }, organizationId: string) => 
  state.organizations.organizationHotels[organizationId] || [];
export const selectOrganizationMetrics = (state: { organizations: OrganizationState }, organizationId: string) => 
  state.organizations.organizationMetrics[organizationId];
export const selectOrganizationSearchQuery = (state: { organizations: OrganizationState }) => state.organizations.searchQuery;
export const selectOrganizationFilters = (state: { organizations: OrganizationState }) => state.organizations.filters;
export const selectOrganizationPagination = (state: { organizations: OrganizationState }) => state.organizations.pagination;
export const selectOrganizationLoading = (state: { organizations: OrganizationState }) => state.organizations.loading;
export const selectOrganizationErrors = (state: { organizations: OrganizationState }) => state.organizations.errors;

// Selectors avanzados
export const selectFilteredOrganizations = (state: { organizations: OrganizationState }) => {
  const { organizations, searchQuery, filters } = state.organizations;
  
  return organizations.filter(org => {
    // Filtro por búsqueda
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        org.name.toLowerCase().includes(searchLower) ||
        (org.description && org.description.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Filtro por tipo
    if (filters.type.length > 0 && !filters.type.includes(org.type)) {
      return false;
    }
    
    // Filtro por estado
    if (filters.status.length > 0 && !filters.status.includes(org.status)) {
      return false;
    }
    
    return true;
  });
};

export const selectOrganizationStats = (state: { organizations: OrganizationState }) => {
  const organizations = state.organizations.organizations;
  
  return {
    total: organizations.length,
    active: organizations.filter(org => org.status === 'active').length,
    byType: organizations.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

export default organizationSlice.reducer;