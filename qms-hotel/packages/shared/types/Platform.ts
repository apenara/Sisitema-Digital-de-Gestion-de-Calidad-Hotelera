export interface Platform {
  id: string;
  name: string;
  version: string;
  settings: PlatformSettings;
  statistics: PlatformStatistics;
  maintenance: MaintenanceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformSettings {
  // Configuración general
  general: {
    siteName: string;
    supportEmail: string;
    maxOrganizations: number;
    maxHotelsPerOrganization: number;
    defaultLanguage: string;
    allowedLanguages: string[];
    timezone: string;
  };
  
  // Configuración de registro
  registration: {
    allowPublicRegistration: boolean;
    requireEmailVerification: boolean;
    defaultTrialDays: number;
    autoAssignPlan: string; // Plan ID
    requireApproval: boolean;
  };
  
  // Configuración de facturación
  billing: {
    enabled: boolean;
    currency: string;
    taxRate: number;
    paymentProviders: string[];
    invoicePrefix: string;
    gracePeriodDays: number;
  };
  
  // Configuración de almacenamiento
  storage: {
    maxFileSize: number; // En bytes
    allowedFileTypes: string[];
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    retentionPeriodDays: number;
  };
  
  // Configuración de seguridad
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number; // En minutos
    maxLoginAttempts: number;
    lockoutDuration: number; // En minutos
    requireMFA: boolean;
    allowedDomains: string[]; // Para restricciones de dominio de email
  };
  
  // Configuración de notificaciones
  notifications: {
    emailProvider: string;
    smsProvider: string;
    pushEnabled: boolean;
    templates: NotificationTemplates;
  };
  
  // Configuración de integración
  integrations: {
    enabled: string[];
    apiRateLimit: number; // Requests per minute
    webhookRetries: number;
    allowExternalWebhooks: boolean;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number; // Número de contraseñas anteriores a evitar
  maxAge: number; // Días antes de expiración
}

export interface NotificationTemplates {
  welcome: string;
  passwordReset: string;
  subscriptionExpired: string;
  paymentFailed: string;
  maintenanceScheduled: string;
  securityAlert: string;
}

export interface PlatformStatistics {
  // Estadísticas generales
  totalOrganizations: number;
  totalHotels: number;
  totalUsers: number;
  totalSubscriptions: number;
  
  // Estadísticas activas
  activeOrganizations: number;
  activeHotels: number;
  activeUsers: number;
  activeSubscriptions: number;
  
  // Estadísticas de uso
  totalDocuments: number;
  totalNonConformities: number;
  totalStorageUsed: number; // En bytes
  
  // Estadísticas financieras
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalRevenue: number;
  averageRevenuePerUser: number;
  
  // Estadísticas de engagement
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  
  // Última actualización
  lastCalculated: Date;
}

export interface MaintenanceInfo {
  scheduled: MaintenanceWindow[];
  current?: MaintenanceWindow;
  history: MaintenanceWindow[];
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  impact: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  affectedServices: string[];
  
  // Notificaciones
  notifyUsers: boolean;
  notificationSent: boolean;
  notificationTime?: Date;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para dashboard de plataforma
export interface PlatformDashboardData {
  statistics: PlatformStatistics;
  recentActivity: PlatformActivity[];
  alerts: PlatformAlert[];
  systemHealth: SystemHealth;
  financialMetrics: FinancialMetrics;
}

export interface PlatformActivity {
  id: string;
  type: ActivityType;
  description: string;
  entityType: 'organization' | 'hotel' | 'user' | 'subscription' | 'system';
  entityId: string;
  entityName: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
}

export type ActivityType =
  | 'organization_created'
  | 'organization_updated'
  | 'organization_deleted'
  | 'hotel_created'
  | 'hotel_updated'
  | 'hotel_activated'
  | 'hotel_deactivated'
  | 'user_registered'
  | 'user_activated'
  | 'user_deactivated'
  | 'user_updated'
  | 'subscription_created'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'system_maintenance'
  | 'security_alert'
  | 'integration_enabled'
  | 'integration_disabled';

export interface PlatformAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  
  // Contexto
  entityType?: string;
  entityId?: string;
  
  // Timestamps
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Responsables
  createdBy?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  
  // Configuración
  autoResolve: boolean;
  notifyAdmins: boolean;
}

export type AlertType =
  | 'system_error'
  | 'high_resource_usage'
  | 'payment_failure'
  | 'security_breach'
  | 'subscription_expired'
  | 'storage_limit_reached'
  | 'api_rate_limit_exceeded'
  | 'maintenance_required'
  | 'integration_failure';

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: SystemComponent[];
  lastChecked: Date;
}

export interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime?: number; // En ms
  uptime: number; // Porcentaje
  lastChecked: Date;
  incidents: number; // En las últimas 24h
}

export interface FinancialMetrics {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  
  subscriptions: {
    new: number; // Este mes
    cancelled: number; // Este mes
    upgraded: number; // Este mes
    downgraded: number; // Este mes
  };
  
  churn: {
    rate: number; // Porcentaje mensual
    gross: number; // Usuarios perdidos
    net: number; // Considerando nuevos usuarios
  };
  
  growth: {
    mrr: number; // Crecimiento MRR mes a mes
    arr: number; // Crecimiento ARR año a año
    userBase: number; // Crecimiento de usuarios
  };
  
  forecasting: {
    nextMonthRevenue: number;
    nextQuarterRevenue: number;
    yearEndRevenue: number;
  };
}

// Tipos para operaciones de plataforma
export interface UpdatePlatformSettingsInput {
  general?: Partial<PlatformSettings['general']>;
  registration?: Partial<PlatformSettings['registration']>;
  billing?: Partial<PlatformSettings['billing']>;
  storage?: Partial<PlatformSettings['storage']>;
  security?: Partial<PlatformSettings['security']>;
  notifications?: Partial<PlatformSettings['notifications']>;
  integrations?: Partial<PlatformSettings['integrations']>;
}

export interface CreateMaintenanceWindowInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  impact: MaintenanceWindow['impact'];
  affectedServices: string[];
  notifyUsers: boolean;
}

export interface PlatformAnalyticsQuery {
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  groupBy?: 'day' | 'week' | 'month';
  filters?: {
    organizationType?: string;
    subscriptionPlan?: string;
    userRole?: string;
    hotelSize?: string;
  };
}

export interface PlatformAnalyticsResult {
  query: PlatformAnalyticsQuery;
  data: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
  summary: {
    total: Record<string, number>;
    average: Record<string, number>;
    growth: Record<string, number>;
  };
  generatedAt: Date;
}