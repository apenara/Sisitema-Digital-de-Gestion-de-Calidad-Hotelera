import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AppShell } from '../components/layout/AppShell';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// Layout para páginas protegidas
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard>
      <AppShell>
        {children}
      </AppShell>
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
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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