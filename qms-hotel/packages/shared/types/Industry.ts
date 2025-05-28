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

export interface IndustryConfig {
  type: IndustryType;
  label: string;
  description: string;
  icon?: string;
  color?: string;
  defaultProcesses: string[];
  commonCertifications: string[];
  kpiTemplates: KPITemplate[];
  riskCategories: string[];
}

export interface KPITemplate {
  id: string;
  name: string;
  description: string;
  unit: string;
  defaultTarget?: number;
  calculation?: string;
  category: 'quality' | 'productivity' | 'safety' | 'customer' | 'financial' | 'environmental';
}

export const INDUSTRY_CONFIGS: Record<IndustryType, IndustryConfig> = {
  manufacturing: {
    type: 'manufacturing',
    label: 'Manufactura',
    description: 'Producción y fabricación de bienes',
    icon: 'factory',
    color: '#1976d2',
    defaultProcesses: [
      'planificacion_produccion',
      'control_inventario',
      'fabricacion',
      'control_calidad',
      'empaque',
      'despacho',
      'mantenimiento_equipos',
      'gestion_proveedores'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_14001',
      'ISO_45001',
      'IATF_16949',
      'ISO_50001'
    ],
    kpiTemplates: [
      {
        id: 'oee',
        name: 'OEE (Eficiencia General de Equipos)',
        description: 'Mide la eficiencia de los equipos de producción',
        unit: '%',
        defaultTarget: 85,
        category: 'productivity'
      },
      {
        id: 'defect_rate',
        name: 'Tasa de Defectos',
        description: 'Porcentaje de productos defectuosos',
        unit: 'PPM',
        defaultTarget: 100,
        category: 'quality'
      },
      {
        id: 'on_time_delivery',
        name: 'Entregas a Tiempo',
        description: 'Porcentaje de entregas realizadas a tiempo',
        unit: '%',
        defaultTarget: 95,
        category: 'customer'
      }
    ],
    riskCategories: [
      'seguridad_laboral',
      'calidad_producto',
      'cadena_suministro',
      'equipos_maquinaria',
      'ambiental'
    ]
  },

  hospitality: {
    type: 'hospitality',
    label: 'Hospitalidad',
    description: 'Hoteles, restaurantes y servicios turísticos',
    icon: 'hotel',
    color: '#9c27b0',
    defaultProcesses: [
      'reservas',
      'check_in_out',
      'limpieza_habitaciones',
      'servicio_alimentos',
      'mantenimiento_instalaciones',
      'atencion_cliente',
      'gestion_eventos'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_14001',
      'ISO_22000',
      'HACCP',
      'Green_Key'
    ],
    kpiTemplates: [
      {
        id: 'occupancy_rate',
        name: 'Tasa de Ocupación',
        description: 'Porcentaje de habitaciones ocupadas',
        unit: '%',
        defaultTarget: 75,
        category: 'financial'
      },
      {
        id: 'guest_satisfaction',
        name: 'Satisfacción del Huésped',
        description: 'Índice de satisfacción del cliente',
        unit: 'puntos',
        defaultTarget: 4.5,
        category: 'customer'
      },
      {
        id: 'revpar',
        name: 'RevPAR',
        description: 'Ingresos por habitación disponible',
        unit: 'COP',
        category: 'financial'
      }
    ],
    riskCategories: [
      'seguridad_huesped',
      'higiene_alimentos',
      'mantenimiento',
      'satisfaccion_cliente',
      'reputacion_online'
    ]
  },

  healthcare: {
    type: 'healthcare',
    label: 'Salud',
    description: 'Hospitales, clínicas y servicios médicos',
    icon: 'local_hospital',
    color: '#f44336',
    defaultProcesses: [
      'admision_pacientes',
      'atencion_medica',
      'diagnostico',
      'tratamiento',
      'cirugia',
      'cuidados_enfermeria',
      'farmacia',
      'laboratorio',
      'alta_paciente'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_15189',
      'JCI',
      'ISO_13485',
      'ISO_45001'
    ],
    kpiTemplates: [
      {
        id: 'patient_satisfaction',
        name: 'Satisfacción del Paciente',
        description: 'Índice de satisfacción del paciente',
        unit: '%',
        defaultTarget: 90,
        category: 'customer'
      },
      {
        id: 'infection_rate',
        name: 'Tasa de Infección',
        description: 'Porcentaje de infecciones intrahospitalarias',
        unit: '%',
        defaultTarget: 2,
        category: 'quality'
      },
      {
        id: 'bed_occupancy',
        name: 'Ocupación de Camas',
        description: 'Porcentaje de camas ocupadas',
        unit: '%',
        defaultTarget: 85,
        category: 'productivity'
      }
    ],
    riskCategories: [
      'seguridad_paciente',
      'infecciones',
      'errores_medicacion',
      'equipos_medicos',
      'confidencialidad'
    ]
  },

  retail: {
    type: 'retail',
    label: 'Comercio Minorista',
    description: 'Tiendas y comercio al por menor',
    icon: 'store',
    color: '#ff9800',
    defaultProcesses: [
      'gestion_inventario',
      'ventas',
      'atencion_cliente',
      'visual_merchandising',
      'recepcion_mercancia',
      'control_perdidas',
      'promociones',
      'devoluciones'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_14001',
      'ISO_45001',
      'PCI_DSS'
    ],
    kpiTemplates: [
      {
        id: 'sales_conversion',
        name: 'Conversión de Ventas',
        description: 'Porcentaje de visitantes que compran',
        unit: '%',
        defaultTarget: 20,
        category: 'financial'
      },
      {
        id: 'inventory_turnover',
        name: 'Rotación de Inventario',
        description: 'Veces que se renueva el inventario',
        unit: 'veces/año',
        defaultTarget: 12,
        category: 'productivity'
      },
      {
        id: 'customer_retention',
        name: 'Retención de Clientes',
        description: 'Porcentaje de clientes que regresan',
        unit: '%',
        defaultTarget: 60,
        category: 'customer'
      }
    ],
    riskCategories: [
      'perdida_inventario',
      'seguridad_tienda',
      'satisfaccion_cliente',
      'competencia',
      'cadena_suministro'
    ]
  },

  technology: {
    type: 'technology',
    label: 'Tecnología',
    description: 'Desarrollo de software y servicios IT',
    icon: 'computer',
    color: '#00bcd4',
    defaultProcesses: [
      'analisis_requerimientos',
      'diseño_arquitectura',
      'desarrollo_software',
      'pruebas_qa',
      'despliegue',
      'soporte_tecnico',
      'gestion_incidentes',
      'mantenimiento'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_27001',
      'CMMI',
      'ISO_20000',
      'SOC_2'
    ],
    kpiTemplates: [
      {
        id: 'uptime',
        name: 'Disponibilidad del Sistema',
        description: 'Tiempo de actividad del servicio',
        unit: '%',
        defaultTarget: 99.9,
        category: 'quality'
      },
      {
        id: 'bug_rate',
        name: 'Tasa de Errores',
        description: 'Errores por líneas de código',
        unit: 'bugs/KLOC',
        defaultTarget: 0.5,
        category: 'quality'
      },
      {
        id: 'sprint_velocity',
        name: 'Velocidad del Sprint',
        description: 'Puntos completados por sprint',
        unit: 'puntos',
        category: 'productivity'
      }
    ],
    riskCategories: [
      'seguridad_datos',
      'disponibilidad_sistema',
      'calidad_codigo',
      'gestion_proyecto',
      'cambios_tecnologia'
    ]
  },

  education: {
    type: 'education',
    label: 'Educación',
    description: 'Instituciones educativas y formación',
    icon: 'school',
    color: '#4caf50',
    defaultProcesses: [
      'admisiones',
      'planificacion_academica',
      'impartir_clases',
      'evaluacion_estudiantes',
      'tutoria',
      'gestion_biblioteca',
      'actividades_extracurriculares',
      'graduacion'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_21001',
      'Acreditacion_Nacional',
      'ISO_14001'
    ],
    kpiTemplates: [
      {
        id: 'student_satisfaction',
        name: 'Satisfacción Estudiantil',
        description: 'Índice de satisfacción de estudiantes',
        unit: '%',
        defaultTarget: 85,
        category: 'customer'
      },
      {
        id: 'graduation_rate',
        name: 'Tasa de Graduación',
        description: 'Porcentaje de estudiantes graduados',
        unit: '%',
        defaultTarget: 90,
        category: 'quality'
      },
      {
        id: 'teacher_student_ratio',
        name: 'Ratio Profesor/Estudiante',
        description: 'Número de estudiantes por profesor',
        unit: 'ratio',
        defaultTarget: 20,
        category: 'productivity'
      }
    ],
    riskCategories: [
      'seguridad_estudiantes',
      'calidad_educativa',
      'infraestructura',
      'retencion_docentes',
      'cumplimiento_normativo'
    ]
  },

  construction: {
    type: 'construction',
    label: 'Construcción',
    description: 'Construcción y obras civiles',
    icon: 'construction',
    color: '#795548',
    defaultProcesses: [
      'diseño_proyecto',
      'presupuesto',
      'permisos',
      'excavacion',
      'cimentacion',
      'estructura',
      'acabados',
      'entrega_obra'
    ],
    commonCertifications: [
      'ISO_9001_2015',
      'ISO_14001',
      'ISO_45001',
      'LEED'
    ],
    kpiTemplates: [],
    riskCategories: [
      'seguridad_obra',
      'calidad_construccion',
      'cronograma',
      'presupuesto',
      'ambiental'
    ]
  },

  finance: {
    type: 'finance',
    label: 'Finanzas',
    description: 'Servicios financieros y bancarios',
    icon: 'account_balance',
    color: '#3f51b5',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_27001', 'PCI_DSS'],
    kpiTemplates: [],
    riskCategories: []
  },

  consulting: {
    type: 'consulting',
    label: 'Consultoría',
    description: 'Servicios de consultoría y asesoría',
    icon: 'business_center',
    color: '#607d8b',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_27001'],
    kpiTemplates: [],
    riskCategories: []
  },

  logistics: {
    type: 'logistics',
    label: 'Logística',
    description: 'Transporte y distribución',
    icon: 'local_shipping',
    color: '#8bc34a',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_14001', 'ISO_45001'],
    kpiTemplates: [],
    riskCategories: []
  },

  agriculture: {
    type: 'agriculture',
    label: 'Agricultura',
    description: 'Producción agrícola y ganadera',
    icon: 'agriculture',
    color: '#689f38',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_14001', 'Global_GAP'],
    kpiTemplates: [],
    riskCategories: []
  },

  energy: {
    type: 'energy',
    label: 'Energía',
    description: 'Generación y distribución de energía',
    icon: 'bolt',
    color: '#ffc107',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_14001', 'ISO_50001'],
    kpiTemplates: [],
    riskCategories: []
  },

  telecommunications: {
    type: 'telecommunications',
    label: 'Telecomunicaciones',
    description: 'Servicios de telecomunicaciones',
    icon: 'wifi',
    color: '#009688',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_27001', 'ISO_20000'],
    kpiTemplates: [],
    riskCategories: []
  },

  real_estate: {
    type: 'real_estate',
    label: 'Bienes Raíces',
    description: 'Desarrollo y gestión inmobiliaria',
    icon: 'home',
    color: '#e91e63',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_14001'],
    kpiTemplates: [],
    riskCategories: []
  },

  automotive: {
    type: 'automotive',
    label: 'Automotriz',
    description: 'Industria automotriz y autopartes',
    icon: 'directions_car',
    color: '#424242',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'IATF_16949', 'ISO_14001'],
    kpiTemplates: [],
    riskCategories: []
  },

  pharmaceutical: {
    type: 'pharmaceutical',
    label: 'Farmacéutica',
    description: 'Industria farmacéutica y medicamentos',
    icon: 'medication',
    color: '#7b1fa2',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_13485', 'GMP'],
    kpiTemplates: [],
    riskCategories: []
  },

  food_service: {
    type: 'food_service',
    label: 'Servicios de Alimentos',
    description: 'Restaurantes y servicios de catering',
    icon: 'restaurant',
    color: '#d32f2f',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_22000', 'HACCP'],
    kpiTemplates: [],
    riskCategories: []
  },

  entertainment: {
    type: 'entertainment',
    label: 'Entretenimiento',
    description: 'Medios y entretenimiento',
    icon: 'theaters',
    color: '#6a1b9a',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_27001'],
    kpiTemplates: [],
    riskCategories: []
  },

  non_profit: {
    type: 'non_profit',
    label: 'Sin Fines de Lucro',
    description: 'Organizaciones sin fines de lucro',
    icon: 'favorite',
    color: '#c2185b',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_26000'],
    kpiTemplates: [],
    riskCategories: []
  },

  government: {
    type: 'government',
    label: 'Gobierno',
    description: 'Instituciones gubernamentales',
    icon: 'account_balance',
    color: '#1a237e',
    defaultProcesses: [],
    commonCertifications: ['ISO_9001_2015', 'ISO_27001', 'ISO_37001'],
    kpiTemplates: [],
    riskCategories: []
  },

  other: {
    type: 'other',
    label: 'Otra Industria',
    description: 'Otras industrias no especificadas',
    icon: 'business',
    color: '#757575',
    defaultProcesses: [
      'proceso_principal',
      'control_calidad',
      'atencion_cliente',
      'gestion_proveedores',
      'mejora_continua'
    ],
    commonCertifications: ['ISO_9001_2015'],
    kpiTemplates: [
      {
        id: 'customer_satisfaction',
        name: 'Satisfacción del Cliente',
        description: 'Índice general de satisfacción',
        unit: '%',
        defaultTarget: 85,
        category: 'customer'
      },
      {
        id: 'process_efficiency',
        name: 'Eficiencia de Procesos',
        description: 'Eficiencia general de los procesos',
        unit: '%',
        defaultTarget: 80,
        category: 'productivity'
      }
    ],
    riskCategories: [
      'operacional',
      'financiero',
      'cumplimiento',
      'reputacional',
      'estrategico'
    ]
  }
};

