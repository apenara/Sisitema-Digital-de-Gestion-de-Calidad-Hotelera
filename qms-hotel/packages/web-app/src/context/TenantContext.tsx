import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectUser,
  selectIsLoading
} from '../store/slices/authSlice';
import {
  setCurrentOrganization,
  selectCurrentOrganization
} from '../store/slices/organizationSlice';
import {
  setCurrentHotel,
  selectCurrentHotel
} from '../store/slices/hotelSlice';
import type { Organization } from '../../../shared/types/Organization';
import type { Hotel } from '../../../shared/types/Hotel';

export type TenantLevel = 'platform' | 'organization' | 'hotel';

export interface TenantContext {
  // Nivel actual del contexto
  currentLevel: TenantLevel;
  
  // Entidades actuales
  currentOrganization: Organization | null;
  currentHotel: Hotel | null;
  
  // Funciones de navegación
  navigateToLevel: (level: TenantLevel, entityId?: string) => void;
  switchOrganization: (organizationId: string) => void;
  switchHotel: (hotelId: string) => void;
  
  // Permisos del usuario actual
  permissions: {
    canAccessPlatform: boolean;
    canManageOrganization: (organizationId?: string) => boolean;
    canManageHotel: (hotelId?: string) => boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    canManageSubscriptions: boolean;
  };
  
  // Información de contexto
  breadcrumb: Array<{
    level: TenantLevel;
    name: string;
    id?: string;
    href: string;
  }>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContext | null>(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [currentLevel, setCurrentLevel] = useState<TenantLevel>('platform');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selectors
  const currentUser = useAppSelector(selectUser);
  const userLoading = useAppSelector(selectIsLoading);
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const currentHotel = useAppSelector(selectCurrentHotel);

  // Determinar el nivel inicial basado en el usuario
  useEffect(() => {
    if (!currentUser) return;

    const userRole = currentUser?.role;

    if (userRole === 'super_admin') {
      setCurrentLevel('platform');
    } else if (userRole === 'chain_admin' && currentUser?.organizationId) {
      setCurrentLevel('organization');
      dispatch(setCurrentOrganization(null)); // Se cargará después
    } else if (currentUser?.hotelId) {
      setCurrentLevel('hotel');
      dispatch(setCurrentHotel(null)); // Se cargará después
    } else {
      setCurrentLevel('platform');
    }
  }, [currentUser, dispatch]);

  // Funciones de navegación
  const navigateToLevel = async (level: TenantLevel, entityId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      switch (level) {
        case 'platform':
          setCurrentLevel('platform');
          dispatch(setCurrentOrganization(null));
          dispatch(setCurrentHotel(null));
          break;

        case 'organization':
          if (entityId) {
            // TODO: Cargar organización por ID
            // const org = await organizationService.getOrganization(entityId);
            // dispatch(setCurrentOrganization(org));
            setCurrentLevel('organization');
            dispatch(setCurrentHotel(null));
          }
          break;

        case 'hotel':
          if (entityId) {
            // TODO: Cargar hotel por ID
            // const hotel = await hotelService.getHotelById(entityId);
            // dispatch(setCurrentHotel(hotel));
            setCurrentLevel('hotel');
          }
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error navegando entre contextos');
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = (organizationId: string) => {
    navigateToLevel('organization', organizationId);
  };

  const switchHotel = (hotelId: string) => {
    navigateToLevel('hotel', hotelId);
  };

  // Calcular permisos
  const permissions = {
    canAccessPlatform: currentUser?.role === 'super_admin',
    
    canManageOrganization: (organizationId?: string) => {
      if (currentUser?.role === 'super_admin') return true;
      if (currentUser?.role === 'chain_admin') {
        if (!organizationId) return true; // Su propia organización
        return currentUser?.organizationId === organizationId;
      }
      return false;
    },
    
    canManageHotel: (hotelId?: string) => {
      if (currentUser?.role === 'super_admin') return true;
      if (currentUser?.role === 'chain_admin') return true;
      if (currentUser?.role === 'hotel_admin') {
        if (!hotelId) return true; // Su propio hotel
        return currentUser?.hotelId === hotelId;
      }
      return false;
    },
    
    canViewAnalytics: ['super_admin', 'chain_admin', 'hotel_admin'].includes(currentUser?.role || ''),
    canManageUsers: ['super_admin', 'chain_admin', 'hotel_admin'].includes(currentUser?.role || ''),
    canManageSubscriptions: currentUser?.role === 'super_admin'
  };

  // Generar breadcrumb
  const breadcrumb = [];
  
  if (permissions.canAccessPlatform) {
    breadcrumb.push({
      level: 'platform' as TenantLevel,
      name: 'Plataforma',
      href: '/platform'
    });
  }

  if (currentLevel !== 'platform' && currentOrganization) {
    breadcrumb.push({
      level: 'organization' as TenantLevel,
      name: currentOrganization.name,
      id: currentOrganization.id,
      href: `/org/${currentOrganization.id}`
    });
  }

  if (currentLevel === 'hotel' && currentHotel) {
    breadcrumb.push({
      level: 'hotel' as TenantLevel,
      name: currentHotel.name,
      id: currentHotel.id,
      href: `/hotel/${currentHotel.id}`
    });
  }

  const value: TenantContext = {
    currentLevel,
    currentOrganization,
    currentHotel,
    navigateToLevel,
    switchOrganization,
    switchHotel,
    permissions,
    breadcrumb,
    isLoading: isLoading || (userLoading as boolean),
    error
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { permissions } = useTenant();
  return permissions;
};

// Hook para el breadcrumb
export const useBreadcrumb = () => {
  const { breadcrumb } = useTenant();
  return breadcrumb;
};

// Hook para cambio de contexto
export const useTenantNavigation = () => {
  const { navigateToLevel, switchOrganization, switchHotel } = useTenant();
  return { navigateToLevel, switchOrganization, switchHotel };
};

export default TenantContext;