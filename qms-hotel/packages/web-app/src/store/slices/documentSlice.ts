import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  Document, 
  CreateDocumentData, 
  UpdateDocumentData,
  DocumentFilter,
  DocumentSearchResult,
  DocumentModuleStats,
  DocumentVersion,
  DocumentComment
} from '@shared/types/Document';
import { documentService, type CreateDocumentInput } from '../../services/documentService';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  searchResult: DocumentSearchResult | null;
  moduleStats: DocumentModuleStats | null;
  versions: DocumentVersion[];
  isLoading: boolean;
  error: string | null;
  filters: DocumentFilter | null;
}

const initialState: DocumentState = {
  documents: [],
  selectedDocument: null,
  searchResult: null,
  moduleStats: null,
  versions: [],
  isLoading: false,
  error: null,
  filters: null,
};

// ==================== ASYNC THUNKS ====================

// Buscar documentos con filtros
export const searchDocuments = createAsyncThunk(
  'documents/search',
  async (filters: DocumentFilter) => {
    const result = await documentService.getDocuments(filters);
    return result;
  }
);

// Obtener un documento por ID
export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (documentId: string) => {
    const document = await documentService.getDocumentById(documentId);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    return document;
  }
);

// Crear un nuevo documento
export const createDocument = createAsyncThunk(
  'documents/create',
  async ({ 
    data, 
    companyId, 
    organizationId,
    userId,
    userName,
    userEmail 
  }: { 
    data: CreateDocumentData; 
    companyId: string;
    organizationId?: string;
    userId: string;
    userName: string;
    userEmail: string;
  }) => {
    const createData: CreateDocumentInput = {
      ...data,
      companyId,
      organizationId,
      authorId: userId,
      authorName: userName,
      authorEmail: userEmail
    };
    
    const document = await documentService.createDocument(createData);
    return document;
  }
);

// Actualizar un documento
export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ 
    documentId, 
    data, 
    userId 
  }: { 
    documentId: string; 
    data: UpdateDocumentData; 
    userId: string;
  }) => {
    await documentService.updateDocument(documentId, data, userId);
    return { documentId, data };
  }
);

// Eliminar un documento
export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async ({ 
    documentId, 
    userId, 
    reason 
  }: { 
    documentId: string; 
    userId: string; 
    reason?: string;
  }) => {
    await documentService.deleteDocument(documentId, userId, reason);
    return documentId;
  }
);

// Obtener estadísticas del módulo
export const fetchModuleStats = createAsyncThunk(
  'documents/fetchStats',
  async (companyId: string) => {
    const stats = await documentService.getModuleStats(companyId);
    return stats;
  }
);

// Obtener versiones de un documento
export const fetchDocumentVersions = createAsyncThunk(
  'documents/fetchVersions',
  async (documentId: string) => {
    const versions = await documentService.getDocumentVersions(documentId);
    return versions;
  }
);

// Agregar comentario
export const addComment = createAsyncThunk(
  'documents/addComment',
  async ({ 
    documentId, 
    content, 
    authorId, 
    authorName,
    parentCommentId,
    position 
  }: { 
    documentId: string; 
    content: string; 
    authorId: string; 
    authorName: string;
    parentCommentId?: string;
    position?: any;
  }) => {
    await documentService.addComment(documentId, content, authorId, authorName, parentCommentId, position);
    return { documentId, content, authorId, authorName, parentCommentId, position };
  }
);

// Registrar visualización
export const recordView = createAsyncThunk(
  'documents/recordView',
  async ({ documentId, userId }: { documentId: string; userId: string }) => {
    await documentService.recordView(documentId, userId);
    return documentId;
  }
);

// Registrar descarga
export const recordDownload = createAsyncThunk(
  'documents/recordDownload',
  async ({ documentId, userId }: { documentId: string; userId: string }) => {
    await documentService.recordDownload(documentId, userId);
    return documentId;
  }
);

