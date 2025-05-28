export interface Company {
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
      linkedin?: string;
    };
  };
  
  // Configuración de la empresa
  settings: CompanySettings;
  
  // Estructura organizacional
  departments: Department[];
  
  // Contexto multi-tenant
  organizationId?: string;  // null para empresas independientes
  type: 'independent' | 'franchise' | 'subsidiary' | 'branch';
  
  // Estado y gestión
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_setup';
  
  // Información de subscripción (para empresas independientes)
  subscriptionId?: string;  // null si pertenece a organización
  
  // Información de industria y clasificación
  industry: {
    type: IndustryType;
    subType?: string;
    size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
    employeeCount?: EmployeeRange;
    annualRevenue?: string;
    certifications?: string[]; // ISO 9001, ISO 14001, etc.
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;         // Usuario que creó la empresa
  managedBy?: string;      // Usuario que gestiona actualmente
  
  // Estadísticas básicas (calculadas)
  statistics?: CompanyStatistics;
  
  createdBy: string;
}

export type IndustryType = 
  | 'manufacturing'
  | 'retail'
  | 'hospitality'
  | 'healthcare'
  | 'education'
  | 'technology'
  | 'construction'
  | 'finance'
  | 'consulting'
  | 'logistics'
  | 'agriculture'
  | 'energy'
  | 'telecommunications'
  | 'real_estate'
  | 'automotive'
  | 'pharmaceutical'
  | 'food_service'
  | 'entertainment'
  | 'non_profit'
  | 'government'
  | 'other';

export type EmployeeRange = 
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5000+';

