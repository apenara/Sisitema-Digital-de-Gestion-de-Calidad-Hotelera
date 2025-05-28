export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // Precios
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
    discount?: {
      percentage: number;
      label: string;
    };
  };
  
  // Límites del plan
  limits: {
    maxUsers: number;
    maxCompanies: number;
    maxStorageGB: number;
    maxDocuments: number;
    maxNonConformities: number;
    maxAuditsPerYear: number;
    maxProcesses: number;
    maxSuppliers: number;
    maxTrainings: number;
    apiCallsPerMonth: number;
  };
  
  // Características incluidas
  features: {
    // Módulos básicos
    documentsModule: boolean;
    nonConformitiesModule: boolean;
    auditsModule: boolean;
    processesModule: boolean;
    risksModule: boolean;
    trainingsModule: boolean;
    suppliersModule: boolean;
    
    // Características avanzadas
    advancedReporting: boolean;
    customDashboards: boolean;
    apiAccess: boolean;
    dataExport: boolean;
    multiLanguage: boolean;
    customBranding: boolean;
    advancedSecurity: boolean;
    auditTrail: boolean;
    
    // Integraciones
    emailIntegration: boolean;
    calendarIntegration: boolean;
    erpIntegration: boolean;
    crmIntegration: boolean;
    customIntegrations: boolean;
    
    // AI y automatización
    aiAssistant: boolean;
    automatedWorkflows: boolean;
    predictiveAnalytics: boolean;
    smartNotifications: boolean;
    
    // Soporte
    emailSupport: boolean;
    phoneSupport: boolean;
    prioritySupport: boolean;
    dedicatedAccountManager: boolean;
    onboarding: 'self' | 'guided' | 'white-glove';
    trainingHours: number;
  };
  
  // Configuración del plan
  config: {
    trialDays: number;
    isPopular: boolean;
    isEnterprise: boolean;
    minUsers: number;
    customPricing: boolean;
    yearlyOnly: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'deprecated';
  
  // Información adicional
  badges?: string[];
  highlights?: string[];
  restrictions?: string[];
}