// ==================== SLICE ====================

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // Seleccionar documento
    selectDocument: (state, action: PayloadAction<Document>) => {
      state.selectedDocument = action.payload;
    },
    
    // Limpiar documento seleccionado
    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
    },
    
    // Establecer filtros
    setFilters: (state, action: PayloadAction<DocumentFilter>) => {
      state.filters = action.payload;
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.filters = null;
    },
    
    // Limpiar error
    clearError: (state) => {
      state.error = null;
    },
    
    // Limpiar resultados de búsqueda
    clearSearchResults: (state) => {
      state.searchResult = null;
      state.documents = [];
    },
    
    // Actualizar documento local (para optimistic updates)
    updateDocumentLocal: (state, action: PayloadAction<{ id: string; changes: Partial<Document> }>) => {
      const { id, changes } = action.payload;
      
      // Actualizar en la lista de documentos
      const docIndex = state.documents.findIndex(doc => doc.id === id);
      if (docIndex !== -1) {
        state.documents[docIndex] = { ...state.documents[docIndex], ...changes };
      }
      
      // Actualizar documento seleccionado si es el mismo
      if (state.selectedDocument?.id === id) {
        state.selectedDocument = { ...state.selectedDocument, ...changes };
      }
      
      // Actualizar en resultados de búsqueda
      if (state.searchResult) {
        const searchDocIndex = state.searchResult.documents.findIndex(doc => doc.id === id);
        if (searchDocIndex !== -1) {
          state.searchResult.documents[searchDocIndex] = { 
            ...state.searchResult.documents[searchDocIndex], 
            ...changes 
          };
        }
      }
    }
  },
  
  extraReducers: (builder) => {
    // ========== BÚSQUEDA DE DOCUMENTOS ==========
    builder
      .addCase(searchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResult = action.payload;
        state.documents = action.payload.documents;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al buscar documentos';
      });

    // ========== OBTENER DOCUMENTO POR ID ==========
    builder
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al obtener documento';
      });

    // ========== CREAR DOCUMENTO ==========
    builder
      .addCase(createDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.unshift(action.payload);
        if (state.searchResult) {
          state.searchResult.documents.unshift(action.payload);
          state.searchResult.totalCount++;
        }
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al crear documento';
      });

    // ========== ACTUALIZAR DOCUMENTO ==========
    builder
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const { documentId, data } = action.payload;
        
        // Actualizar en la lista
        const docIndex = state.documents.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          state.documents[docIndex] = {
            ...state.documents[docIndex],
            ...data,
            updatedAt: new Date() as any
          };
        }
        
        // Actualizar documento seleccionado
        if (state.selectedDocument?.id === documentId) {
          state.selectedDocument = {
            ...state.selectedDocument,
            ...data,
            updatedAt: new Date() as any
          };
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al actualizar documento';
      });

    // ========== ELIMINAR DOCUMENTO ==========
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const documentId = action.payload;
        
        // Remover de la lista (soft delete, marcar como inactivo)
        const docIndex = state.documents.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          state.documents[docIndex].isActive = false;
          state.documents[docIndex].status = 'archived';
        }
        
        // Limpiar selección si es el documento eliminado
        if (state.selectedDocument?.id === documentId) {
          state.selectedDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al eliminar documento';
      });

    // ========== ESTADÍSTICAS DEL MÓDULO ==========
    builder
      .addCase(fetchModuleStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.moduleStats = action.payload;
      })
      .addCase(fetchModuleStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al obtener estadísticas';
      });

    // ========== VERSIONES DEL DOCUMENTO ==========
    builder
      .addCase(fetchDocumentVersions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.versions = action.payload;
      })
      .addCase(fetchDocumentVersions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al obtener versiones';
      });

    // ========== AGREGAR COMENTARIO ==========
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        // Optimistic update para comentarios se maneja en el componente
        // ya que necesitamos actualizar el documento en tiempo real
      });

    // ========== REGISTRAR VISUALIZACIÓN ==========
    builder
      .addCase(recordView.fulfilled, (state, action) => {
        const documentId = action.payload;
        
        // Actualizar contador de vistas localmente
        const docIndex = state.documents.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          state.documents[docIndex].stats.viewCount++;
        }
        
        if (state.selectedDocument?.id === documentId) {
          state.selectedDocument.stats.viewCount++;
        }
      });

    // ========== REGISTRAR DESCARGA ==========
    builder
      .addCase(recordDownload.fulfilled, (state, action) => {
        const documentId = action.payload;
        
        // Actualizar contador de descargas localmente
        const docIndex = state.documents.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          state.documents[docIndex].stats.downloadCount++;
        }
        
        if (state.selectedDocument?.id === documentId) {
          state.selectedDocument.stats.downloadCount++;
        }
      });
  },
});

// ==================== ACTIONS ====================
export const { 
  selectDocument, 
  clearSelectedDocument, 
  setFilters, 
  clearFilters, 
  clearError,
  clearSearchResults,
  updateDocumentLocal
} = documentSlice.actions;

// ==================== SELECTORS ====================
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectSelectedDocument = (state: RootState) => state.documents.selectedDocument;
export const selectSearchResult = (state: RootState) => state.documents.searchResult;
export const selectModuleStats = (state: RootState) => state.documents.moduleStats;
export const selectDocumentVersions = (state: RootState) => state.documents.versions;
export const selectDocumentIsLoading = (state: RootState) => state.documents.isLoading;
export const selectDocumentError = (state: RootState) => state.documents.error;
export const selectDocumentFilters = (state: RootState) => state.documents.filters;

// Selectors derivados
export const selectDocumentsByType = (type: string) => (state: RootState) =>
  state.documents.documents.filter(doc => doc.metadata.type === type);

export const selectDocumentsByStatus = (status: string) => (state: RootState) =>
  state.documents.documents.filter(doc => doc.status === status);

export const selectDocumentsByCategory = (category: string) => (state: RootState) =>
  state.documents.documents.filter(doc => doc.metadata.category === category);

export const selectRecentDocuments = (limit: number = 10) => (state: RootState) =>
  state.documents.documents
    .slice()
    .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
    .slice(0, limit);

export const selectExpiredDocuments = (state: RootState) =>
  state.documents.documents.filter(doc => 
    doc.expirationDate && doc.expirationDate.toDate() < new Date()
  );

export const selectExpiringSoonDocuments = (days: number = 30) => (state: RootState) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return state.documents.documents.filter(doc => 
    doc.expirationDate && 
    doc.expirationDate.toDate() < futureDate &&
    doc.expirationDate.toDate() > new Date()
  );
};

export const selectDocumentsNeedingReview = (state: RootState) =>
  state.documents.documents.filter(doc => doc.status === 'review');

export default documentSlice.reducer;