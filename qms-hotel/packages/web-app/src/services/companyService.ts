import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Company } from '@shared/types/Company';

const COMPANIES_COLLECTION = 'companies';

export interface CreateCompanyInput {
  name: string;
  industry: {
    type: string;
    size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
    employeeCount?: string;
    certifications?: string[];
  };
  organizationId?: string;
  contact: {
    email: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  settings?: {
    departments: string[];
    language: string;
    timezone: string;
    fiscalYearStart: string;
  };
}

export const companyService = {
  // Obtener todas las empresas
  async getAllCompanies(): Promise<Company[]> {
    try {
      const companiesRef = collection(db, COMPANIES_COLLECTION);
      const snapshot = await getDocs(companiesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
    } catch (error) {
      console.error('Error fetching all companies:', error);
      throw error;
    }
  },

  // Obtener empresas con filtros
  async getCompanies(filters?: {
    organizationId?: string;
    industry?: string;
    status?: string;
    limit?: number;
  }): Promise<Company[]> {
    try {
      const companiesRef = collection(db, COMPANIES_COLLECTION);
      const constraints: QueryConstraint[] = [];

      if (filters?.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }
      if (filters?.industry) {
        constraints.push(where('industry.type', '==', filters.industry));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(companiesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Obtener una empresa por ID
  async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        return null;
      }
      
      return {
        id: companyDoc.id,
        ...companyDoc.data()
      } as Company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  // Crear una nueva empresa
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    try {
      const companyRef = doc(collection(db, COMPANIES_COLLECTION));
      
      const now = Timestamp.now();
      const companyData: Omit<Company, 'id'> = {
        name: data.name,
        industry: data.industry,
        organizationId: data.organizationId,
        contact: data.contact,
        settings: data.settings || {
          departments: [],
          language: 'es',
          timezone: 'America/Mexico_City',
          fiscalYearStart: 'january'
        },
        subscription: {
          planId: 'trial',
          status: 'trial',
          startDate: now,
          endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 días
        },
        metrics: {
          totalUsers: 0,
          activeUsers: 0,
          totalDocuments: 0,
          totalProcesses: 0,
          complianceScore: 100,
          lastActivityAt: now
        },
        status: 'active',
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(companyRef, companyData);
      
      return {
        id: companyRef.id,
        ...companyData
      };
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Actualizar una empresa
  async updateCompany(companyId: string, data: Partial<Company>): Promise<void> {
    try {
      const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
      
      await updateDoc(companyRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  // Eliminar una empresa
  async deleteCompany(companyId: string): Promise<void> {
    try {
      const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
      await deleteDoc(companyRef);
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Obtener empresas por organización
  async getCompaniesByOrganization(organizationId: string): Promise<Company[]> {
    try {
      const companiesRef = collection(db, COMPANIES_COLLECTION);
      const q = query(
        companiesRef, 
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
    } catch (error) {
      console.error('Error fetching companies by organization:', error);
      throw error;
    }
  }
};