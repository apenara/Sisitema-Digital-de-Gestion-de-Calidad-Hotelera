import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Description,
  Report,
  CheckCircle,
  Warning,
  Schedule,
  People
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

interface RecentActivity {
  id: string;
  type: 'document' | 'nc' | 'audit';
  title: string;
  description: string;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high';
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - En una implementación real vendría de APIs
  const stats: StatCard[] = [
    {
      title: 'Documentos Activos',
      value: 42,
      icon: <Description />,
      color: '#1976d2',
      trend: { value: 12, positive: true }
    },
    {
      title: 'No Conformidades Abiertas',
      value: 7,
      icon: <Report />,
      color: '#d32f2f',
      trend: { value: 3, positive: false }
    },
    {
      title: 'Procesos Auditados',
      value: 15,
      icon: <CheckCircle />,
      color: '#2e7d32',
      trend: { value: 5, positive: true }
    },
    {
      title: 'Usuarios Activos',
      value: 28,
      icon: <People />,
      color: '#ed6c02',
      trend: { value: 8, positive: true }
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'nc',
      title: 'Nueva No Conformidad',
      description: 'Problema en proceso de limpieza - Habitación 301',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '2',
      type: 'document',
      title: 'Documento Actualizado',
      description: 'Manual de Procedimientos v2.1 aprobado',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: '3',
      type: 'audit',
      title: 'Auditoría Completada',
      description: 'Auditoría interna - Departamento de Recepción',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: 'low'
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'document':
        return <Description color="primary" />;
      case 'nc':
        return <Report color="error" />;
      case 'audit':
        return <CheckCircle color="success" />;
      default:
        return <Schedule />;
    }
  };

  const getPriorityColor = (priority?: RecentActivity['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours === 1) return 'Hace 1 hora';
    return `Hace ${hours} horas`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido de vuelta, {user?.displayName}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: stat.color + '20',
                    color: stat.color,
                    mr: 2
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5">
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
              {stat.trend && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp
                    sx={{
                      fontSize: 16,
                      color: stat.trend.positive ? 'success.main' : 'error.main',
                      mr: 0.5,
                      transform: stat.trend.positive ? 'none' : 'rotate(180deg)'
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={stat.trend.positive ? 'success.main' : 'error.main'}
                  >
                    {stat.trend.positive ? '+' : '-'}{stat.trend.value}% este mes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Activities */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {activity.title}
                        </Typography>
                        {activity.priority && (
                          <Chip
                            label={activity.priority}
                            size="small"
                            color={getPriorityColor(activity.priority) as any}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Quick Actions & Progress */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progreso del Sistema
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Documentación</Typography>
                <Typography variant="body2">85%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={85} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Conformidad</Typography>
                <Typography variant="body2">92%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={92} color="success" />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Auditorías</Typography>
                <Typography variant="body2">67%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={67} color="warning" />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado del Hotel
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Certificación ISO</Typography>
                <Chip label="Vigente" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Última Auditoría</Typography>
                <Typography variant="caption">Hace 3 meses</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Próxima Revisión</Typography>
                <Typography variant="caption">En 2 semanas</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;