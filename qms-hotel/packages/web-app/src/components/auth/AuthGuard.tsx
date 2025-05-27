import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import type { ProtectedRouteProps, UserRole } from '../../../../shared/types';

interface AuthGuardProps extends ProtectedRouteProps {
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback,
  redirectTo = '/login'
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar si el usuario está activo
  if (!user.isActive) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h5" gutterBottom>
          Cuenta Desactivada
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu cuenta ha sido desactivada. Contacta al administrador para más información.
        </Typography>
      </Box>
    );
  }

  // Verificar rol requerido
  if (requiredRole && user.role !== requiredRole) {
    // Verificar jerarquía de roles
    const roleHierarchy: Record<UserRole, number> = {
      employee: 1,
      department_manager: 2,
      quality_manager: 3,
      hotel_admin: 4,
      chain_admin: 5,
      super_admin: 6
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h6" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes permisos suficientes para acceder a esta página.
          </Typography>
        </Box>
      );
    }
  }

  // Verificar permisos específicos
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = userService.hasAllPermissions(user, requiredPermissions as any);
    
    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h6" gutterBottom>
            Permisos Insuficientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes los permisos necesarios para acceder a esta funcionalidad.
          </Typography>
        </Box>
      );
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
};

export default AuthGuard;