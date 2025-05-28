import { Timestamp } from 'firebase/firestore';

// Tipos de documentos en el sistema de calidad
export type DocumentType = 
  | 'manual'          // Manual de calidad
  | 'procedure'       // Procedimiento operativo estándar (POE/SOP)
  | 'instruction'     // Instrucción de trabajo
  | 'form'           // Formulario/plantilla
  | 'policy'         // Política organizacional
  | 'plan'           // Plan (calidad, auditorías, etc.)
  | 'record'         // Registro/evidencia
  | 'specification'  // Especificación técnica
  | 'external'       // Documento externo (normativas, etc.)
  | 'template'       // Plantilla reutilizable
  | 'checklist'      // Lista de verificación
  | 'flowchart'      // Diagrama de flujo/proceso
  | 'other';         // Otros tipos

// Estados del documento
export type DocumentStatus = 
  | 'draft'          // Borrador
  | 'review'         // En revisión
  | 'approved'       // Aprobado
  | 'published'      // Publicado/vigente
  | 'obsolete'       // Obsoleto
  | 'archived';      // Archivado

// Categorías de documentos por industria
export type DocumentCategory = 
  | 'quality_management'     // Gestión de calidad
  | 'operations'            // Operaciones
  | 'safety'               // Seguridad
  | 'environment'          // Medio ambiente
  | 'human_resources'      // Recursos humanos
  | 'finance'              // Finanzas
  | 'legal'                // Legal/cumplimiento
  | 'technology'           // Tecnología/IT
  | 'maintenance'          // Mantenimiento
  | 'procurement'          // Compras/proveedores
  | 'training'             // Capacitación
  | 'customer_service'     // Atención al cliente
  | 'general';             // General

// Nivel de confidencialidad
export type ConfidentialityLevel = 
  | 'public'         // Público
  | 'internal'       // Interno
  | 'confidential'   // Confidencial
  | 'restricted';    // Restringido

// Roles que pueden interactuar con documentos
export type DocumentRole = 
  | 'author'         // Autor
  | 'reviewer'       // Revisor
  | 'approver'       // Aprobador
  | 'reader'         // Lector
  | 'editor';        // Editor

// Metadatos del documento
export interface DocumentMetadata {
  title: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  code: string; // Código único del documento
  department?: string;
  tags: string[];
  confidentialityLevel: ConfidentialityLevel;
  language: string;
  pageCount?: number;
  wordCount?: number;
  fileSize?: number; // en bytes
  checksum?: string; // para verificar integridad
}

// Información de archivo adjunto
export interface DocumentFile {
  id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string; // ruta en Cloud Storage
  downloadUrl?: string;
  thumbnailUrl?: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

// Control de versiones
export interface DocumentVersion {
  version: string; // ej: "1.0", "1.1", "2.0"
  majorVersion: number;
  minorVersion: number;
  patchVersion?: number;
  releaseDate: Timestamp;
  changelog: string;
  isActive: boolean;
  content?: string;
  file?: DocumentFile;
  createdBy: string;
  createdAt: Timestamp;
}

// Información del autor/revisor
export interface DocumentUser {
  id: string;
  name: string;
  email: string;
}

// Revisor de documento
export interface DocumentReviewer extends DocumentUser {
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewedAt?: Timestamp;
  deadline?: Timestamp;
}

// Aprobador de documento
export interface DocumentApprover extends DocumentUser {
  approvedAt?: Timestamp;
  comments?: string;
}

// Flujo de aprobación simplificado
export interface ApprovalStep {
  order: number;
  role: DocumentRole;
  userId?: string; // Usuario específico (opcional)
  department?: string; // Departamento (opcional)
  requiredApprovals: number; // Cuántas aprobaciones se necesitan
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  deadline?: Timestamp;
  comments?: string;
  approvedBy?: string[];
  rejectedBy?: string;
  completedAt?: Timestamp;
}

// Historial de cambios/auditoría
export interface DocumentAuditLog {
  id: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'published' | 'archived' | 'deleted' | 'downloaded' | 'viewed';
  performedBy: string;
  performedAt: Timestamp;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  version?: string;
}

// Estadísticas de uso
export interface DocumentStats {
  viewCount: number;
  downloadCount: number;
  lastViewed?: Timestamp;
  lastDownloaded?: Timestamp;
  uniqueViewers: number;
  averageViewTime?: number; // en segundos
}

// Relaciones entre documentos
export interface DocumentRelation {
  id: string;
  type: 'references' | 'supersedes' | 'implements' | 'supports' | 'related';
  description?: string;
  createdAt: Timestamp;
}

// Comentarios y anotaciones
export interface DocumentComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isResolved: boolean;
  parentCommentId?: string; // Para respuestas
  position?: {
    page?: number;
    x?: number;
    y?: number;
    selection?: string;
  };
}

