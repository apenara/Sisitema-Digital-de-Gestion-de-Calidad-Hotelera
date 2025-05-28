export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'corporation' | 'franchise' | 'holding' | 'group' | 'consortium';
  
  // Configuración
  settings: OrganizationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Usuario que creó la organización
  
  // Estado
  status: 'active' | 'suspended' | 'inactive';
  
  // Estadísticas
  totalCompanies?: number;
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
    multiCompanyManagement: boolean;
    centralizedReporting: boolean;
    crossCompanyAnalytics: boolean;
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
    crossCompanyReports: boolean;
    organizationMetrics: boolean;
  };
}

export interface OrganizationUser {
  userId: string;
  organizationId: string;
  role: 'org_admin' | 'org_manager' | 'org_analyst';
  permissions: string[];
  joinedAt: Date;
  invitedBy: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface OrganizationCompany {
  companyId: string;
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
  totalCompanies: number;
  totalUsers: number;
  activeCompanies: number;
  totalDocuments: number;
  totalNonConformities: number;
  averageQualityScore: number;
  monthlyMetrics: {
    documentsCreated: number;
    nonConformitiesResolved: number;
    newUsers: number;
    newCompanies: number;
  };
  calculatedAt: Date;
}