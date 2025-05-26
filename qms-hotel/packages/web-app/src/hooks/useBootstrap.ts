import { useState, useCallback } from 'react';
import { bootstrapService } from '../services/bootstrapService';
import type { User, Platform } from '../../../shared/types';

interface CreateSuperAdminInput {
  email: string;
  password: string;
  displayName: string;
}

interface UseBootstrapReturn {
  // Estado
  isInitialized: boolean | null;
  superAdminCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Resultados
  createdSuperAdmin: User | null;
  platformSettings: Platform | null;
  
  // Acciones
  checkInitialization: () => Promise<void>;
  initializePlatform: (data: CreateSuperAdminInput) => Promise<boolean>;
  createAdditionalSuperAdmin: (data: CreateSuperAdminInput, createdBy: string) => Promise<boolean>;
  createDemoData: (superAdminId: string) => Promise<void>;
  clearError: () => void;
}

export const useBootstrap = (): UseBootstrapReturn => {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [superAdminCount, setSuperAdminCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSuperAdmin, setCreatedSuperAdmin] = useState<User | null>(null);
  const [platformSettings, setPlatformSettings] = useState<Platform | null>(null);
  
  const checkInitialization = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [initialized, count] = await Promise.all([
        bootstrapService.isPlatformInitialized(),
        bootstrapService.getSuperAdminCount()
      ]);
      
      setIsInitialized(initialized);
      setSuperAdminCount(count);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando inicialización';
      setError(errorMessage);
      console.error('Error en checkInitialization:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const initializePlatform = useCallback(async (data: CreateSuperAdminInput): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setCreatedSuperAdmin(null);
      setPlatformSettings(null);
      
      const result = await bootstrapService.initializePlatform(data);
      
      if (result.success) {
        setCreatedSuperAdmin(result.superAdmin || null);
        setPlatformSettings(result.platform || null);
        setIsInitialized(true);
        setSuperAdminCount(1);
        
        console.log('✅ Plataforma inicializada exitosamente');
        return true;
      } else {
        setError(result.error || 'Error desconocido durante la inicialización');
        return false;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inicializando plataforma';
      setError(errorMessage);
      console.error('Error en initializePlatform:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const createAdditionalSuperAdmin = useCallback(async (
    data: CreateSuperAdminInput,
    createdBy: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newSuperAdmin = await bootstrapService.createAdditionalSuperAdmin(data, createdBy);
      
      setCreatedSuperAdmin(newSuperAdmin);
      setSuperAdminCount(prev => prev + 1);
      
      console.log('✅ Super admin adicional creado exitosamente');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando super admin';
      setError(errorMessage);
      console.error('Error en createAdditionalSuperAdmin:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const createDemoData = useCallback(async (superAdminId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await bootstrapService.createDemoData(superAdminId);
      
      console.log('✅ Datos de demostración creados exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando datos de demostración';
      setError(errorMessage);
      console.error('Error en createDemoData:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Estado
    isInitialized,
    superAdminCount,
    isLoading,
    error,
    
    // Resultados
    createdSuperAdmin,
    platformSettings,
    
    // Acciones
    checkInitialization,
    initializePlatform,
    createAdditionalSuperAdmin,
    createDemoData,
    clearError
  };
};