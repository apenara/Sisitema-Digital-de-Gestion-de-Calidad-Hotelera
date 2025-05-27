import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const SmartRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  console.log('[SmartRedirect] State from useAuth():', { isLoading, isAuthenticated, userId: user?.id, userRole: user?.role, currentPath: location.pathname });
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('[SmartRedirect] useEffect triggered. Dependencies:', { isLoading, isAuthenticated, user, navigate, isRedirecting, locationPathname: location.pathname });

    if (isLoading) {
      console.log('[SmartRedirect] useEffect: isLoading is true. Waiting.');
      return; 
    }

    const handleRedirect = async () => {
      // Removed the top-level `if (isRedirecting) return;` to allow path checking logic to run and clear the flag.
      // The individual navigate calls will now check `!isRedirecting` or rely on path checks.

      if (!isAuthenticated) {
        const loginPath = '/login';
        if (location.pathname === loginPath) {
          console.log('[SmartRedirect] useEffect: Unauthenticated and already at /login.');
          if (isRedirecting) setIsRedirecting(false);
        } else {
          console.log('[SmartRedirect] useEffect: Not authenticated. Navigating to /login.');
          if (!isRedirecting) setIsRedirecting(true);
          await navigate(loginPath, { replace: true });
        }
        return;
      }

      if (user) {
        console.log('[SmartRedirect] useEffect: Authenticated with user. User role:', user.role, 'Attempting role-based redirect.');
        // No setIsRedirecting(true) globally here. It's per-case now.
        try {
          let targetPath: string;
          switch (user.role) {
            case 'super_admin':
              targetPath = '/platform';
              if (location.pathname === targetPath) {
                console.log('[SmartRedirect] useEffect: User is super_admin and already at /platform.');
                if (isRedirecting) setIsRedirecting(false);
              } else {
                console.log('[SmartRedirect] useEffect: User is super_admin. Navigating to /platform.');
                if (!isRedirecting) setIsRedirecting(true);
                await navigate(targetPath, { replace: true });
              }
              break;
            
            case 'chain_admin':
              if (user.organizationId) {
                targetPath = `/org/${user.organizationId}`;
                if (location.pathname === targetPath) {
                  console.log(`[SmartRedirect] useEffect: User is chain_admin and already at ${targetPath}.`);
                  if (isRedirecting) setIsRedirecting(false);
                } else {
                  console.log(`[SmartRedirect] useEffect: User is chain_admin with organizationId ${user.organizationId}. Navigating to ${targetPath}.`);
                  if (!isRedirecting) setIsRedirecting(true);
                  await navigate(targetPath, { replace: true });
                }
              } else {
                targetPath = '/platform';
                if (location.pathname === targetPath) {
                  console.log('[SmartRedirect] useEffect: User is chain_admin (no orgId) and already at /platform.');
                  if (isRedirecting) setIsRedirecting(false);
                } else {
                  console.log('[SmartRedirect] useEffect: User is chain_admin without organizationId. Navigating to /platform.');
                  if (!isRedirecting) setIsRedirecting(true);
                  await navigate(targetPath, { replace: true });
                }
              }
              break;
            
            case 'hotel_admin':
            case 'quality_manager':
            case 'department_manager':
            case 'employee':
            default:
              targetPath = '/dashboard';
              if (location.pathname === targetPath) {
                console.log(`[SmartRedirect] useEffect: User is ${user.role} and already at /dashboard.`);
                if (isRedirecting) setIsRedirecting(false);
              } else {
                console.log(`[SmartRedirect] useEffect: User is ${user.role}. Navigating to /dashboard.`);
                if (!isRedirecting) setIsRedirecting(true);
                await navigate(targetPath, { replace: true });
              }
              break;
          }
        } catch (error) {
          console.error('[SmartRedirect] useEffect: Error during navigation:', error);
          if (isRedirecting) setIsRedirecting(false); // Resetear en caso de error para permitir reintentos
        }
      } else if (!isLoading) { // User is null, not loading, and we passed isAuthenticated check (should be false)
          // This case should technically be caught by the !isAuthenticated block above.
          // Adding a log for robustness in case of unexpected state.
          console.warn('[SmartRedirect] useEffect: User is null, not loading, but isAuthenticated was true. This state is unexpected. Redirecting to login.');
          const loginPath = '/login';
           if (location.pathname === loginPath) {
              if (isRedirecting) setIsRedirecting(false);
           } else {
              if (!isRedirecting) setIsRedirecting(true);
              await navigate(loginPath, { replace: true });
           }
      }
    };

    handleRedirect();
  }, [isAuthenticated, user, isLoading, navigate, isRedirecting, location]);

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