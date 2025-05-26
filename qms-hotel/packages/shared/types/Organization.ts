export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'hotel_chain' | 'hotel_group' | 'management_company';
  
  // Configuración
  settings: OrganizationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Usuario que creó la organización
  
  // Estado
  status: 'active' | 'suspended' | 'inactive';
  
  // Estadísticas
  totalHotels?: number;
  totalUsers?: number;
}

export interface OrganizationSettings {
  // Configuración visual
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  
  // Configuración funcional
  features: {
    multiHotelManagement: boolean;
    centralizedReporting: boolean;
    crossHotelAnalytics: boolean;
    standardizedProcesses: boolean;
  };
  
  // Configuración de integración
  integrations: {
    enabled: string[]; // IDs de integraciones habilitadas
    config: Record<string, any>; // Configuración específica por integración
  };
  
  // Configuración de notificaciones
  notifications: {
    globalAlerts: boolean;
    crossHotelReports: boolean;
    chainMetrics: boolean;
  };
}

export interface OrganizationUser {
  userId: string;
  organizationId: string;
  role: 'chain_admin' | 'chain_manager' | 'chain_analyst';
  permissions: string[];
  joinedAt: Date;
  invitedBy: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface OrganizationHotel {
  hotelId: string;
  organizationId: string;
  addedAt: Date;
  addedBy: string;
  status: 'active' | 'inactive';
  customSettings?: Record<string, any>;
}

// Tipos para formularios y validación
export interface CreateOrganizationInput {
  name: string;
  description?: string;
  type: Organization['type'];
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
  status?: Organization['status'];
}

// Tipos para estadísticas y métricas
export interface OrganizationMetrics {
  organizationId: string;
  totalHotels: number;
  totalUsers: number;
  activeHotels: number;
  totalDocuments: number;
  totalNonConformities: number;
  averageQualityScore: number;
  monthlyMetrics: {
    documentsCreated: number;
    nonConformitiesResolved: number;
    newUsers: number;
    newHotels: number;
  };
  calculatedAt: Date;
}