// Documento principal
export interface Document {
  id: string;
  companyId: string;
  organizationId?: string;
  
  // Metadatos básicos
  metadata: DocumentMetadata;
  
  // Control de versiones
  currentVersion: string;
  versions: DocumentVersion[];
  
  // Estado y flujo
  status: DocumentStatus;
  approvalSteps?: ApprovalStep[];
  currentApprovalStep?: number;
  
  // Contenido
  content?: string; // Contenido en texto plano o markdown
  summary?: string; // Resumen ejecutivo
  
  // Usuarios involucrados
  author: DocumentUser;
  reviewers: DocumentReviewer[];
  approver?: DocumentApprover;
  
  // Fechas importantes
  effectiveDate?: Timestamp;
  expirationDate?: Timestamp;
  nextReviewDate?: Timestamp;
  publishedAt?: Timestamp;
  
  // Relaciones
  parentDocumentId?: string; // Para documentos derivados
  relatedDocuments: string[]; // IDs de documentos relacionados
  processes: string[]; // Procesos relacionados
  
  // Control de acceso
  isPublic: boolean;
  departmentIds: string[];
  
  // Auditoría y estadísticas
  auditLog: DocumentAuditLog[];
  stats: DocumentStats;
  
  // Comentarios
  comments: DocumentComment[];
  
  // Metadatos del sistema
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Índices para búsqueda
  searchableContent?: string; // Texto extraído para búsqueda
  keywords?: string[];
}

// DTOs para operaciones CRUD
export interface CreateDocumentData {
  title: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  code: string;
  content?: string;
  tags?: string[];
  departmentIds: string[];
  processes?: string[];
  relatedDocuments?: string[];
  reviewers?: string[];
  isPublic?: boolean;
  confidentialityLevel?: ConfidentialityLevel;
  effectiveDate?: Date;
  expirationDate?: Date;
  nextReviewDate?: Date;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  type?: DocumentType;
  category?: DocumentCategory;
  content?: string;
  tags?: string[];
  departmentIds?: string[];
  processes?: string[];
  relatedDocuments?: string[];
  reviewers?: string[];
  isPublic?: boolean;
  confidentialityLevel?: ConfidentialityLevel;
  effectiveDate?: Date;
  expirationDate?: Date;
  nextReviewDate?: Date;
  reason?: string; // Razón del cambio
}

// Filtros de búsqueda extendidos
export interface DocumentFilter {
  companyId: string;
  organizationId?: string;
  query?: string;
  type?: DocumentType[];
  category?: DocumentCategory[];
  status?: DocumentStatus[];
  departmentIds?: string[];
  tags?: string[];
  confidentialityLevel?: ConfidentialityLevel[];
  author?: string;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
    field: 'createdAt' | 'updatedAt' | 'effectiveDate' | 'expirationDate';
  };
  isExpiringSoon?: boolean; // próximos a vencer
  needsReview?: boolean; // necesitan revisión
  hasComments?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'effectiveDate' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// Resultado de búsqueda con metadatos
