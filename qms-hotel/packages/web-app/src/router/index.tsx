import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AppShell } from '../components/layout/AppShell';
import { TenantProvider } from '../context/TenantContext';
import SmartRedirect from '../components/routing/SmartRedirect';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PlatformRoutes from './PlatformRoutes';

// Layout para páginas protegidas
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard>
      <TenantProvider>
        <AppShell>
          {children}
        </AppShell>
      </TenantProvider>
    </AuthGuard>
  );
};

// Páginas placeholder para las rutas que implementaremos en siguientes sprints
const DocumentsPage = () => <div>Documentos - Próximamente</div>;
const NonConformitiesPage = () => <div>No Conformidades - Próximamente</div>;
const AuditsPage = () => <div>Auditorías - Próximamente</div>;
const SettingsPage = () => <div>Configuración - Próximamente</div>;
const ProfilePage = () => <div>Perfil - Próximamente</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedLayout>
        <SmartRedirect />
      </ProtectedLayout>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // Rutas de plataforma (super admin)
  {
    path: '/platform/*',
    element: (
      <ProtectedLayout>
        <PlatformRoutes />
      </ProtectedLayout>
    ),
  },
  
  // Rutas de organización
  {
    path: '/org/:organizationId/*',
    element: (
      <ProtectedLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Vista de Organización</h1>
          <p className="text-gray-600 mt-2">Dashboard de cadena hotelera</p>
          {/* TODO: Implementar OrganizationRoutes */}
        </div>
      </ProtectedLayout>
    ),
  },
  
  // Rutas de hotel (existentes)
  {
    path: '/hotel/:hotelId',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedLayout>
        <DashboardPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/documents',
    element: (
      <ProtectedLayout>
        <AuthGuard requiredPermissions={['documents:read']}>
          <DocumentsPage />
        </AuthGuard>
      </ProtectedLayout>
    ),
  },
  {
    path: '/non-conformities',
    element: (
      <ProtectedLayout>
        <AuthGuard requiredPermissions={['nc:view']}>
          <NonConformitiesPage />
        </AuthGuard>
      </ProtectedLayout>
    ),
  },
  {
    path: '/audits',
    element: (
      <ProtectedLayout>
        <AuthGuard requiredPermissions={['audits:view']}>
          <AuditsPage />
        </AuthGuard>
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedLayout>
        <AuthGuard requiredPermissions={['settings:manage']}>
          <SettingsPage />
        </AuthGuard>
      </ProtectedLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedLayout>
        <ProfilePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;