// Shared types for QMS+Hotel
export * from './Auth';
export * from './Hotel';
export * from './User';
export * from './Document';
export * from './NonConformity';

// Nuevos tipos multi-tenant
export * from './Organization';
export * from './Subscription';
export * from './Platform';

// Tipos comunes
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