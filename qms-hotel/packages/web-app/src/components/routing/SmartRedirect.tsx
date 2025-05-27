import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const SmartRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Don't run effect if still loading

    const handleRedirect = async () => {
      if (isRedirecting) return;

      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        setIsRedirecting(true);
        navigate('/login', { replace: true });
        return;
      }

      // Si no hay usuario cargado aún, esperar (esto es manejado por isLoading ahora)
      // if (!user) {
      //   return;
      // }

      // Redirección basada en el rol del usuario
      // Solo proceder si el usuario está cargado
      if (user) {
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
          setIsRedirecting(false); // Resetear en caso de error para permitir reintentos
        }
      }
    };

    handleRedirect();
  }, [isAuthenticated, user, isLoading, navigate, isRedirecting]);

  // Mostrar loading mientras se procesa la redirección o se carga el estado de autenticación
  if (isLoading) {
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
  }

  // Si no está cargando y no hay usuario autenticado, no mostrar nada o un spinner más pequeño,
  // ya que el useEffect se encargará de la redirección al login.
  // Opcionalmente, se puede dejar el spinner grande si la redirección es muy rápida.
  // Por ahora, para mantener la consistencia con el estado de carga, se muestra el spinner
  // si isLoading es true, y si no, se asume que useEffect manejará la UI o redirección.
  // Si después de cargar, no es autenticado, se redirige. Si es autenticado pero no hay user (caso improbable con useAuth),
  // el useEffect no haría la redirección basada en rol.
  // El return principal aquí es más un fallback o para cuando isLoading es false pero la redirección aún no ha ocurrido.
  // Podría ser el mismo spinner o un estado intermedio.
  // Dado que el useEffect ahora maneja la lógica de redirección post-carga,
  // y el spinner principal se muestra durante isLoading,
  // este return es para el caso donde isLoading es false pero la redirección no ha completado.
  // Podríamos mostrar el mismo spinner o nada. Optaremos por el spinner para evitar parpadeos.
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