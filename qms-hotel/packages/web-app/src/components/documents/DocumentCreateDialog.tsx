import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../store';
import { createDocument, selectDocumentIsLoading, selectDocumentError } from '../../store/slices/documentSlice';
import { selectUser } from '../../store/slices/authSlice';
import { selectSelectedCompany } from '../../store/slices/companySlice';
import type { 
  CreateDocumentData, 
  DocumentType, 
  DocumentCategory,
  ConfidentialityLevel
} from '@shared/types/Document';
import { 
  DOCUMENT_TYPE_LABELS, 
  DOCUMENT_CATEGORY_LABELS, 
  CONFIDENTIALITY_LEVEL_LABELS,
  DOCUMENT_CONFIGS_BY_INDUSTRY
} from '@shared/types/Document';

interface DocumentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  organizationId?: string;
}

export const DocumentCreateDialog: React.FC<DocumentCreateDialogProps> = ({
  open,
  onClose,
  companyId,
  organizationId
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const company = useAppSelector(selectSelectedCompany);
  const isLoading = useAppSelector(selectDocumentIsLoading);
  const error = useAppSelector(selectDocumentError);

  // Estado del formulario
  const [formData, setFormData] = useState<CreateDocumentData>({
    title: '',
    description: '',
    type: 'procedure',
    category: 'quality_management',
    code: '',
    content: '',
    tags: [],
    departmentIds: [],
    processes: [],
    relatedDocuments: [],
    reviewers: [],
    isPublic: false,
    confidentialityLevel: 'internal'
  });

  // Estados para autocompletado
  const [tagInput, setTagInput] = useState('');
  const [processInput, setProcessInput] = useState('');

  // Obtener configuraciones por industria
  const industryConfig = company?.industry?.type ? 
    DOCUMENT_CONFIGS_BY_INDUSTRY[company.industry.type as keyof typeof DOCUMENT_CONFIGS_BY_INDUSTRY] : 
    null;

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'procedure',
      category: 'quality_management',
      code: '',
      content: '',
      tags: [],
      departmentIds: [],
      processes: [],
      relatedDocuments: [],
      reviewers: [],
      isPublic: false,
      confidentialityLevel: 'internal'
    });
    setTagInput('');
    setProcessInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    try {
      await dispatch(createDocument({
        data: formData,
        companyId,
        organizationId,
        userId: user.id,
        userName: user.name || user.email,
        userEmail: user.email
      })).unwrap();

      handleClose();
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleFieldChange = (field: keyof CreateDocumentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddProcess = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && processInput.trim()) {
      event.preventDefault();
      const newProcess = processInput.trim();
      if (!formData.processes.includes(newProcess)) {
        setFormData(prev => ({
          ...prev,
          processes: [...prev.processes, newProcess]
        }));
      }
      setProcessInput('');
    }
  };

  const handleRemoveProcess = (processToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      processes: prev.processes.filter(process => process !== processToRemove)
    }));
  };

  // Obtener departamentos de la empresa
  const availableDepartments = company?.settings?.departments || [];

  // Validar formulario
  const isFormValid = formData.title.trim() && formData.type && formData.category;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Typography variant="h5">
            Crear Nuevo Documento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete la información del documento que desea crear
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {industryConfig && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Sugerencias para {company?.industry?.type}:</strong> Se recomienda crear documentos de tipo{' '}
                {industryConfig.requiredDocuments.map(type => DOCUMENT_TYPE_LABELS[type]).join(', ')}.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Título del Documento"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ej: Procedimiento de Control de Calidad"
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Código del Documento"
                value={formData.code}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                placeholder="Ej: PRO-24-001"
                helperText="Dejar vacío para generar automáticamente"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe brevemente el propósito y alcance del documento..."
              />
            </Grid>

            {/* Clasificación */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Clasificación
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  label="Tipo de Documento"
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => (
                    <MenuItem key={type} value={type}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  label="Categoría"
                >
                  {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([category, label]) => (
                    <MenuItem key={category} value={category}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Confidencialidad</InputLabel>
                <Select
                  value={formData.confidentialityLevel}
                  onChange={(e) => handleFieldChange('confidentialityLevel', e.target.value)}
                  label="Nivel de Confidencialidad"
                >
                  {Object.entries(CONFIDENTIALITY_LEVEL_LABELS).map(([level, label]) => (
                    <MenuItem key={level} value={level}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Departamentos */}
            {availableDepartments.length > 0 && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={availableDepartments}
                  value={formData.departmentIds}
                  onChange={(_, newValue) => handleFieldChange('departmentIds', newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Departamentos Aplicables"
                      placeholder="Seleccionar departamentos..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Grid>
            )}

            {/* Etiquetas */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Etiquetas"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Presiona Enter para agregar etiquetas..."
                helperText="Ej: calidad, proceso, seguridad"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Procesos relacionados */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Procesos Relacionados"
                value={processInput}
                onChange={(e) => setProcessInput(e.target.value)}
                onKeyDown={handleAddProcess}
                placeholder="Presiona Enter para agregar procesos..."
                helperText="Ej: Producción, Ventas, Logística"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.processes.map((process) => (
                  <Chip
                    key={process}
                    label={process}
                    onDelete={() => handleRemoveProcess(process)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Fechas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Fechas Importantes
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Fecha Efectiva"
                value={formData.effectiveDate || null}
                onChange={(date) => handleFieldChange('effectiveDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Cuándo entra en vigor"
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Fecha de Expiración"
                value={formData.expirationDate || null}
                onChange={(date) => handleFieldChange('expirationDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Cuándo expira (opcional)"
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Próxima Revisión"
                value={formData.nextReviewDate || null}
                onChange={(date) => handleFieldChange('nextReviewDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Cuándo revisar (opcional)"
                  }
                }}
              />
            </Grid>

            {/* Contenido inicial */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contenido Inicial (Opcional)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Contenido del Documento"
                value={formData.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Escriba el contenido inicial del documento aquí. Puede editarlo más tarde con el editor completo..."
                helperText="Puede dejar esto vacío y agregar contenido después de crear el documento"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!isFormValid || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Creando...' : 'Crear Documento'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};