// Helper functions
export function getIndustryConfig(type: IndustryType): IndustryConfig {
  return INDUSTRY_CONFIGS[type] || INDUSTRY_CONFIGS.other;
}

export function getIndustryLabel(type: IndustryType): string {
  return INDUSTRY_CONFIGS[type]?.label || 'Otra Industria';
}

export function getIndustryIcon(type: IndustryType): string {
  return INDUSTRY_CONFIGS[type]?.icon || 'business';
}

export function getIndustryColor(type: IndustryType): string {
  return INDUSTRY_CONFIGS[type]?.color || '#757575';
}

export function getAllIndustries(): Array<{ value: IndustryType; label: string; description: string }> {
  return Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => ({
    value: key as IndustryType,
    label: config.label,
    description: config.description
  }));
}

// Certification standards
export const CERTIFICATION_STANDARDS = {
  'ISO_9001_2015': {
    name: 'ISO 9001:2015',
    description: 'Sistema de Gestión de Calidad',
    category: 'quality'
  },
  'ISO_14001': {
    name: 'ISO 14001',
    description: 'Sistema de Gestión Ambiental',
    category: 'environmental'
  },
  'ISO_45001': {
    name: 'ISO 45001',
    description: 'Sistema de Gestión de Seguridad y Salud',
    category: 'safety'
  },
  'ISO_27001': {
    name: 'ISO 27001',
    description: 'Sistema de Gestión de Seguridad de la Información',
    category: 'security'
  },
  'ISO_22000': {
    name: 'ISO 22000',
    description: 'Sistema de Gestión de Inocuidad Alimentaria',
    category: 'food_safety'
  },
  'ISO_50001': {
    name: 'ISO 50001',
    description: 'Sistema de Gestión de Energía',
    category: 'energy'
  },
  'ISO_13485': {
    name: 'ISO 13485',
    description: 'Dispositivos Médicos',
    category: 'medical'
  },
  'ISO_15189': {
    name: 'ISO 15189',
    description: 'Laboratorios Clínicos',
    category: 'medical'
  },
  'ISO_20000': {
    name: 'ISO 20000',
    description: 'Gestión de Servicios de TI',
    category: 'it'
  },
  'ISO_21001': {
    name: 'ISO 21001',
    description: 'Organizaciones Educativas',
    category: 'education'
  },
  'ISO_26000': {
    name: 'ISO 26000',
    description: 'Responsabilidad Social',
    category: 'social'
  },
  'ISO_37001': {
    name: 'ISO 37001',
    description: 'Sistema de Gestión Antisoborno',
    category: 'compliance'
  },
  'IATF_16949': {
    name: 'IATF 16949',
    description: 'Sector Automotriz',
    category: 'automotive'
  },
  'HACCP': {
    name: 'HACCP',
    description: 'Análisis de Peligros y Puntos Críticos',
    category: 'food_safety'
  },
  'GMP': {
    name: 'GMP',
    description: 'Buenas Prácticas de Manufactura',
    category: 'pharmaceutical'
  },
  'CMMI': {
    name: 'CMMI',
    description: 'Modelo de Madurez de Capacidades',
    category: 'it'
  },
  'PCI_DSS': {
    name: 'PCI DSS',
    description: 'Seguridad de Datos de Tarjetas',
    category: 'security'
  },
  'SOC_2': {
    name: 'SOC 2',
    description: 'Controles de Organización de Servicios',
    category: 'security'
  },
  'LEED': {
    name: 'LEED',
    description: 'Liderazgo en Energía y Diseño Ambiental',
    category: 'environmental'
  },
  'Global_GAP': {
    name: 'Global GAP',
    description: 'Buenas Prácticas Agrícolas',
    category: 'agriculture'
  },
  'Green_Key': {
    name: 'Green Key',
    description: 'Certificación Ambiental para Hoteles',
    category: 'environmental'
  },
  'JCI': {
    name: 'JCI',
    description: 'Joint Commission International',
    category: 'healthcare'
  }
};