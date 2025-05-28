import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Company } from '../../../../shared/types/Company';
import { companyService, type CreateCompanyInput } from '../../services/companyService';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCompaniesByOwner = createAsyncThunk(
  'company/fetchByOwner',
  async (ownerId: string) => {
    const companies = await companyService.getCompanies({ organizationId: ownerId });
    return companies;
  }
);

export const fetchAllCompanies = createAsyncThunk(
  'company/fetchAll',
  async () => {
    const companies = await companyService.getAllCompanies();
    return companies;
  }
);

export const createCompany = createAsyncThunk(
  'company/create',
  async ({ data, organizationId }: { data: CreateCompanyInput; organizationId?: string }) => {
    const companyData: CreateCompanyInput = {
      ...data,
      organizationId
    };
    const newCompany = await companyService.createCompany(companyData);
    return newCompany;
  }
);

export const updateCompany = createAsyncThunk(
  'company/update',
  async ({ companyId, data }: { companyId: string; data: Partial<Company> }) => {
    await companyService.updateCompany(companyId, data);
    return { companyId, data };
  }
);

export const deleteCompany = createAsyncThunk(
  'company/delete',
  async (companyId: string) => {
    await companyService.deleteCompany(companyId);
    return companyId;
  }
);

// Slice
const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    selectCompany: (state, action: PayloadAction<Company>) => {
      state.selectedCompany = action.payload;
    },
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch companies by owner
    builder
      .addCase(fetchCompaniesByOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesByOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompaniesByOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar empresas';
      });

    // Fetch all companies
    builder
      .addCase(fetchAllCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar empresas';
      });

    // Create company
    builder
      .addCase(createCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al crear empresa';
      });

    // Update company
    builder
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companies.findIndex(c => c.id === action.payload.companyId);
        if (index !== -1) {
          state.companies[index] = {
            ...state.companies[index],
            ...action.payload.data,
            updatedAt: new Date()
          };
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al actualizar empresa';
      });

    // Delete company
    builder
      .addCase(deleteCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = state.companies.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al eliminar empresa';
      });
  },
});

// Actions
export const { selectCompany, clearSelectedCompany, clearError } = companySlice.actions;

// Selectors
export const selectCompanies = (state: RootState) => state.company.companies;
export const selectSelectedCompany = (state: RootState) => state.company.selectedCompany;
export const selectCompanyIsLoading = (state: RootState) => state.company.isLoading;
export const selectCompanyError = (state: RootState) => state.company.error;

// Selectors derivados
export const selectCompaniesByOrganization = (organizationId: string) => (state: RootState) =>
  state.company.companies.filter(company => company.organizationId === organizationId);

export const selectCompaniesByIndustry = (industryType: string) => (state: RootState) =>
  state.company.companies.filter(company => company.industry.type === industryType);

export const selectActiveCompanies = (state: RootState) =>
  state.company.companies.filter(company => company.status === 'active');

export default companySlice.reducer;