export interface CompanySettings {
  // Configuración regional
  timezone: string;
  currency: string;
  language: string;
  dateFormat?: string;
  
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
    processesEnabled: boolean;
    risksEnabled: boolean;
    trainingsEnabled: boolean;
    suppliersEnabled: boolean;
    reportsEnabled: boolean;
    analyticsEnabled: boolean;
    notificationsEnabled: boolean;
    gamificationEnabled: boolean;
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
    teamsIntegration?: {
      enabled: boolean;
      webhookUrl?: string;
    };
    customWebhooks?: {
      enabled: boolean;
      endpoints: string[];
    };
  };
  
  // Configuración de calidad
  quality: {
    defaultProcesses: string[];
    auditFrequency: 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
    complianceStandards: string[]; // ISO 9001, ISO 14001, OHSAS 18001, etc.
    qualityObjectives: string[];
    kpis: QualityKPI[];
  };
  
  // Configuración de integración
  integrations: {
    erp?: {
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    crm?: {
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    accounting?: {
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    hrms?: {
      enabled: boolean;
      provider?: string;
      config?: Record<string, any>;
    };
    
    custom?: Array<{
      name: string;
      enabled: boolean;
      config?: Record<string, any>;
    }>;
  };
}

export interface QualityKPI {
  id: string;
  name: string;
  description?: string;
  unit: string;
  target: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  calculation?: string;
  isActive: boolean;
}

export interface CompanyStatistics {
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
  
  // Procesos
  totalProcesses: number;
  activeProcesses: number;
  processEfficiency?: number; // 0-100
  
  // Riesgos
  totalRisks: number;
  highRisks: number;
  mitigatedRisks: number;
  
  // Calidad
  qualityScore?: number; // 0-100
  complianceRate?: number; // 0-100
  kpiAchievement?: number; // 0-100
  
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

export interface CreateCompanyData {
  name: string;
  description?: string;
  address: Omit<Company['address'], 'coordinates'>;
  contact: Omit<Company['contact'], 'socialMedia'>;
  settings?: Partial<CompanySettings>;
  departments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[];
  
  // Contexto multi-tenant
  organizationId?: string;  // null para empresas independientes
  type: Company['type'];
  industry: Company['industry'];
  
  // Configuración inicial
  subscriptionId?: string;  // Para empresas independientes
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  address?: Partial<Company['address']>;
  contact?: Partial<Company['contact']>;
  settings?: Partial<CompanySettings>;
  industry?: Partial<Company['industry']>;
  isActive?: boolean;
  status?: Company['status'];
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
export interface CompanyListItem {
  id: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  type: Company['type'];
  status: Company['status'];
  industry: Company['industry'];
  location: {
    city: string;
    country: string;
  };
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    qualityScore?: number;
    complianceRate?: number;
  };
  lastActivity: Date;
}

export interface CompanySearchFilters {
  query?: string;
  organizationId?: string;
  type?: Company['type'];
  status?: Company['status'][];
  industry?: {
    type?: IndustryType[];
    size?: Company['industry']['size'][];
  };
  location?: {
    country?: string;
    city?: string;
  };
  certifications?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CompanyOnboardingData {
  // Información básica de la empresa
  company: CreateCompanyData;
  
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
    applyIndustryTemplate: boolean;
  };
}

export interface CompanyTransferData {
  companyId: string;
  fromOrganizationId?: string;
  toOrganizationId?: string;
  transferType: 'to_organization' | 'to_independent' | 'between_organizations';
  transferredBy: string;
  reason: string;
  effectiveDate: Date;
  preserveData: boolean;
  notifyUsers: boolean;
}

// Tipos para métricas agregadas de empresas
export interface CompanyMetricsAggregated {
  organizationId?: string;
  totalCompanies: number;
  activeCompanies: number;
  companiesByType: Record<Company['type'], number>;
  companiesByStatus: Record<Company['status'], number>;
  companiesBySize: Record<Company['industry']['size'], number>;
  companiesByIndustry: Record<IndustryType, number>;
  averageQualityScore: number;
  averageComplianceRate: number;
  totalUsers: number;
  totalDocuments: number;
  totalNonConformities: number;
  
  // Métricas de tendencia
  growth: {
    newCompanies: number;      // Este mes
    activatedCompanies: number; // Este mes
    deactivatedCompanies: number; // Este mes
  };
  
  // Métricas por ubicación
  byLocation: Array<{
    country: string;
    city: string;
    count: number;
    qualityScore: number;
    complianceRate: number;
  }>;
  
  // Métricas por industria
  byIndustry: Array<{
    type: IndustryType;
    count: number;
    averageQualityScore: number;
    averageComplianceRate: number;
    topCertifications: string[];
  }>;
  
  calculatedAt: Date;
}

// Configuración por defecto para nuevas empresas
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  timezone: 'America/Bogota',
  currency: 'COP',
  language: 'es',
  dateFormat: 'DD/MM/YYYY',
  
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
    processesEnabled: true,
    risksEnabled: true,
    trainingsEnabled: true,
    suppliersEnabled: true,
    reportsEnabled: true,
    analyticsEnabled: true,
    notificationsEnabled: true,
    gamificationEnabled: true
  },
  
  notifications: {
    emailAlerts: true,
    pushNotifications: true
  },
  
  quality: {
    defaultProcesses: [],
    auditFrequency: 'monthly',
    complianceStandards: ['ISO_9001_2015'],
    qualityObjectives: [],
    kpis: []
  },
  
  integrations: {
    erp: { enabled: false },
    crm: { enabled: false },
    accounting: { enabled: false },
    hrms: { enabled: false }
  }
};

// Templates de departamentos por industria
export const INDUSTRY_DEPARTMENT_TEMPLATES: Record<IndustryType, Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[]> = {
  manufacturing: [
    {
      name: 'Producción',
      code: 'PROD',
      processes: ['fabricacion', 'ensamblaje', 'control_calidad', 'mantenimiento_equipos'],
      isActive: true
    },
    {
      name: 'Calidad',
      code: 'QA',
      processes: ['inspeccion', 'pruebas', 'certificacion', 'mejora_continua'],
      isActive: true
    },
    {
      name: 'Almacén',
      code: 'ALM',
      processes: ['recepcion', 'almacenamiento', 'despacho', 'inventario'],
      isActive: true
    },
    {
      name: 'Ingeniería',
      code: 'ING',
      processes: ['diseño', 'desarrollo', 'prototipado', 'documentacion_tecnica'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['contabilidad', 'recursos_humanos', 'compras', 'ventas'],
      isActive: true
    }
  ],
  
  hospitality: [
    {
      name: 'Recepción',
      code: 'REC',
      processes: ['check_in', 'check_out', 'reservas', 'atencion_cliente'],
      isActive: true
    },
    {
      name: 'Housekeeping',
      code: 'HK',
      processes: ['limpieza_habitaciones', 'lavanderia', 'mantenimiento_preventivo'],
      isActive: true
    },
    {
      name: 'Alimentos y Bebidas',
      code: 'AYB',
      processes: ['cocina', 'servicio_mesa', 'bar', 'eventos'],
      isActive: true
    },
    {
      name: 'Mantenimiento',
      code: 'MNT',
      processes: ['mantenimiento_correctivo', 'mantenimiento_preventivo', 'jardineria'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['contabilidad', 'recursos_humanos', 'compras'],
      isActive: true
    }
  ],
  
  healthcare: [
    {
      name: 'Servicios Médicos',
      code: 'MED',
      processes: ['consulta', 'diagnostico', 'tratamiento', 'cirugia'],
      isActive: true
    },
    {
      name: 'Enfermería',
      code: 'ENF',
      processes: ['cuidados', 'administracion_medicamentos', 'monitoreo', 'educacion_paciente'],
      isActive: true
    },
    {
      name: 'Laboratorio',
      code: 'LAB',
      processes: ['toma_muestras', 'analisis', 'reporte_resultados', 'control_calidad'],
      isActive: true
    },
    {
      name: 'Farmacia',
      code: 'FARM',
      processes: ['dispensacion', 'preparacion', 'almacenamiento', 'farmacovigilancia'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['admisiones', 'facturacion', 'recursos_humanos', 'compras'],
      isActive: true
    }
  ],
  
  retail: [
    {
      name: 'Ventas',
      code: 'VTA',
      processes: ['atencion_cliente', 'cierre_ventas', 'postventa', 'devoluciones'],
      isActive: true
    },
    {
      name: 'Almacén',
      code: 'ALM',
      processes: ['recepcion', 'almacenamiento', 'inventario', 'reposicion'],
      isActive: true
    },
    {
      name: 'Marketing',
      code: 'MKT',
      processes: ['publicidad', 'promociones', 'visual_merchandising', 'analisis_mercado'],
      isActive: true
    },
    {
      name: 'Logística',
      code: 'LOG',
      processes: ['distribucion', 'transporte', 'ultima_milla', 'gestion_proveedores'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['contabilidad', 'recursos_humanos', 'compras', 'finanzas'],
      isActive: true
    }
  ],
  
  technology: [
    {
      name: 'Desarrollo',
      code: 'DEV',
      processes: ['analisis', 'diseño', 'codificacion', 'pruebas', 'despliegue'],
      isActive: true
    },
    {
      name: 'Infraestructura',
      code: 'INFRA',
      processes: ['servidores', 'redes', 'seguridad', 'monitoreo', 'backup'],
      isActive: true
    },
    {
      name: 'Soporte',
      code: 'SUP',
      processes: ['help_desk', 'incidentes', 'cambios', 'problemas'],
      isActive: true
    },
    {
      name: 'Calidad',
      code: 'QA',
      processes: ['testing', 'automatizacion', 'performance', 'seguridad'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['contabilidad', 'recursos_humanos', 'compras', 'legal'],
      isActive: true
    }
  ],
  
  // Plantilla genérica para otras industrias
  other: [
    {
      name: 'Operaciones',
      code: 'OPS',
      processes: ['proceso_principal', 'control_calidad', 'mejora_continua'],
      isActive: true
    },
    {
      name: 'Comercial',
      code: 'COM',
      processes: ['ventas', 'marketing', 'servicio_cliente'],
      isActive: true
    },
    {
      name: 'Administración',
      code: 'ADM',
      processes: ['contabilidad', 'recursos_humanos', 'compras'],
      isActive: true
    },
    {
      name: 'Calidad',
      code: 'CAL',
      processes: ['documentacion', 'auditorias', 'no_conformidades'],
      isActive: true
    }
  ],
  
  // Para el resto de industrias, usar el template genérico
  construction: [],
  finance: [],
  consulting: [],
  logistics: [],
  agriculture: [],
  energy: [],
  telecommunications: [],
  real_estate: [],
  automotive: [],
  pharmaceutical: [],
  food_service: [],
  entertainment: [],
  non_profit: [],
  government: [],
  education: []
};

// Helper para obtener departamentos por defecto
export function getDefaultDepartmentsByIndustry(industryType: IndustryType): Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[] {
  return INDUSTRY_DEPARTMENT_TEMPLATES[industryType]?.length > 0 
    ? INDUSTRY_DEPARTMENT_TEMPLATES[industryType]
    : INDUSTRY_DEPARTMENT_TEMPLATES.other;
}

export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'statistics'>;

export type UpdateCompanyInput = Partial<CreateCompanyInput>;