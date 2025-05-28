import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getStorage 
} from 'firebase/storage';
import { db } from '../config/firebase';
import type { 
  Document, 
  CreateDocumentData, 
  UpdateDocumentData,
  DocumentFilter,
  DocumentSearchResult,
  DocumentModuleStats,
  DocumentVersion,
  DocumentComment,
  DocumentAuditLog,
  DocumentFile,
  DocumentTemplate,
  DocumentType,
  DocumentCategory,
  DocumentStatus
} from '@shared/types/Document';

const DOCUMENTS_COLLECTION = 'documents';
const DOCUMENT_VERSIONS_COLLECTION = 'documentVersions';
const DOCUMENT_TEMPLATES_COLLECTION = 'documentTemplates';
const DOCUMENT_FILES_COLLECTION = 'documentFiles';

export interface CreateDocumentInput extends CreateDocumentData {
  companyId: string;
  organizationId?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
}

export const documentService = {
  // ==================== CRUD BÁSICO ====================

  // Obtener documentos con filtros y paginación
  async getDocuments(filters: DocumentFilter): Promise<DocumentSearchResult> {
    try {
      const documentsRef = collection(db, DOCUMENTS_COLLECTION);
      const constraints: QueryConstraint[] = [];

      // Filtros obligatorios
      constraints.push(where('companyId', '==', filters.companyId));
      constraints.push(where('isActive', '==', true));

      if (filters.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }

      // Filtros opcionales
      if (filters.type && filters.type.length > 0) {
        constraints.push(where('metadata.type', 'in', filters.type));
      }

      if (filters.category && filters.category.length > 0) {
        constraints.push(where('metadata.category', 'in', filters.category));
      }

      if (filters.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }

      if (filters.departmentIds && filters.departmentIds.length > 0) {
        constraints.push(where('departmentIds', 'array-contains-any', filters.departmentIds));
      }

      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where('metadata.tags', 'array-contains-any', filters.tags));
      }

      if (filters.confidentialityLevel && filters.confidentialityLevel.length > 0) {
        constraints.push(where('metadata.confidentialityLevel', 'in', filters.confidentialityLevel));
      }

      if (filters.createdBy) {
        constraints.push(where('author.id', '==', filters.createdBy));
      }

      // Filtros de fecha
      if (filters.dateRange) {
        const { start, end, field } = filters.dateRange;
        constraints.push(where(field, '>=', Timestamp.fromDate(start)));
        constraints.push(where(field, '<=', Timestamp.fromDate(end)));
      }

      // Ordenamiento
      const sortBy = filters.sortBy || 'updatedAt';
      const sortOrder = filters.sortOrder || 'desc';
      constraints.push(orderBy(sortBy, sortOrder));

      // Límite
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(documentsRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const documents: Document[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));

      // TODO: Implementar búsqueda de texto completo
      let filteredDocuments = documents;
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        filteredDocuments = documents.filter(doc => 
          doc.metadata.title.toLowerCase().includes(searchTerm) ||
          doc.metadata.description?.toLowerCase().includes(searchTerm) ||
          doc.content?.toLowerCase().includes(searchTerm) ||
          doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Generar facetas para filtros
      const facets = this.generateFacets(filteredDocuments);

      return {
        documents: filteredDocuments,
        totalCount: filteredDocuments.length,
        facets
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Obtener un documento por ID
  async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Document;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Crear un nuevo documento
  async createDocument(data: CreateDocumentInput): Promise<Document> {
    try {
      const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
      const now = Timestamp.now();
      
      // Generar código automático si no se proporciona
      const code = data.code || await this.generateDocumentCode(data.companyId, data.type);
      
      const documentData: Omit<Document, 'id'> = {
        companyId: data.companyId,
        organizationId: data.organizationId,
        
        metadata: {
          title: data.title,
          description: data.description,
          type: data.type,
          category: data.category,
          code,
          department: data.departmentIds[0], // Primer departamento como principal
          tags: data.tags || [],
          confidentialityLevel: data.confidentialityLevel || 'internal',
          language: 'es'
        },
        
        currentVersion: '1.0',
        versions: [{
          version: '1.0',
          majorVersion: 1,
          minorVersion: 0,
          releaseDate: now,
          changelog: 'Versión inicial',
          isActive: true,
          content: data.content,
          createdBy: data.authorId,
          createdAt: now
        }],
        
        status: 'draft',
        content: data.content,
        summary: data.description,
        
        author: {
          id: data.authorId,
          name: data.authorName,
          email: data.authorEmail
        },
        reviewers: [],
        
        effectiveDate: data.effectiveDate ? Timestamp.fromDate(data.effectiveDate) : undefined,
        expirationDate: data.expirationDate ? Timestamp.fromDate(data.expirationDate) : undefined,
        nextReviewDate: data.nextReviewDate ? Timestamp.fromDate(data.nextReviewDate) : undefined,
        
        relatedDocuments: data.relatedDocuments || [],
        processes: data.processes || [],
        
        isPublic: data.isPublic || false,
        departmentIds: data.departmentIds,
        
        auditLog: [{
          id: `audit_${Date.now()}`,
          action: 'created',
          performedBy: data.authorId,
          performedAt: now,
          reason: 'Documento creado'
        }],
        
        stats: {
          viewCount: 0,
          downloadCount: 0,
          uniqueViewers: 0
        },
        
        comments: [],
        
        isActive: true,
        createdAt: now,
        updatedAt: now,
        
        searchableContent: this.extractSearchableContent({
          title: data.title,
          description: data.description,
          content: data.content,
          tags: data.tags
        }),
        keywords: data.tags || []
      };
      
      await setDoc(docRef, documentData);
      
      return {
        id: docRef.id,
        ...documentData
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Actualizar un documento
  async updateDocument(documentId: string, data: UpdateDocumentData, userId: string): Promise<void> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const now = Timestamp.now();
      
      // Obtener documento actual para auditoría
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Documento no encontrado');
      }
      
      const currentData = currentDoc.data() as Document;
      
      // Preparar datos de actualización
      const updateData: any = {
        updatedAt: now
      };
      
      // Actualizar metadatos si se proporcionan
      if (data.title || data.description || data.type || data.category || data.tags || data.confidentialityLevel) {
        updateData['metadata'] = {
          ...currentData.metadata,
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.type && { type: data.type }),
          ...(data.category && { category: data.category }),
          ...(data.tags && { tags: data.tags }),
          ...(data.confidentialityLevel && { confidentialityLevel: data.confidentialityLevel })
        };
      }
      
      // Actualizar contenido si se proporciona
      if (data.content !== undefined) {
        updateData.content = data.content;
        
        // Crear nueva versión si el contenido cambió significativamente
        if (data.content !== currentData.content) {
          const newVersion = await this.createNewVersion(currentData, data.content, userId, data.reason || 'Actualización de contenido');
          updateData.currentVersion = newVersion.version;
          updateData.versions = arrayUnion(newVersion);
        }
      }
      
      // Actualizar otros campos
      if (data.status) updateData.status = data.status;
      if (data.departmentIds) updateData.departmentIds = data.departmentIds;
      if (data.processes) updateData.processes = data.processes;
      if (data.relatedDocuments) updateData.relatedDocuments = data.relatedDocuments;
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      if (data.effectiveDate) updateData.effectiveDate = Timestamp.fromDate(data.effectiveDate);
      if (data.expirationDate) updateData.expirationDate = Timestamp.fromDate(data.expirationDate);
      if (data.nextReviewDate) updateData.nextReviewDate = Timestamp.fromDate(data.nextReviewDate);
      
      // Agregar entrada de auditoría
      const auditEntry: DocumentAuditLog = {
        id: `audit_${Date.now()}`,
        action: 'updated',
        performedBy: userId,
        performedAt: now,
        oldValues: this.extractAuditableFields(currentData),
        newValues: data,
        reason: data.reason,
        version: currentData.currentVersion
      };
      
      updateData.auditLog = arrayUnion(auditEntry);
      
      // Actualizar contenido de búsqueda
      if (updateData.metadata || data.content !== undefined) {
        updateData.searchableContent = this.extractSearchableContent({
          title: updateData.metadata?.title || currentData.metadata.title,
          description: updateData.metadata?.description || currentData.metadata.description,
          content: data.content !== undefined ? data.content : currentData.content,
          tags: updateData.metadata?.tags || currentData.metadata.tags
        });
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Eliminar un documento (soft delete)
  async deleteDocument(documentId: string, userId: string, reason?: string): Promise<void> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const now = Timestamp.now();
      
      const auditEntry: DocumentAuditLog = {
        id: `audit_${Date.now()}`,
        action: 'deleted',
        performedBy: userId,
        performedAt: now,
        reason: reason || 'Documento eliminado'
      };
      
      await updateDoc(docRef, {
        isActive: false,
        status: 'archived',
        updatedAt: now,
        auditLog: arrayUnion(auditEntry)
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // ==================== VERSIONING ====================

  // Crear una nueva versión del documento
  async createNewVersion(
    currentDoc: Document, 
    newContent: string, 
    userId: string, 
    changelog: string
  ): Promise<DocumentVersion> {
    const currentVersion = currentDoc.versions.find(v => v.isActive);
    if (!currentVersion) {
      throw new Error('No se encontró versión activa');
    }
    
    // Determinar nueva versión
    const isMinorChange = this.isMinorChange(currentVersion.content || '', newContent);
    const newMajor = isMinorChange ? currentVersion.majorVersion : currentVersion.majorVersion + 1;
    const newMinor = isMinorChange ? currentVersion.minorVersion + 1 : 0;
    
    const newVersion: DocumentVersion = {
      version: `${newMajor}.${newMinor}`,
      majorVersion: newMajor,
      minorVersion: newMinor,
      releaseDate: Timestamp.now(),
      changelog,
      isActive: true,
      content: newContent,
      createdBy: userId,
      createdAt: Timestamp.now()
    };
    
    return newVersion;
  },

  // Obtener historial de versiones
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const doc = await this.getDocumentById(documentId);
      return doc?.versions.sort((a, b) => 
        b.releaseDate.toMillis() - a.releaseDate.toMillis()
      ) || [];
    } catch (error) {
      console.error('Error fetching document versions:', error);
      throw error;
    }
  },

  // ==================== COMENTARIOS ====================

  // Agregar comentario
  async addComment(
    documentId: string, 
    content: string, 
    authorId: string, 
    authorName: string,
    parentCommentId?: string,
    position?: any
  ): Promise<void> {
    try {
      const comment: DocumentComment = {
        id: `comment_${Date.now()}`,
        content,
        authorId,
        authorName,
        createdAt: Timestamp.now(),
        isResolved: false,
        parentCommentId,
        position
      };
      
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      await updateDoc(docRef, {
        comments: arrayUnion(comment),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS ====================

  // Registrar visualización
  async recordView(documentId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      
      const auditEntry: DocumentAuditLog = {
        id: `audit_${Date.now()}`,
        action: 'viewed',
        performedBy: userId,
        performedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, {
        'stats.viewCount': increment(1),
        'stats.lastViewed': Timestamp.now(),
        auditLog: arrayUnion(auditEntry)
      });
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  },

  // Registrar descarga
  async recordDownload(documentId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      
      const auditEntry: DocumentAuditLog = {
        id: `audit_${Date.now()}`,
        action: 'downloaded',
        performedBy: userId,
        performedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, {
        'stats.downloadCount': increment(1),
        'stats.lastDownloaded': Timestamp.now(),
        auditLog: arrayUnion(auditEntry)
      });
    } catch (error) {
      console.error('Error recording download:', error);
      throw error;
    }
  },

  // Obtener estadísticas del módulo
  async getModuleStats(companyId: string): Promise<DocumentModuleStats> {
    try {
      const documents = await this.getDocuments({ 
        companyId, 
        limit: 1000 
      });
      
      const docs = documents.documents;
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const stats: DocumentModuleStats = {
        total: docs.length,
        byType: {} as Record<DocumentType, number>,
        byStatus: {} as Record<DocumentStatus, number>,
        byCategory: {} as Record<DocumentCategory, number>,
        byDepartment: {},
        recentlyCreated: docs.filter(d => d.createdAt.toDate() > lastWeek).length,
        needingReview: docs.filter(d => d.status === 'review').length,
        expiringSoon: docs.filter(d => 
          d.expirationDate && 
          d.expirationDate.toDate() < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        ).length,
        pendingApproval: docs.filter(d => d.status === 'review').length,
        mostViewed: docs
          .sort((a, b) => b.stats.viewCount - a.stats.viewCount)
          .slice(0, 5),
        recentActivity: docs
          .flatMap(d => d.auditLog)
          .sort((a, b) => b.performedAt.toMillis() - a.performedAt.toMillis())
          .slice(0, 10)
      };
      
      // Calcular agrupaciones
      docs.forEach(doc => {
        // Por tipo
        stats.byType[doc.metadata.type] = (stats.byType[doc.metadata.type] || 0) + 1;
        
        // Por estado
        stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
        
        // Por categoría
        stats.byCategory[doc.metadata.category] = (stats.byCategory[doc.metadata.category] || 0) + 1;
        
        // Por departamento
        doc.departmentIds.forEach(deptId => {
          stats.byDepartment[deptId] = (stats.byDepartment[deptId] || 0) + 1;
        });
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting module stats:', error);
      throw error;
    }
  },

  // ==================== HELPERS PRIVADOS ====================

  // Generar código automático del documento
  async generateDocumentCode(companyId: string, type: DocumentType): Promise<string> {
    const prefix = this.getTypePrefix(type);
    const year = new Date().getFullYear().toString().slice(-2);
    
    // Obtener último número para este tipo
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('companyId', '==', companyId),
      where('metadata.type', '==', type),
      orderBy('metadata.code', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextNumber = 1;
    
    if (!snapshot.empty) {
      const lastCode = snapshot.docs[0].data().metadata.code;
      const match = lastCode.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    return `${prefix}-${year}-${nextNumber.toString().padStart(3, '0')}`;
  },

  // Obtener prefijo por tipo de documento
  getTypePrefix(type: DocumentType): string {
    const prefixes = {
      manual: 'MAN',
      procedure: 'PRO',
      instruction: 'INS',
      form: 'FOR',
      policy: 'POL',
      plan: 'PLA',
      record: 'REC',
      specification: 'ESP',
      external: 'EXT',
      template: 'TPL',
      checklist: 'CHK',
      flowchart: 'FLW',
      other: 'OTR'
    };
    return prefixes[type] || 'DOC';
  },

  // Extraer contenido para búsqueda
  extractSearchableContent(data: {
    title?: string;
    description?: string;
    content?: string;
    tags?: string[];
  }): string {
    const parts = [
      data.title,
      data.description,
      data.content,
      ...(data.tags || [])
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  },

  // Determinar si es un cambio menor
  isMinorChange(oldContent: string, newContent: string): boolean {
    // Lógica simple: si el cambio es menos del 20% del contenido, es menor
    const oldLength = oldContent.length;
    const newLength = newContent.length;
    const lengthDiff = Math.abs(oldLength - newLength);
    
    return lengthDiff < oldLength * 0.2;
  },

  // Extraer campos auditables
  extractAuditableFields(doc: Document): Record<string, any> {
    return {
      title: doc.metadata.title,
      type: doc.metadata.type,
      category: doc.metadata.category,
      status: doc.status,
      content: doc.content?.substring(0, 100) + '...' // Solo los primeros 100 caracteres
    };
  },

  // Generar facetas para filtros
  generateFacets(documents: Document[]): DocumentSearchResult['facets'] {
    const facets: DocumentSearchResult['facets'] = {
      types: {},
      categories: {},
      statuses: {},
      departments: {},
      tags: {}
    };
    
    documents.forEach(doc => {
      // Tipos
      facets.types[doc.metadata.type] = (facets.types[doc.metadata.type] || 0) + 1;
      
      // Categorías
      facets.categories[doc.metadata.category] = (facets.categories[doc.metadata.category] || 0) + 1;
      
      // Estados
      facets.statuses[doc.status] = (facets.statuses[doc.status] || 0) + 1;
      
      // Departamentos
      doc.departmentIds.forEach(deptId => {
        facets.departments[deptId] = (facets.departments[deptId] || 0) + 1;
      });
      
      // Tags
      doc.metadata.tags.forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });
    });
    
    return facets;
  }
};