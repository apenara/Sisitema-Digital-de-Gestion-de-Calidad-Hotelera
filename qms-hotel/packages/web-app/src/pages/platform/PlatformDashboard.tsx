import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Hotel as HotelIcon,
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { transform: 'translateY(-4px)', transition: 'transform 0.2s' } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          p: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

interface ActivityItem {
  id: string;
  type: 'subscription' | 'hotel' | 'user';
  message: string;
  date: string;
}

const PlatformDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Datos de ejemplo - En producción estos vendrían de una API
  const stats = {
    organizations: 12,
    hotels: 45,
    activeUsers: 156,
    activeSubscriptions: 38
  };

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'subscription',
      message: 'Nueva suscripción activada - Hotel Marriott',
      date: '2024-03-20'
    },
    {
      id: '2',
      type: 'hotel',
      message: 'Hotel Hilton agregado a la plataforma',
      date: '2024-03-19'
    },
    {
      id: '3',
      type: 'user',
      message: '5 nuevos usuarios registrados',
      date: '2024-03-18'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'subscription':
        return <CreditCardIcon color="primary" />;
      case 'hotel':
        return <HotelIcon color="success" />;
      case 'user':
        return <PeopleIcon color="info" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de la Plataforma
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Organizaciones"
            value={stats.organizations}
            icon={<BusinessIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
            onClick={() => navigate('/platform/organizations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hoteles"
            value={stats.hotels}
            icon={<HotelIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
            onClick={() => navigate('/platform/HotelsPage')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            icon={<PeopleIcon sx={{ color: '#ed6c02' }} />}
            color="#ed6c02"
            onClick={() => navigate('/platform/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Suscripciones Activas"
            value={stats.activeSubscriptions}
            icon={<CreditCardIcon sx={{ color: '#9c27b0' }} />}
            color="#9c27b0"
            onClick={() => navigate('/platform/subscriptions')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Actividad Reciente"
              action={
                <TrendingUpIcon color="primary" />
              }
            />
            <Divider />
            <List>
              {recentActivity.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={new Date(activity.date).toLocaleDateString()}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Alertas"
              action={
                <WarningIcon color="warning" />
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No hay alertas pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformDashboard; 