import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenant, usePermissions } from '../context/TenantContext';
import PlatformDashboard from '../components/platform/PlatformDashboard';
import HotelManagement from '../components/platform/HotelManagement';
import OrganizationManagement from '../components/platform/OrganizationManagement';
import SubscriptionManagement from '../components/platform/SubscriptionManagement';
import GlobalAnalytics from '../components/platform/GlobalAnalytics';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
  fallback = <Navigate to="/platform" replace /> 
}) => {
  const permissions = usePermissions();

  if (requiredPermission && !permissions[requiredPermission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const PlatformRoutes: React.FC = () => {
  const { currentLevel } = useTenant();
  const permissions = usePermissions();

  // Redirigir si no tiene acceso a la plataforma
  if (!permissions.canAccessPlatform) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Dashboard principal de la plataforma */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredPermission="canAccessPlatform">
            <PlatformDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Gestión de hoteles */}
      <Route 
        path="/hotels" 
        element={
          <ProtectedRoute requiredPermission="canAccessPlatform">
            <HotelManagement />
          </ProtectedRoute>
        } 
      />

      {/* Gestión de organizaciones */}
      <Route 
        path="/organizations" 
        element={
          <ProtectedRoute requiredPermission="canAccessPlatform">
            <OrganizationManagement />
          </ProtectedRoute>
        } 
      />

      {/* Gestión de subscripciones */}
      <Route 
        path="/subscriptions" 
        element={
          <ProtectedRoute requiredPermission="canManageSubscriptions">
            <SubscriptionManagement />
          </ProtectedRoute>
        } 
      />

      {/* Analytics globales */}
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute requiredPermission="canViewAnalytics">
            <GlobalAnalytics />
          </ProtectedRoute>
        } 
      />

      {/* Configuración de plataforma */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute requiredPermission="canAccessPlatform">
            <div className="p-8">
              <h1 className="text-2xl font-bold">Configuración de Plataforma</h1>
              <p className="text-gray-600 mt-2">Configuración del sistema QMS+Hotel</p>
              {/* TODO: Implementar componente de configuración */}
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PlatformRoutes;