import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { Box, CircularProgress } from '@mui/material';

const SmartRedirect: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (isRedirecting) return;

      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        setIsRedirecting(true);
        navigate('/login', { replace: true });
        return;
      }

      // Si no hay usuario cargado aún, esperar
      if (!user) {
        return;
      }

      // Redirección basada en el rol del usuario
      setIsRedirecting(true);
      try {
        switch (user.role) {
          case 'super_admin':
            await navigate('/platform', { replace: true });
            break;
          
          case 'chain_admin':
            // Si tiene organizationId, ir al dashboard de la organización
            if (user.organizationId) {
              await navigate(`/org/${user.organizationId}`, { replace: true });
            } else {
              // Si no, ir al dashboard de plataforma
              await navigate('/platform', { replace: true });
            }
            break;
          
          case 'hotel_admin':
          case 'quality_manager':
          case 'department_manager':
          case 'employee':
          default:
            // Usuarios de hotel van al dashboard de hotel
            await navigate('/dashboard', { replace: true });
            break;
        }
      } catch (error) {
        console.error('Error durante la redirección:', error);
        setIsRedirecting(false);
      }
    };

    handleRedirect();
  }, [isAuthenticated, user, navigate, isRedirecting]);

  // Mostrar loading mientras se procesa la redirección
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress size={60} thickness={4} />
    </Box>
  );
};

export default SmartRedirect;