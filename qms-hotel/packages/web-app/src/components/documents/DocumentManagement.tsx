import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Tab,
  Tabs,
  Badge,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Description as DocumentIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  searchDocuments,
  fetchModuleStats,
  selectDocuments,
  selectModuleStats,
  selectDocumentIsLoading,
  selectDocumentError,
  setFilters,
  clearSearchResults
} from '../../store/slices/documentSlice';
import { selectSelectedCompany } from '../../store/slices/companySlice';
import { selectUser } from '../../store/slices/authSlice';
import type { 
  DocumentFilter, 
  DocumentType, 
  DocumentCategory, 
  DocumentStatus,
  Document
} from '@shared/types/Document';
import { 
  DOCUMENT_TYPE_LABELS, 
  DOCUMENT_STATUS_LABELS, 
  DOCUMENT_CATEGORY_LABELS 
} from '@shared/types/Document';
import { DocumentCreateDialog } from './DocumentCreateDialog';
import { DocumentCard } from './DocumentCard';
import { DocumentStatsCards } from './DocumentStatsCards';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export const DocumentManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const moduleStats = useAppSelector(selectModuleStats);
  const isLoading = useAppSelector(selectDocumentIsLoading);
  const error = useAppSelector(selectDocumentError);
  const selectedCompany = useAppSelector(selectSelectedCompany);
  const user = useAppSelector(selectUser);

  // Estados locales
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setLocalFilters] = useState<Partial<DocumentFilter>>({});
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<DocumentCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (selectedCompany?.id) {
      const baseFilters: DocumentFilter = {
        companyId: selectedCompany.id,
        organizationId: selectedCompany.organizationId,
        limit: 50
      };
      
      dispatch(searchDocuments(baseFilters));
      dispatch(fetchModuleStats(selectedCompany.id));
    }
  }, [dispatch, selectedCompany]);

  // Aplicar filtros por pestaña
  useEffect(() => {
    if (!selectedCompany?.id) return;

    let statusFilter: DocumentStatus[] = [];
    switch (activeTab) {
      case 0: // Todos
        break;
      case 1: // Borradores
        statusFilter = ['draft'];
        break;
      case 2: // En revisión
        statusFilter = ['review'];
        break;
      case 3: // Aprobados
        statusFilter = ['approved', 'published'];
        break;
      case 4: // Archivados
        statusFilter = ['archived', 'obsolete'];
        break;
    }

    const searchFilters: DocumentFilter = {
      companyId: selectedCompany.id,
      organizationId: selectedCompany.organizationId,
      query: searchQuery || undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      ...filters,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    };

    dispatch(setFilters(searchFilters));
    dispatch(searchDocuments(searchFilters));
  }, [dispatch, selectedCompany, activeTab, searchQuery, filters, selectedTypes, selectedCategories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // La búsqueda se ejecuta automáticamente por el useEffect
  };

  const handleApplyFilters = () => {
    setLocalFilters({
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setLocalFilters({});
    setSearchQuery('');
  };

  const getTabCounts = () => {
    if (!moduleStats) return { all: 0, draft: 0, review: 0, approved: 0, archived: 0 };
    
    return {
      all: moduleStats.total,
      draft: moduleStats.byStatus.draft || 0,
      review: moduleStats.byStatus.review || 0,
      approved: (moduleStats.byStatus.approved || 0) + (moduleStats.byStatus.published || 0),
      archived: (moduleStats.byStatus.archived || 0) + (moduleStats.byStatus.obsolete || 0)
    };
  };

  const tabCounts = getTabCounts();

  if (!selectedCompany) {
    return (
      <Alert severity="warning">
        Selecciona una empresa para gestionar documentos.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
          size="large"
        >
          Nuevo Documento
        </Button>
      </Box>

      {/* Estadísticas */}
      {moduleStats && (
        <DocumentStatsCards stats={moduleStats} />
      )}

      {/* Barra de búsqueda y filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                placeholder="Buscar documentos por título, contenido o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setIsFilterDialogOpen(true)}
            >
              Filtros
            </Button>
            {(selectedTypes.length > 0 || selectedCategories.length > 0 || searchQuery) && (
              <Button
                variant="text"
                onClick={handleClearFilters}
                size="small"
              >
                Limpiar
              </Button>
            )}
          </Box>

          {/* Filtros activos */}
          {(selectedTypes.length > 0 || selectedCategories.length > 0) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedTypes.map(type => (
                <Chip
                  key={type}
                  label={`Tipo: ${DOCUMENT_TYPE_LABELS[type]}`}
                  size="small"
                  onDelete={() => setSelectedTypes(types => types.filter(t => t !== type))}
                />
              ))}
              {selectedCategories.map(category => (
                <Chip
                  key={category}
                  label={`Categoría: ${DOCUMENT_CATEGORY_LABELS[category]}`}
                  size="small"
                  onDelete={() => setSelectedCategories(cats => cats.filter(c => c !== category))}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Badge badgeContent={tabCounts.all} color="primary" max={999}>
                Todos
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.draft} color="warning" max={999}>
                Borradores
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.review} color="info" max={999}>
                En Revisión
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.approved} color="success" max={999}>
                Aprobados
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.archived} color="default" max={999}>
                Archivados
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Lista de documentos */}
      <TabPanel value={activeTab} index={activeTab}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando documentos...</Typography>
          </Box>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No hay documentos
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchQuery || selectedTypes.length > 0 || selectedCategories.length > 0
                  ? 'No se encontraron documentos con los filtros aplicados.'
                  : 'Aún no hay documentos creados. Crea el primero para comenzar.'}
              </Typography>
              {!searchQuery && selectedTypes.length === 0 && selectedCategories.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Crear Primer Documento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {documents.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <DocumentCard document={document} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Dialog de filtros */}
      <Dialog 
        open={isFilterDialogOpen} 
        onClose={() => setIsFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filtros Avanzados</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Autocomplete
              multiple
              options={Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]}
              getOptionLabel={(option) => DOCUMENT_TYPE_LABELS[option]}
              value={selectedTypes}
              onChange={(_, newValue) => setSelectedTypes(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Tipos de Documento" />
              )}
            />
            
            <Autocomplete
              multiple
              options={Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]}
              getOptionLabel={(option) => DOCUMENT_CATEGORY_LABELS[option]}
              value={selectedCategories}
              onChange={(_, newValue) => setSelectedCategories(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Categorías" />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFilterDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleClearFilters} color="warning">
            Limpiar Todo
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Aplicar Filtros
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de creación */}
      <DocumentCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        companyId={selectedCompany.id}
        organizationId={selectedCompany.organizationId}
      />
    </Box>
  );
};