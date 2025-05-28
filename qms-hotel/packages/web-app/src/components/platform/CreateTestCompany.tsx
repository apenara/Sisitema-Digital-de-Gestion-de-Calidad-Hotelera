import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import { Rocket as RocketIcon } from '@mui/icons-material';
import { useAppDispatch } from '../../store';
import { createCompany } from '../../store/slices/companySlice';
import type { CreateCompanyInput } from '../../services/companyService';

export const CreateTestCompany: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTestCompany = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const testCompanyData: CreateCompanyInput = {
        name: 'TechInnovate Solutions',
        industry: {
          type: 'technology',
          size: 'medium',
          employeeCount: '50-200',
          certifications: ['ISO_27001', 'ISO_9001']
        },
        contact: {
          email: 'info@techinnovate.com',
          phone: '+1 (555) 123-4567',
          address: '123 Innovation Drive, Tech Valley, CA 94025, USA',
          website: 'https://techinnovate.com'
        },
        settings: {
          departments: ['desarrollo', 'qa', 'devops', 'soporte', 'ventas', 'marketing'],
          language: 'es',
          timezone: 'America/Los_Angeles',
          fiscalYearStart: 'january'
        }
      };

      await dispatch(createCompany({
        data: testCompanyData,
        organizationId: undefined // Empresa independiente
      })).unwrap();

      setCreated(true);
    } catch (err) {
      setError('Error al crear la empresa de prueba: ' + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  if (created) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
        <CardContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Empresa de prueba creada exitosamente!
          </Alert>
          <Typography variant="h6" gutterBottom>
            TechInnovate Solutions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            La empresa ha sido creada con:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              Industria: Tecnología
            </Typography>
            <Typography component="li" variant="body2">
              Tamaño: Mediana (50-200 empleados)
            </Typography>
            <Typography component="li" variant="body2">
              Plan: Prueba gratuita (30 días)
            </Typography>
            <Typography component="li" variant="body2">
              6 departamentos configurados
            </Typography>
          </Box>
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            Ve a la sección "Empresas" para ver y gestionar esta empresa.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <RocketIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Crear Empresa de Prueba
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Esta acción creará una empresa de demostración llamada "TechInnovate Solutions" 
          con datos de ejemplo para que puedas empezar a trabajar con el sistema.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleCreateTestCompany}
          disabled={isCreating}
          startIcon={isCreating ? <CircularProgress size={20} /> : <RocketIcon />}
        >
          {isCreating ? 'Creando empresa...' : 'Crear Empresa de Prueba'}
        </Button>
      </CardContent>
    </Card>
  );
};