// Planes predefinidos
export const SUBSCRIPTION_PLANS: Record<string, Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>> = {
  basic: {
    name: 'basic',
    displayName: 'Básico',
    description: 'Perfecto para pequeñas empresas que inician con la gestión de calidad',
    pricing: {
      monthly: 49,
      yearly: 470,
      currency: 'USD',
      discount: {
        percentage: 20,
        label: 'Ahorra 20% anual'
      }
    },
    limits: {
      maxUsers: 10,
      maxCompanies: 1,
      maxStorageGB: 5,
      maxDocuments: 100,
      maxNonConformities: 50,
      maxAuditsPerYear: 12,
      maxProcesses: 20,
      maxSuppliers: 30,
      maxTrainings: 50,
      apiCallsPerMonth: 1000
    },
    features: {
      // Módulos básicos
      documentsModule: true,
      nonConformitiesModule: true,
      auditsModule: true,
      processesModule: true,
      risksModule: false,
      trainingsModule: true,
      suppliersModule: false,
      
      // Características avanzadas
      advancedReporting: false,
      customDashboards: false,
      apiAccess: false,
      dataExport: true,
      multiLanguage: false,
      customBranding: false,
      advancedSecurity: false,
      auditTrail: true,
      
      // Integraciones
      emailIntegration: true,
      calendarIntegration: false,
      erpIntegration: false,
      crmIntegration: false,
      customIntegrations: false,
      
      // AI y automatización
      aiAssistant: false,
      automatedWorkflows: false,
      predictiveAnalytics: false,
      smartNotifications: true,
      
      // Soporte
      emailSupport: true,
      phoneSupport: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
      onboarding: 'self',
      trainingHours: 0
    },
    config: {
      trialDays: 14,
      isPopular: false,
      isEnterprise: false,
      minUsers: 1,
      customPricing: false,
      yearlyOnly: false
    },
    status: 'active',
    badges: ['Ideal para empezar'],
    highlights: [
      'Hasta 10 usuarios',
      'Módulos esenciales de calidad',
      'Soporte por email',
      '14 días de prueba gratis'
    ],
    restrictions: [
      'Sin módulo de riesgos',
      'Sin integraciones avanzadas',
      'Reportes básicos únicamente'
    ]
  },
  
  professional: {
    name: 'professional',
    displayName: 'Profesional',
    description: 'Para empresas en crecimiento que necesitan funcionalidades avanzadas',
    pricing: {
      monthly: 149,
      yearly: 1430,
      currency: 'USD',
      discount: {
        percentage: 20,
        label: 'Ahorra 20% anual'
      }
    },
    limits: {
      maxUsers: 50,
      maxCompanies: 3,
      maxStorageGB: 50,
      maxDocuments: 1000,
      maxNonConformities: 500,
      maxAuditsPerYear: 52,
      maxProcesses: 100,
      maxSuppliers: 200,
      maxTrainings: 500,
      apiCallsPerMonth: 10000
    },
    features: {
      // Módulos básicos
      documentsModule: true,
      nonConformitiesModule: true,
      auditsModule: true,
      processesModule: true,
      risksModule: true,
      trainingsModule: true,
      suppliersModule: true,
      
      // Características avanzadas
      advancedReporting: true,
      customDashboards: true,
      apiAccess: true,
      dataExport: true,
      multiLanguage: true,
      customBranding: true,
      advancedSecurity: true,
      auditTrail: true,
      
      // Integraciones
      emailIntegration: true,
      calendarIntegration: true,
      erpIntegration: false,
      crmIntegration: true,
      customIntegrations: false,
      
      // AI y automatización
      aiAssistant: true,
      automatedWorkflows: true,
      predictiveAnalytics: false,
      smartNotifications: true,
      
      // Soporte
      emailSupport: true,
      phoneSupport: true,
      prioritySupport: false,
      dedicatedAccountManager: false,
      onboarding: 'guided',
      trainingHours: 4
    },
    config: {
      trialDays: 30,
      isPopular: true,
      isEnterprise: false,
      minUsers: 5,
      customPricing: false,
      yearlyOnly: false
    },
    status: 'active',
    badges: ['Más popular', 'Mejor valor'],
    highlights: [
      'Hasta 50 usuarios',
      'Todos los módulos incluidos',
      'IA Assistant incluido',
      'Soporte telefónico',
      '4 horas de capacitación',
      'Personalización de marca'
    ],
    restrictions: [
      'Sin análisis predictivo',
      'Integraciones ERP limitadas'
    ]
  },
  
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Solución completa para grandes organizaciones con necesidades complejas',
    pricing: {
      monthly: 0, // Precio personalizado
      yearly: 0,
      currency: 'USD',
      discount: {
        percentage: 0,
        label: 'Precio personalizado'
      }
    },
    limits: {
      maxUsers: -1, // Ilimitado
      maxCompanies: -1,
      maxStorageGB: -1,
      maxDocuments: -1,
      maxNonConformities: -1,
      maxAuditsPerYear: -1,
      maxProcesses: -1,
      maxSuppliers: -1,
      maxTrainings: -1,
      apiCallsPerMonth: -1
    },
    features: {
      // Módulos básicos
      documentsModule: true,
      nonConformitiesModule: true,
      auditsModule: true,
      processesModule: true,
      risksModule: true,
      trainingsModule: true,
      suppliersModule: true,
      
      // Características avanzadas
      advancedReporting: true,
      customDashboards: true,
      apiAccess: true,
      dataExport: true,
      multiLanguage: true,
      customBranding: true,
      advancedSecurity: true,
      auditTrail: true,
      
      // Integraciones
      emailIntegration: true,
      calendarIntegration: true,
      erpIntegration: true,
      crmIntegration: true,
      customIntegrations: true,
      
      // AI y automatización
      aiAssistant: true,
      automatedWorkflows: true,
      predictiveAnalytics: true,
      smartNotifications: true,
      
      // Soporte
      emailSupport: true,
      phoneSupport: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      onboarding: 'white-glove',
      trainingHours: -1 // Ilimitado
    },
    config: {
      trialDays: 30,
      isPopular: false,
      isEnterprise: true,
      minUsers: 50,
      customPricing: true,
      yearlyOnly: true
    },
    status: 'active',
    badges: ['Personalizable', 'Todo incluido'],
    highlights: [
      'Usuarios ilimitados',
      'Almacenamiento ilimitado',
      'Todas las características',
      'Soporte prioritario 24/7',
      'Gerente de cuenta dedicado',
      'Onboarding personalizado',
      'SLA garantizado',
      'Integraciones personalizadas'
    ],
    restrictions: []
  },
  
  startup: {
    name: 'startup',
    displayName: 'Startup',
    description: 'Plan especial para startups y emprendedores',
    pricing: {
      monthly: 29,
      yearly: 278,
      currency: 'USD',
      discount: {
        percentage: 20,
        label: 'Ahorra 20% anual'
      }
    },
    limits: {
      maxUsers: 5,
      maxCompanies: 1,
      maxStorageGB: 2,
      maxDocuments: 50,
      maxNonConformities: 25,
      maxAuditsPerYear: 6,
      maxProcesses: 10,
      maxSuppliers: 15,
      maxTrainings: 25,
      apiCallsPerMonth: 500
    },
    features: {
      // Módulos básicos
      documentsModule: true,
      nonConformitiesModule: true,
      auditsModule: true,
      processesModule: true,
      risksModule: false,
      trainingsModule: false,
      suppliersModule: false,
      
      // Características avanzadas
      advancedReporting: false,
      customDashboards: false,
      apiAccess: false,
      dataExport: true,
      multiLanguage: false,
      customBranding: false,
      advancedSecurity: false,
      auditTrail: true,
      
      // Integraciones
      emailIntegration: true,
      calendarIntegration: false,
      erpIntegration: false,
      crmIntegration: false,
      customIntegrations: false,
      
      // AI y automatización
      aiAssistant: false,
      automatedWorkflows: false,
      predictiveAnalytics: false,
      smartNotifications: false,
      
      // Soporte
      emailSupport: true,
      phoneSupport: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
      onboarding: 'self',
      trainingHours: 0
    },
    config: {
      trialDays: 7,
      isPopular: false,
      isEnterprise: false,
      minUsers: 1,
      customPricing: false,
      yearlyOnly: false
    },
    status: 'active',
    badges: ['Económico'],
    highlights: [
      'Hasta 5 usuarios',
      'Funciones esenciales',
      'Ideal para startups',
      'Precio accesible'
    ],
    restrictions: [
      'Funcionalidades limitadas',
      'Sin AI Assistant',
      'Soporte básico'
    ]
  }
};

