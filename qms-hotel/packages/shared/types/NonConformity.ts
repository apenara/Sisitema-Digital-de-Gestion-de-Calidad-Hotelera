export type NonConformityType = 'internal' | 'external' | 'customer' | 'supplier' | 'audit';

export type NonConformityStatus = 'open' | 'in_progress' | 'pending_verification' | 'closed' | 'cancelled';

export type NonConformitySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface NonConformity {
  id: string;
  title: string;
  description: string;
  type: NonConformityType;
  severity: NonConformitySeverity;
  status: NonConformityStatus;
  code: string;
  departmentId: string;
  processId?: string;
  documentId?: string;
  location?: string;
  evidence: Evidence[];
  rootCauseAnalysis?: RootCauseAnalysis;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
    verifiedAt: Date;
  };
  tags: string[];
  relatedNCs: string[];
  cost?: {
    amount: number;
    currency: string;
    description?: string;
  };
  customer?: {
    name: string;
    contact?: string;
    complaint?: boolean;
  };
  dueDate?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    source: 'manual' | 'audit' | 'customer_complaint' | 'internal_inspection';
    priority: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface Evidence {
  id: string;
  type: 'photo' | 'document' | 'video' | 'audio' | 'other';
  filename: string;
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface RootCauseAnalysis {
  method: 'fishbone' | '5_whys' | 'brainstorming' | 'other';
  findings: string;
  rootCause: string;
  contributingFactors: string[];
  analysisDate: Date;
  analysedBy: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsibleId: string;
  responsibleName: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: Date;
  evidence?: string[];
  comments?: string;
  effectiveness?: {
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string;
    evaluatedBy: string;
    evaluatedAt: Date;
  };
}

export interface PreventiveAction {
  id: string;
  description: string;
  responsibleId: string;
  responsibleName: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: Date;
  evidence?: string[];
  comments?: string;
}

export interface CreateNonConformityData {
  title: string;
  description: string;
  type: NonConformityType;
  severity: NonConformitySeverity;
  departmentId: string;
  processId?: string;
  documentId?: string;
  location?: string;
  assignedTo?: string;
  tags?: string[];
  cost?: NonConformity['cost'];
  customer?: NonConformity['customer'];
  dueDate?: Date;
  metadata?: Partial<NonConformity['metadata']>;
}

export interface UpdateNonConformityData {
  title?: string;
  description?: string;
  type?: NonConformityType;
  severity?: NonConformitySeverity;
  status?: NonConformityStatus;
  departmentId?: string;
  processId?: string;
  documentId?: string;
  location?: string;
  assignedTo?: string;
  tags?: string[];
  cost?: NonConformity['cost'];
  customer?: NonConformity['customer'];
  dueDate?: Date;
}

export interface NonConformityFilter {
  status?: NonConformityStatus[];
  type?: NonConformityType[];
  severity?: NonConformitySeverity[];
  departmentIds?: string[];
  assignedTo?: string[];
  reportedBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  overdue?: boolean;
  search?: string;
}

export interface NonConformityStats {
  total: number;
  byStatus: Record<NonConformityStatus, number>;
  byType: Record<NonConformityType, number>;
  bySeverity: Record<NonConformitySeverity, number>;
  byDepartment: Record<string, number>;
  overdue: number;
  avgResolutionTime: number;
  trends: {
    period: 'week' | 'month' | 'quarter';
    data: Array<{
      date: string;
      count: number;
      resolved: number;
    }>;
  };
}