export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  facets: {
    types: { [key in DocumentType]?: number };
    categories: { [key in DocumentCategory]?: number };
    statuses: { [key in DocumentStatus]?: number };
    departments: { [department: string]: number };
    tags: { [tag: string]: number };
  };
}

// Estadísticas extendidas del módulo
export interface DocumentModuleStats {
  total: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  byCategory: Record<DocumentCategory, number>;
  byDepartment: Record<string, number>;
  recentlyCreated: number;
  needingReview: number;
  expiringSoon: number;
  pendingApproval: number;
  mostViewed: Document[];
  recentActivity: DocumentAuditLog[];
}

// Configuración de plantillas por industria
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  industryType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  template: {
    metadata: Partial<DocumentMetadata>;
    content: string;
    sections: DocumentSection[];
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DocumentSection {
  id: string;
  title: string;
  order: number;
  content: string;
  isRequired: boolean;
  placeholder?: string;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    required?: boolean;
  };
}

// Configuraciones por industria
export const DOCUMENT_CONFIGS_BY_INDUSTRY = {
  technology: {
    defaultCategories: ['technology', 'quality_management', 'operations'] as DocumentCategory[],
    requiredDocuments: ['manual', 'procedure'] as DocumentType[],
    defaultWorkflow: 'tech_approval_workflow'
  },
  manufacturing: {
    defaultCategories: ['operations', 'safety', 'quality_management'] as DocumentCategory[],
    requiredDocuments: ['manual', 'procedure', 'instruction'] as DocumentType[],
    defaultWorkflow: 'manufacturing_approval_workflow'
  },
  healthcare: {
    defaultCategories: ['quality_management', 'safety', 'legal'] as DocumentCategory[],
    requiredDocuments: ['policy', 'procedure', 'record'] as DocumentType[],
    defaultWorkflow: 'healthcare_approval_workflow'
  },
  hospitality: {
    defaultCategories: ['operations', 'customer_service', 'safety'] as DocumentCategory[],
    requiredDocuments: ['procedure', 'checklist', 'form'] as DocumentType[],
    defaultWorkflow: 'hospitality_approval_workflow'
  },
  retail: {
    defaultCategories: ['operations', 'customer_service', 'procurement'] as DocumentCategory[],
    requiredDocuments: ['procedure', 'instruction', 'checklist'] as DocumentType[],
    defaultWorkflow: 'retail_approval_workflow'
  }
} as const;

// Helpers para etiquetas de UI
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  manual: 'Manual',
  procedure: 'Procedimiento',
  instruction: 'Instrucción',
  form: 'Formulario',
  policy: 'Política',
  plan: 'Plan',
  record: 'Registro',
  specification: 'Especificación',
  external: 'Documento Externo',
  template: 'Plantilla',
  checklist: 'Lista de Verificación',
  flowchart: 'Diagrama de Flujo',
  other: 'Otro'
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Borrador',
  review: 'En Revisión',
  approved: 'Aprobado',
  published: 'Publicado',
  obsolete: 'Obsoleto',
  archived: 'Archivado'
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  quality_management: 'Gestión de Calidad',
  operations: 'Operaciones',
  safety: 'Seguridad',
  environment: 'Medio Ambiente',
  human_resources: 'Recursos Humanos',
  finance: 'Finanzas',
  legal: 'Legal/Cumplimiento',
  technology: 'Tecnología/IT',
  maintenance: 'Mantenimiento',
  procurement: 'Compras/Proveedores',
  training: 'Capacitación',
  customer_service: 'Atención al Cliente',
  general: 'General'
};

export const CONFIDENTIALITY_LEVEL_LABELS: Record<ConfidentialityLevel, string> = {
  public: 'Público',
  internal: 'Interno',
  confidential: 'Confidencial',
  restricted: 'Restringido'
};