// Funciones auxiliares
export function calculatePlanPrice(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly', users?: number): number {
  const basePrice = billingCycle === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
  
  // Para planes enterprise con precio personalizado
  if (plan.config.customPricing && basePrice === 0) {
    return 0; // Requiere cotización
  }
  
  // Algunos planes pueden tener precio por usuario adicional
  if (users && users > plan.limits.maxUsers && plan.limits.maxUsers !== -1) {
    // Lógica para usuarios adicionales
    const extraUsers = users - plan.limits.maxUsers;
    const pricePerExtraUser = billingCycle === 'yearly' ? 10 * 12 : 10; // $10/mes por usuario extra
    return basePrice + (extraUsers * pricePerExtraUser);
  }
  
  return basePrice;
}

export function getPlanFeatures(plan: SubscriptionPlan): string[] {
  const features: string[] = [];
  
  // Usuarios y almacenamiento
  features.push(
    plan.limits.maxUsers === -1 
      ? 'Usuarios ilimitados' 
      : `Hasta ${plan.limits.maxUsers} usuarios`
  );
  
  features.push(
    plan.limits.maxStorageGB === -1 
      ? 'Almacenamiento ilimitado' 
      : `${plan.limits.maxStorageGB} GB de almacenamiento`
  );
  
  // Módulos
  const modules = [];
  if (plan.features.documentsModule) modules.push('Documentos');
  if (plan.features.nonConformitiesModule) modules.push('No Conformidades');
  if (plan.features.auditsModule) modules.push('Auditorías');
  if (plan.features.processesModule) modules.push('Procesos');
  if (plan.features.risksModule) modules.push('Riesgos');
  if (plan.features.trainingsModule) modules.push('Capacitaciones');
  if (plan.features.suppliersModule) modules.push('Proveedores');
  
  if (modules.length > 0) {
    features.push(`Módulos: ${modules.join(', ')}`);
  }
  
  // Características destacadas
  if (plan.features.aiAssistant) features.push('AI Assistant incluido');
  if (plan.features.customBranding) features.push('Personalización de marca');
  if (plan.features.apiAccess) features.push('Acceso API');
  if (plan.features.predictiveAnalytics) features.push('Análisis predictivo');
  
  // Soporte
  const support = [];
  if (plan.features.emailSupport) support.push('Email');
  if (plan.features.phoneSupport) support.push('Teléfono');
  if (plan.features.prioritySupport) support.push('Prioritario');
  if (plan.features.dedicatedAccountManager) support.push('Gerente dedicado');
  
  if (support.length > 0) {
    features.push(`Soporte: ${support.join(', ')}`);
  }
  
  return features;
}

