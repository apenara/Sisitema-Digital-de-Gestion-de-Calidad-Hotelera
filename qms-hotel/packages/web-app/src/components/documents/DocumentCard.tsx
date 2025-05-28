import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Archive as ArchiveIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  recordView, 
  recordDownload,
  selectDocument 
} from '../../store/slices/documentSlice';
import { selectUser } from '../../store/slices/authSlice';
import type { Document } from '@shared/types/Document';
import { 
  DOCUMENT_TYPE_LABELS, 
  DOCUMENT_STATUS_LABELS, 
  DOCUMENT_CATEGORY_LABELS 
} from '@shared/types/Document';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onView?: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document,
  onEdit,
  onDelete,
  onView
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    if (user?.id) {
      dispatch(recordView({ documentId: document.id, userId: user.id }));
    }
    dispatch(selectDocument(document));
    if (onView) {
      onView(document);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(document);
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (user?.id) {
      dispatch(recordDownload({ documentId: document.id, userId: user.id }));
    }
    // TODO: Implementar descarga real
    console.log('Downloading document:', document.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document);
    }
    handleMenuClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <PendingIcon sx={{ fontSize: 16 }} />;
      case 'review':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case 'approved':
      case 'published':
        return <ApprovedIcon sx={{ fontSize: 16 }} />;
      case 'archived':
      case 'obsolete':
        return <ArchiveIcon sx={{ fontSize: 16 }} />;
      default:
        return <DocumentIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'review':
        return 'info';
      case 'approved':
      case 'published':
        return 'success';
      case 'archived':
      case 'obsolete':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      manual: '#1976d2',
      procedure: '#2e7d32',
      instruction: '#ed6c02',
      form: '#9c27b0',
      policy: '#d32f2f',
      plan: '#7b1fa2',
      record: '#5d4037',
      specification: '#1565c0',
      external: '#424242',
      template: '#ef6c00',
      checklist: '#00695c',
      flowchart: '#c62828',
      other: '#37474f'
    };
    return colors[type] || '#1976d2';
  };

  const getDaysUntilExpiration = () => {
    if (!document.expirationDate) return null;
    
    const now = new Date();
    const expiration = document.expirationDate.toDate();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          transition: 'all 0.2s ease-in-out'
        },
        cursor: 'pointer'
      }}
      onClick={handleView}
    >
      {/* Indicador de estado en la esquina */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1
        }}
      >
        <Chip
          icon={getStatusIcon(document.status)}
          label={DOCUMENT_STATUS_LABELS[document.status]}
          size="small"
          color={getStatusColor(document.status) as any}
          variant="filled"
        />
      </Box>

      {/* Indicador de expiración */}
      {(isExpiringSoon || isExpired) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1
          }}
        >
          <Chip
            label={isExpired ? 'Vencido' : `${daysUntilExpiration} días`}
            size="small"
            color={isExpired ? 'error' : 'warning'}
            variant="filled"
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pt: 6 }}>
        {/* Tipo de documento */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: getTypeColor(document.metadata.type),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DocumentIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {DOCUMENT_TYPE_LABELS[document.metadata.type]}
          </Typography>
        </Box>

        {/* Título y código */}
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {document.metadata.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {document.metadata.code}
        </Typography>

        {/* Descripción */}
        {document.metadata.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {document.metadata.description}
          </Typography>
        )}

        {/* Categoría */}
        <Chip
          label={DOCUMENT_CATEGORY_LABELS[document.metadata.category]}
          size="small"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Etiquetas */}
        {document.metadata.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {document.metadata.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {document.metadata.tags.length > 3 && (
              <Chip
                label={`+${document.metadata.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {/* Autor y fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
            {document.author.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="caption" display="block">
              {document.author.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {document.updatedAt.toDate().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {document.stats.viewCount}
              </Typography>
            </Box>
            {document.comments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {document.comments.length}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            v{document.currentVersion}
          </Typography>
        </Box>

        {/* Barra de progreso para revisión */}
        {document.status === 'review' && document.reviewers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Progreso de revisión
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(document.reviewers.filter(r => r.status === 'approved').length / document.reviewers.length) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              {document.reviewers.filter(r => r.status === 'approved').length} de {document.reviewers.length} aprobados
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Ver documento">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(); }}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <IconButton 
          size="small" 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleMenuOpen(e); 
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </CardActions>

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} />
          Descargar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Card>
  );
};