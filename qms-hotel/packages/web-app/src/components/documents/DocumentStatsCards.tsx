import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import {
  Description as DocumentIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import type { DocumentModuleStats } from '@shared/types/Document';

interface DocumentStatsCardsProps {
  stats: DocumentModuleStats;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  trend 
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 16, 
                  mr: 0.5,
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  transform: trend.isPositive ? 'none' : 'rotate(180deg)'
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  fontWeight: 'medium'
                }}
              >
                {trend.value}% vs mes anterior
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { fontSize: 32, color } 
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const DocumentStatsCards: React.FC<DocumentStatsCardsProps> = ({ stats }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {/* Total de documentos */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Documentos"
            value={stats.total}
            icon={<DocumentIcon />}
            color="#1976d2"
            subtitle="Documentos activos"
          />
        </Grid>

        {/* Documentos más vistos */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Visualizaciones"
            value={stats.mostViewed.reduce((total, doc) => total + doc.stats.viewCount, 0)}
            icon={<ViewIcon />}
            color="#2e7d32"
            subtitle="Todas las visualizaciones"
          />
        </Grid>

        {/* Documentos pendientes de revisión */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendientes Revisión"
            value={stats.needingReview}
            icon={<ScheduleIcon />}
            color="#ed6c02"
            subtitle="Requieren atención"
          />
        </Grid>

        {/* Documentos próximos a vencer */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Próximos a Vencer"
            value={stats.expiringSoon}
            icon={<WarningIcon />}
            color="#d32f2f"
            subtitle="En los próximos 30 días"
          />
        </Grid>
      </Grid>

      {/* Estadísticas adicionales */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Por tipo de documento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos por Tipo
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type}: ${count}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Por estado */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos por Estado
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'draft': return 'warning';
                      case 'review': return 'info';
                      case 'approved': 
                      case 'published': return 'success';
                      case 'archived':
                      case 'obsolete': return 'default';
                      default: return 'primary';
                    }
                  };

                  return (
                    <Chip
                      key={status}
                      label={`${status}: ${count}`}
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos más vistos */}
        {stats.mostViewed.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Documentos Más Vistos
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.mostViewed.slice(0, 5).map((doc, index) => (
                    <Box 
                      key={doc.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        backgroundColor: index === 0 ? 'action.hover' : 'transparent',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          #{index + 1}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {doc.metadata.title}
                        </Typography>
                        <Chip 
                          label={doc.metadata.type} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {doc.stats.viewCount}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Actividad reciente */}
        {stats.recentActivity.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actividad Reciente
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <Box 
                      key={activity.id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {activity.action === 'created' && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                        {activity.action === 'updated' && <TrendingUpIcon sx={{ fontSize: 16, color: 'info.main' }} />}
                        {activity.action === 'viewed' && <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                        <Typography variant="body2">
                          Documento {activity.action === 'created' ? 'creado' : 
                                   activity.action === 'updated' ? 'actualizado' : 
                                   activity.action === 'viewed' ? 'visualizado' : activity.action}
                        </Typography>
                        {activity.version && (
                          <Chip 
                            label={`v${activity.version}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.performedAt.toDate()).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};