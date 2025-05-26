import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Hotel, Department, CreateHotelData, UpdateHotelData, CreateDepartmentData, UpdateDepartmentData } from '../../../../shared/types';
import { hotelService } from '../../services/hotelService';

interface HotelState {
  currentHotel: Hotel | null;
  hotels: Hotel[];
  departments: Department[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  currentHotel: null,
  hotels: [],
  departments: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const createHotel = createAsyncThunk(
  'hotel/create',
  async ({ data, ownerId }: { data: CreateHotelData; ownerId: string }, { rejectWithValue }) => {
    try {
      const hotelId = await hotelService.createHotel(data, ownerId);
      const hotel = await hotelService.getHotelById(hotelId);
      return hotel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al crear hotel');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotel/fetchById',
  async (hotelId: string, { rejectWithValue }) => {
    try {
      const hotel = await hotelService.getHotelById(hotelId);
      return hotel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener hotel');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotel/update',
  async ({ hotelId, data }: { hotelId: string; data: UpdateHotelData }, { rejectWithValue }) => {
    try {
      await hotelService.updateHotel(hotelId, data);
      const updatedHotel = await hotelService.getHotelById(hotelId);
      return updatedHotel;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar hotel');
    }
  }
);

export const fetchHotelsByOwner = createAsyncThunk(
  'hotel/fetchByOwner',
  async (ownerId: string, { rejectWithValue }) => {
    try {
      const hotels = await hotelService.getHotelsByOwner(ownerId);
      return hotels;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener hoteles');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'hotel/createDepartment',
  async ({ hotelId, data }: { hotelId: string; data: CreateDepartmentData }, { rejectWithValue }) => {
    try {
      const departmentId = await hotelService.createDepartment(hotelId, data);
      const department = await hotelService.getDepartmentById(hotelId, departmentId);
      return department;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al crear departamento');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'hotel/fetchDepartments',
  async (hotelId: string, { rejectWithValue }) => {
    try {
      const departments = await hotelService.getDepartmentsByHotel(hotelId);
      return departments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener departamentos');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'hotel/updateDepartment',
  async ({ hotelId, departmentId, data }: { hotelId: string; departmentId: string; data: UpdateDepartmentData }, { rejectWithValue }) => {
    try {
      await hotelService.updateDepartment(hotelId, departmentId, data);
      const updatedDepartment = await hotelService.getDepartmentById(hotelId, departmentId);
      return updatedDepartment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar departamento');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'hotel/deleteDepartment',
  async ({ hotelId, departmentId }: { hotelId: string; departmentId: string }, { rejectWithValue }) => {
    try {
      await hotelService.deleteDepartment(hotelId, departmentId);
      return departmentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar departamento');
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentHotel: (state, action: PayloadAction<Hotel | null>) => {
      state.currentHotel = action.payload;
    },
    updateHotelInList: (state, action: PayloadAction<Hotel>) => {
      const index = state.hotels.findIndex(hotel => hotel.id === action.payload.id);
      if (index !== -1) {
        state.hotels[index] = action.payload;
      }
    },
    addDepartmentToList: (state, action: PayloadAction<Department>) => {
      state.departments.push(action.payload);
    },
    updateDepartmentInList: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(dept => dept.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
    removeDepartmentFromList: (state, action: PayloadAction<string>) => {
      state.departments = state.departments.filter(dept => dept.id !== action.payload);
    },
    resetHotelState: () => initialState,
  },
  extraReducers: (builder) => {
    // Create hotel
    builder
      .addCase(createHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentHotel = action.payload;
          state.hotels.push(action.payload);
        }
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch hotel by ID
    builder
      .addCase(fetchHotelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update hotel
    builder
      .addCase(updateHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentHotel = action.payload;
          const index = state.hotels.findIndex(hotel => hotel.id === action.payload!.id);
          if (index !== -1) {
            state.hotels[index] = action.payload;
          }
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch hotels by owner
    builder
      .addCase(fetchHotelsByOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelsByOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotelsByOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create department
    builder
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.departments.push(action.payload);
        }
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update department
    builder
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.departments.findIndex(dept => dept.id === action.payload!.id);
          if (index !== -1) {
            state.departments[index] = action.payload;
          }
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete department
    builder
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = state.departments.filter(dept => dept.id !== action.payload);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentHotel,
  updateHotelInList,
  addDepartmentToList,
  updateDepartmentInList,
  removeDepartmentFromList,
  resetHotelState,
} = hotelSlice.actions;

// Selectors
export const selectCurrentHotel = (state: { hotel: HotelState }) => state.hotel.currentHotel;
export const selectHotels = (state: { hotel: HotelState }) => state.hotel.hotels;
export const selectDepartments = (state: { hotel: HotelState }) => state.hotel.departments;
export const selectHotelIsLoading = (state: { hotel: HotelState }) => state.hotel.isLoading;
export const selectHotelError = (state: { hotel: HotelState }) => state.hotel.error;

export default hotelSlice.reducer;