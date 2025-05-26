// Tipos de usuario y roles
export interface UserRole {
  role: 'admin' | 'quality_manager' | 'department_manager' | 'employee';
  permissions: string[];
  departmentAccess?: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  hotelId: string;
  role: UserRole['role'];
  permissions: string[];
  departmentAccess?: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Tipos para documentos del SGC
export interface Document {
  id: string;
  title: string;
  description: string;
  type: 'policy' | 'procedure' | 'form' | 'manual' | 'record';
  category: string;
  status: 'draft' | 'review' | 'approved' | 'obsolete';
  version: string;
  hotelId: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  fileUrl?: string;
  tags: string[];
}

// Tipos para no conformidades
export interface NonConformity {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'verified' | 'closed';
  hotelId: string;
  reportedBy: string;
  assignedTo?: string;
  department: string;
  location?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  verifiedAt?: Date;
  attachments?: string[];
}

// Tipos para procesos
export interface Process {
  id: string;
  name: string;
  description: string;
  owner: string;
  department: string;
  hotelId: string;
  inputs: string[];
  outputs: string[];
  resources: string[];
  controls: string[];
  kpis: ProcessKPI[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessKPI {
  id: string;
  name: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  currentValue?: number;
  lastMeasurement?: Date;
}

// Tipos para hotel
export interface Hotel {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  category: string;
  rooms: number;
  adminUserId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Tipos para gamificación
export interface UserPoints {
  userId: string;
  hotelId: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  level: number;
  badges: Badge[];
  lastActivityDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earnedAt: Date;
}

// Tipos para auditorías
export interface Audit {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'management_review';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  hotelId: string;
  auditor: string;
  auditee?: string;
  department?: string;
  scheduledDate: Date;
  completedDate?: Date;
  findings: AuditFinding[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  type: 'conformity' | 'non_conformity' | 'observation' | 'opportunity';
  description: string;
  evidence?: string;
  requirement: string;
  severity?: 'minor' | 'major' | 'critical';
  correctiveAction?: string;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'completed' | 'verified';
}

// Tipos de API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}