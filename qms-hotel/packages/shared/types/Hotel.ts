export interface Hotel {
  id: string;
  name: string;
  description?: string;
  
  // Información básica
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  contact: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  
  // Configuración del hotel
  settings: HotelSettings;
  
  // Estructura organizacional
  departments: Department[];
  
  // Contexto multi-tenant
  organizationId?: string;  // null para hoteles independientes
  type: 'independent' | 'chain_member';
  
  // Estado y gestión
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_setup';
  
  // Información de subscripción (para hoteles independientes)
  subscriptionId?: string;  // null si pertenece a organización
  
  // Información de clasificación
  classification: {
    category: 'boutique' | 'business' | 'resort' | 'economy' | 'luxury' | 'extended_stay';
    stars?: number;
    rooms?: number;
    size: 'small' | 'medium' | 'large' | 'enterprise';
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;         // Usuario que creó el hotel
  managedBy?: string;      // Usuario que gestiona actualmente
  
  // Estadísticas básicas (calculadas)
  statistics?: HotelStatistics;
  
  createdBy: string;
}

export interface HotelSettings {
  // Configuración regional
  timezone: string;
  currency: string;
  language: 'es' | 'en';
  
  // Branding
  branding: {
    logo?: string;
    favicon?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor?: string;
    };
    customCss?: string;
  };
  
  // Configuración funcional
  features: {
    documentsEnabled: boolean;
    nonConformitiesEnabled: boolean;
    auditsEnabled: boolean;
    reportsEnabled: boolean;
    analyticsEnabled: boolean;
    notificationsEnabled: boolean;
  };
  
  // Configuración de notificaciones
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    slackIntegration?: {
      enabled: boolean;
      webhookUrl?: string;
      channels?: string[];
    };
    customWebhooks?: {
      enabled: boolean;
      endpoints: string[];
    };
  };
  
  // Configuración de calidad
  quality: {
    defaultProcesses: string[];
    auditFrequency: 'weekly' | 'monthly' | 'quarterly';
    complianceStandards: string[]; // ISO, HACCP, etc.
    qualityObjectives: string[];
  };
  
  // Configuración de integración
  integrations: {
    pms?: {  // Property Management System
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    accounting?: {
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    hrms?: {  // Human Resource Management System
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
  };
}

export interface HotelStatistics {
  // Usuarios
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  
  // Documentos
  totalDocuments: number;
  documentsByType: Record<string, number>;
  documentsThisMonth: number;
  
  // No conformidades
  totalNonConformities: number;
  openNonConformities: number;
  resolvedThisMonth: number;
  averageResolutionTime: number; // en días
  
  // Auditorías
  totalAudits: number;
  auditsThisYear: number;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  
  // Calidad
  qualityScore?: number; // 0-100
  complianceRate?: number; // 0-100
  
  // Última actualización
  lastCalculated: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHotelData {
  name: string;
  description?: string;
  address: Omit<Hotel['address'], 'coordinates'>;
  contact: Omit<Hotel['contact'], 'socialMedia'>;
  settings?: Partial<HotelSettings>;
  departments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[];
  
  // Contexto multi-tenant
  organizationId?: string;  // null para hoteles independientes
  type: Hotel['type'];
  classification: Hotel['classification'];
  
  // Configuración inicial
  subscriptionId?: string;  // Para hoteles independientes
}

export interface UpdateHotelData {
  name?: string;
  description?: string;
  address?: Partial<Hotel['address']>;
  contact?: Partial<Hotel['contact']>;
  settings?: Partial<HotelSettings>;
  classification?: Partial<Hotel['classification']>;
  isActive?: boolean;
  status?: Hotel['status'];
  managedBy?: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes?: string[];
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  code?: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes?: string[];
  isActive?: boolean;
}

// Tipos adicionales para gestión multi-tenant
export interface HotelListItem {
  id: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  type: Hotel['type'];
  status: Hotel['status'];
  classification: Hotel['classification'];
  location: {
    city: string;
    country: string;
  };
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    qualityScore?: number;
  };
  lastActivity: Date;
}

export interface HotelSearchFilters {
  query?: string;
  organizationId?: string;
  type?: Hotel['type'];
  status?: Hotel['status'][];
  classification?: {
    category?: Hotel['classification']['category'][];
    size?: Hotel['classification']['size'][];
    stars?: number[];
  };
  location?: {
    country?: string;
    city?: string;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface HotelOnboardingData {
  // Información básica del hotel
  hotel: CreateHotelData;
  
  // Usuario administrador inicial
  admin: {
    email: string;
    displayName: string;
    password?: string; // Solo si no existe el usuario
  };
  
  // Configuración inicial
  initialSetup: {
    skipDemoData: boolean;
    importExistingData: boolean;
    setupProcesses: string[];
    enableIntegrations: string[];
  };
}

export interface HotelTransferData {
  hotelId: string;
  fromOrganizationId?: string;
  toOrganizationId?: string;
  transferType: 'to_organization' | 'to_independent' | 'between_organizations';
  transferredBy: string;
  reason: string;
  effectiveDate: Date;
  preserveData: boolean;
  notifyUsers: boolean;
}

// Tipos para métricas agregadas de hoteles
export interface HotelMetricsAggregated {
  organizationId?: string;
  totalHotels: number;
  activeHotels: number;
  hotelsByType: Record<Hotel['type'], number>;
  hotelsByStatus: Record<Hotel['status'], number>;
  hotelsBySize: Record<Hotel['classification']['size'], number>;
  averageQualityScore: number;
  totalUsers: number;
  totalDocuments: number;
  totalNonConformities: number;
  
  // Métricas de tendencia
  growth: {
    newHotels: number;      // Este mes
    activatedHotels: number; // Este mes
    deactivatedHotels: number; // Este mes
  };
  
  // Métricas por ubicación
  byLocation: Array<{
    country: string;
    city: string;
    count: number;
    qualityScore: number;
  }>;
  
  calculatedAt: Date;
}

// Configuración por defecto para nuevos hoteles
export const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  timezone: 'America/Bogota',
  currency: 'COP',
  language: 'es',
  
  branding: {
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#424242',
      accentColor: '#ff9800'
    }
  },
  
  features: {
    documentsEnabled: true,
    nonConformitiesEnabled: true,
    auditsEnabled: true,
    reportsEnabled: true,
    analyticsEnabled: true,
    notificationsEnabled: true
  },
  
  notifications: {
    emailAlerts: true,
    pushNotifications: true
  },
  
  quality: {
    defaultProcesses: ['recepcion', 'housekeeping', 'alimentos_bebidas', 'mantenimiento'],
    auditFrequency: 'monthly',
    complianceStandards: ['ISO_9001'],
    qualityObjectives: []
  },
  
  integrations: {
    pms: { enabled: false },
    accounting: { enabled: false },
    hrms: { enabled: false }
  }
};

// Departamentos por defecto para hoteles
export const DEFAULT_HOTEL_DEPARTMENTS: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Recepción',
    description: 'Atención al huésped y servicios de front office',
    code: 'REC',
    processes: ['check_in', 'check_out', 'reservas', 'atencion_cliente'],
    isActive: true
  },
  {
    name: 'Housekeeping',
    description: 'Limpieza y mantenimiento de habitaciones',
    code: 'HK',
    processes: ['limpieza_habitaciones', 'lavanderia', 'mantenimiento_preventivo'],
    isActive: true
  },
  {
    name: 'Alimentos y Bebidas',
    description: 'Restaurante, bar y servicio de catering',
    code: 'AYB',
    processes: ['cocina', 'servicio_mesa', 'bar', 'eventos'],
    isActive: true
  },
  {
    name: 'Mantenimiento',
    description: 'Mantenimiento de instalaciones y equipos',
    code: 'MNT',
    processes: ['mantenimiento_correctivo', 'mantenimiento_preventivo', 'jardineria'],
    isActive: true
  },
  {
    name: 'Administración',
    description: 'Gestión administrativa y financiera',
    code: 'ADM',
    processes: ['contabilidad', 'recursos_humanos', 'compras'],
    isActive: true
  }
];

export type CreateHotelInput = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'statistics'>;

export type UpdateHotelInput = Partial<CreateHotelInput>;