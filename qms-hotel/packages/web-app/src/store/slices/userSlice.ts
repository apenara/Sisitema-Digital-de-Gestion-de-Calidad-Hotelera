import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UpdateUserData } from '../../../../shared/types';
import { userService } from '../../services/userService';

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const user = await userService.getUserById(userId);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener usuario');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, data }: { userId: string; data: UpdateUserData }, { rejectWithValue }) => {
    try {
      await userService.updateUser(userId, data);
      const updatedUser = await userService.getUserById(userId);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar usuario');
    }
  }
);

export const fetchUsersByHotel = createAsyncThunk(
  'user/fetchByHotel',
  async (hotelId: string, { rejectWithValue }) => {
    try {
      const users = await userService.getUsersByHotel(hotelId);
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener usuarios del hotel');
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  'user/updatePermissions',
  async ({ userId, role }: { userId: string; role: User['role'] }, { rejectWithValue }) => {
    try {
      await userService.updateUserPermissions(userId, role);
      const updatedUser = await userService.getUserById(userId);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar permisos');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'user/toggleStatus',
  async ({ userId, isActive }: { userId: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      await userService.toggleUserStatus(userId, isActive);
      const updatedUser = await userService.getUserById(userId);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al cambiar estado del usuario');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentUser = action.payload;
          // Update in users list if present
          const index = state.users.findIndex(user => user.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch users by hotel
    builder
      .addCase(fetchUsersByHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersByHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersByHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user permissions
    builder
      .addCase(updateUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.users.findIndex(user => user.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
          }
        }
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle user status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.users.findIndex(user => user.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentUser,
  updateUserInList,
  removeUserFromList,
  resetUserState,
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectUsers = (state: { user: UserState }) => state.user.users;
export const selectUserIsLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;