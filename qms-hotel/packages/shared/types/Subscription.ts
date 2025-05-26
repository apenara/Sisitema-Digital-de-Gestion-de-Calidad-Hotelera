export interface Subscription {
  id: string;
  organizationId?: string; // null para hoteles independientes
  hotelId?: string; // Para hoteles independientes
  
  // Plan y estado
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  
  // Fechas
  startDate: Date;
  endDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Facturación
  billing: BillingInfo;
  
  // Límites y uso
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
  
  // Precio
  pricing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    trialDays?: number;
  };
  
  // Límites del plan
  limits: SubscriptionLimits;
  
  // Características incluidas
  features: PlanFeatures;
  
  // Estado
  isActive: boolean;
  isPublic: boolean; // Si se muestra en pricing público
}

export interface SubscriptionLimits {
  maxUsers: number;
  maxHotels: number; // Para organizaciones
  maxDocuments: number;
  maxStorage: number; // En bytes
  maxAPIRequests: number; // Por mes
  
  // Características booleanas
  multiHotelManagement: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

export interface SubscriptionUsage {
  currentUsers: number;
  currentHotels: number;
  currentDocuments: number;
  currentStorage: number;
  currentAPIRequests: number;
  
  // Histórico (último mes)
  lastMonth: {
    apiRequests: number;
    documentsCreated: number;
    storageUsed: number;
  };
  
  // Última actualización
  lastCalculated: Date;
}

export interface BillingInfo {
  email: string;
  name: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  
  // Método de pago
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'invoice';
    last4?: string; // Para tarjetas
    brand?: string; // Para tarjetas
    expiryMonth?: number;
    expiryYear?: number;
  };
  
  // Facturación
  invoiceSettings: {
    sendInvoices: boolean;
    invoiceLanguage: string;
    taxId?: string;
  };
}

export interface PlanFeatures {
  // Gestión básica
  documentManagement: boolean;
  nonConformityTracking: boolean;
  userManagement: boolean;
  basicReporting: boolean;
  
  // Características avanzadas
  multiHotelManagement: boolean;
  advancedAnalytics: boolean;
  customWorkflows: boolean;
  apiAccess: boolean;
  
  // Integraciones
  standardIntegrations: boolean;
  customIntegrations: boolean;
  thirdPartyConnectors: boolean;
  
  // Soporte y servicios
  emailSupport: boolean;
  prioritySupport: boolean;
  phoneSupport: boolean;
  dedicatedManager: boolean;
  
  // Personalización
  customBranding: boolean;
  whiteLabel: boolean;
  customDomain: boolean;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

// Tipos para operaciones
export interface CreateSubscriptionInput {
  organizationId?: string;
  hotelId?: string;
  planId: string;
  billing: Omit<BillingInfo, 'paymentMethod'>;
  trialDays?: number;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  billing?: Partial<BillingInfo>;
  status?: SubscriptionStatus;
}

// Tipos para métricas de subscripciones
export interface SubscriptionMetrics {
  subscriptionId: string;
  planType: SubscriptionPlan['type'];
  revenue: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    ltv: number; // Lifetime Value
  };
  growth: {
    newSubscriptions: number;
    cancellations: number;
    upgrades: number;
    downgrades: number;
  };
  usageMetrics: {
    utilizationRate: number; // % de límites utilizados
    activeUsers: number;
    featuresUsed: string[];
  };
  calculatedAt: Date;
}

// Eventos de subscripción para tracking
export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type: SubscriptionEventType;
  data: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

export type SubscriptionEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'trial_started'
  | 'trial_ended'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'usage_limit_reached'
  | 'usage_limit_exceeded';