export function getRecommendedPlan(
  users: number,
  industry: string,
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
): string {
  // Lógica de recomendación basada en usuarios y tamaño de empresa
  if (companySize === 'enterprise' || users > 50) {
    return 'enterprise';
  }
  
  if (companySize === 'micro' && users <= 5) {
    return 'startup';
  }
  
  if (companySize === 'small' && users <= 10) {
    return 'basic';
  }
  
  // Por defecto, recomendar profesional para empresas medianas
  return 'professional';
}

// Comparación de planes
export interface PlanComparison {
  feature: string;
  category: string;
  basic: boolean | string | number;
  professional: boolean | string | number;
  enterprise: boolean | string | number;
  startup?: boolean | string | number;
}

export const PLAN_COMPARISON_DATA: PlanComparison[] = [
  // Usuarios y límites
  { feature: 'Usuarios máximos', category: 'Límites', basic: 10, professional: 50, enterprise: 'Ilimitado', startup: 5 },
  { feature: 'Empresas', category: 'Límites', basic: 1, professional: 3, enterprise: 'Ilimitado', startup: 1 },
  { feature: 'Almacenamiento', category: 'Límites', basic: '5 GB', professional: '50 GB', enterprise: 'Ilimitado', startup: '2 GB' },
  { feature: 'Documentos', category: 'Límites', basic: 100, professional: 1000, enterprise: 'Ilimitado', startup: 50 },
  
  // Módulos
  { feature: 'Gestión de Documentos', category: 'Módulos', basic: true, professional: true, enterprise: true, startup: true },
  { feature: 'No Conformidades', category: 'Módulos', basic: true, professional: true, enterprise: true, startup: true },
  { feature: 'Auditorías', category: 'Módulos', basic: true, professional: true, enterprise: true, startup: true },
  { feature: 'Procesos', category: 'Módulos', basic: true, professional: true, enterprise: true, startup: true },
  { feature: 'Gestión de Riesgos', category: 'Módulos', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Capacitaciones', category: 'Módulos', basic: true, professional: true, enterprise: true, startup: false },
  { feature: 'Proveedores', category: 'Módulos', basic: false, professional: true, enterprise: true, startup: false },
  
  // Características
  { feature: 'AI Assistant', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Reportes Avanzados', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Dashboards Personalizados', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'API Access', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Multi-idioma', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Marca Personalizada', category: 'Características', basic: false, professional: true, enterprise: true, startup: false },
  
  // Soporte
  { feature: 'Soporte Email', category: 'Soporte', basic: true, professional: true, enterprise: true, startup: true },
  { feature: 'Soporte Telefónico', category: 'Soporte', basic: false, professional: true, enterprise: true, startup: false },
  { feature: 'Soporte Prioritario', category: 'Soporte', basic: false, professional: false, enterprise: true, startup: false },
  { feature: 'Gerente de Cuenta', category: 'Soporte', basic: false, professional: false, enterprise: true, startup: false },
  { feature: 'Capacitación', category: 'Soporte', basic: '0 horas', professional: '4 horas', enterprise: 'Ilimitado', startup: '0 horas' },
];

export type PlanName = 'basic' | 'professional' | 'enterprise' | 'startup';

export interface SubscriptionPlanSummary {
  id: string;
  name: PlanName;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular: boolean;
  maxUsers: number | 'unlimited';
}