export type DocumentType = 'policy' | 'procedure' | 'instruction' | 'form' | 'record' | 'manual';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'obsolete';

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  code: string;
  version: string;
  status: DocumentStatus;
  content: string;
  tags: string[];
  departmentIds: string[];
  processes: string[];
  relatedDocuments: string[];
  metadata: {
    fileSize?: number;
    mimeType?: string;
    downloadURL?: string;
    thumbnailURL?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviewers: DocumentReviewer[];
  approver?: {
    id: string;
    name: string;
    email: string;
    approvedAt: Date;
  };
  isActive: boolean;
  isPublic: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiryDate?: Date;
  reviewDate?: Date;
}

export interface DocumentReviewer {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewedAt?: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  content: string;
  changelog: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  type: DocumentType;
  code: string;
  content: string;
  tags?: string[];
  departmentIds: string[];
  processes?: string[];
  relatedDocuments?: string[];
  reviewers?: string[];
  isPublic?: boolean;
  expiryDate?: Date;
  reviewDate?: Date;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  type?: DocumentType;
  content?: string;
  tags?: string[];
  departmentIds?: string[];
  processes?: string[];
  relatedDocuments?: string[];
  reviewers?: string[];
  isPublic?: boolean;
  expiryDate?: Date;
  reviewDate?: Date;
}

export interface DocumentFilter {
  type?: DocumentType[];
  status?: DocumentStatus[];
  departmentIds?: string[];
  tags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface DocumentStats {
  total: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  byDepartment: Record<string, number>;
  recentlyCreated: number;
  needingReview: number;
  expiringSoon: number;
}