// Planes predefinidos
export const DEFAULT_PLANS: Record<string, Omit<SubscriptionPlan, 'id' | 'isActive' | 'isPublic'>> = {
  free: {
    name: 'Gratuito',
    description: 'Plan básico para hoteles pequeños',
    type: 'free',
    pricing: {
      amount: 0,
      currency: 'USD',
      interval: 'monthly',
      trialDays: 0
    },
    limits: {
      maxUsers: 5,
      maxHotels: 1,
      maxDocuments: 100,
      maxStorage: 1024 * 1024 * 100, // 100MB
      maxAPIRequests: 1000,
      multiHotelManagement: false,
      advancedAnalytics: false,
      customIntegrations: false,
      prioritySupport: false,
      customBranding: false
    },
    features: {
      documentManagement: true,
      nonConformityTracking: true,
      userManagement: true,
      basicReporting: true,
      multiHotelManagement: false,
      advancedAnalytics: false,
      customWorkflows: false,
      apiAccess: false,
      standardIntegrations: false,
      customIntegrations: false,
      thirdPartyConnectors: false,
      emailSupport: true,
      prioritySupport: false,
      phoneSupport: false,
      dedicatedManager: false,
      customBranding: false,
      whiteLabel: false,
      customDomain: false
    }
  },
  basic: {
    name: 'Básico',
    description: 'Plan profesional para hoteles medianos',
    type: 'basic',
    pricing: {
      amount: 99,
      currency: 'USD',
      interval: 'monthly',
      trialDays: 14
    },
    limits: {
      maxUsers: 25,
      maxHotels: 1,
      maxDocuments: 1000,
      maxStorage: 1024 * 1024 * 1024, // 1GB
      maxAPIRequests: 10000,
      multiHotelManagement: false,
      advancedAnalytics: true,
      customIntegrations: false,
      prioritySupport: true,
      customBranding: true
    },
    features: {
      documentManagement: true,
      nonConformityTracking: true,
      userManagement: true,
      basicReporting: true,
      multiHotelManagement: false,
      advancedAnalytics: true,
      customWorkflows: true,
      apiAccess: true,
      standardIntegrations: true,
      customIntegrations: false,
      thirdPartyConnectors: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: false,
      dedicatedManager: false,
      customBranding: true,
      whiteLabel: false,
      customDomain: false
    }
  },
  premium: {
    name: 'Premium',
    description: 'Plan avanzado para cadenas hoteleras',
    type: 'premium',
    pricing: {
      amount: 299,
      currency: 'USD',
      interval: 'monthly',
      trialDays: 30
    },
    limits: {
      maxUsers: 100,
      maxHotels: 10,
      maxDocuments: 10000,
      maxStorage: 1024 * 1024 * 1024 * 10, // 10GB
      maxAPIRequests: 100000,
      multiHotelManagement: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      customBranding: true
    },
    features: {
      documentManagement: true,
      nonConformityTracking: true,
      userManagement: true,
      basicReporting: true,
      multiHotelManagement: true,
      advancedAnalytics: true,
      customWorkflows: true,
      apiAccess: true,
      standardIntegrations: true,
      customIntegrations: true,
      thirdPartyConnectors: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      dedicatedManager: false,
      customBranding: true,
      whiteLabel: true,
      customDomain: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Plan empresarial con soporte dedicado',
    type: 'enterprise',
    pricing: {
      amount: 999,
      currency: 'USD',
      interval: 'monthly',
      trialDays: 30
    },
    limits: {
      maxUsers: -1, // Ilimitado
      maxHotels: -1, // Ilimitado
      maxDocuments: -1, // Ilimitado
      maxStorage: -1, // Ilimitado
      maxAPIRequests: -1, // Ilimitado
      multiHotelManagement: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      customBranding: true
    },
    features: {
      documentManagement: true,
      nonConformityTracking: true,
      userManagement: true,
      basicReporting: true,
      multiHotelManagement: true,
      advancedAnalytics: true,
      customWorkflows: true,
      apiAccess: true,
      standardIntegrations: true,
      customIntegrations: true,
      thirdPartyConnectors: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      dedicatedManager: true,
      customBranding: true,
      whiteLabel: true,
      customDomain: true
    }
  }
};