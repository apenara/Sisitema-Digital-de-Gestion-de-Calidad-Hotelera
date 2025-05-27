import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import DashboardIcon from '@mui/icons-material/Dashboard';

interface ViewSelectorProps {
  onSelect: (view: 'platform' | 'dashboard') => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ onSelect }) => {
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Selecciona tu vista
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Como Super Administrador, puedes acceder tanto a la plataforma como al dashboard
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => onSelect('platform')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <HotelIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Plataforma
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona la configuración global, organizaciones, hoteles y suscripciones
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 3 }}
                  onClick={() => onSelect('platform')}
                >
                  Acceder a Plataforma
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => onSelect('dashboard')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accede al dashboard para gestionar documentos, no conformidades y reportes
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 3 }}
                  onClick={() => onSelect('dashboard')}
                >
                  Acceder al Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ViewSelector; 