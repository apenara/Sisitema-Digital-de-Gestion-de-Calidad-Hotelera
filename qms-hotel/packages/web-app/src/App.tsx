import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { router } from './router';
import { store } from './store';
import { lightTheme, darkTheme } from './theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import PlatformBootstrap from './components/bootstrap/PlatformBootstrap';
import { useBootstrap } from './hooks/useBootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TenantProvider } from './context/TenantContext';
import { useAppSelector } from './store';
import { selectIsAuthenticated, selectUser } from './store/slices/authSlice';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PlatformLayout } from './pages/platform/PlatformLayout';
import PlatformDashboard from './pages/platform/PlatformDashboard';
import OrganizationsPage from './pages/platform/OrganizationsPage';
import CompanyManagement from './components/platform/CompanyManagement';
import SubscriptionManagement from './components/platform/SubscriptionManagement';
import { PricingPage } from './components/platform/PricingPage';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PlatformRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Componente interno que usa el hook de bootstrap
const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { isInitialized, isLoading, checkInitialization } = useBootstrap();

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Cargar preferencia de tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  // Verificar estado de inicialización al cargar
  useEffect(() => {
    checkInitialization();
  }, [checkInitialization]);

  const currentTheme = darkMode ? darkTheme : lightTheme;

  // Mostrar loading mientras se verifica la inicialización
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está inicializado, mostrar el bootstrap
  if (isInitialized === false) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <PlatformBootstrap />
      </ThemeProvider>
    );
  }

  // Si está inicializado, mostrar la aplicación con autenticación
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AuthProvider>
        <TenantProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              } />
              <Route path="/register" element={
                <AuthLayout>
                  <RegisterForm />
                </AuthLayout>
              } />
              <Route path="/forgot-password" element={
                <AuthLayout>
                  <ForgotPasswordForm />
                </AuthLayout>
              } />
              <Route path="/reset-password" element={
                <AuthLayout>
                  <ResetPasswordForm />
                </AuthLayout>
              } />

              {/* Rutas de la plataforma administrativa */}
              <Route path="/platform" element={
                <PlatformRoute>
                  <PlatformLayout>
                    <PlatformDashboard />
                  </PlatformLayout>
                </PlatformRoute>
              } />
              <Route path="/platform/*" element={
                <PlatformRoute>
                  <PlatformLayout>
                    <Routes>
                      <Route path="organizations" element={<OrganizationsPage />} />
                      <Route path="companies" element={<CompanyManagement />} />
                      <Route path="hotels" element={<div>Hoteles (Deprecated)</div>} />
                      <Route path="users" element={<div>Usuarios</div>} />
                      <Route path="subscriptions" element={<SubscriptionManagement />} />
                      <Route path="pricing" element={<PricingPage />} />
                      <Route path="reports" element={<div>Reportes</div>} />
                      <Route path="settings" element={<div>Configuración</div>} />
                    </Routes>
                  </PlatformLayout>
                </PlatformRoute>
              } />

              {/* Rutas del dashboard */}
              <Route path="/dashboard/*" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<div>Dashboard</div>} />
                      <Route path="profile" element={<div>Perfil</div>} />
                      <Route path="settings" element={<div>Configuración</div>} />
                    </Routes>
                  </DashboardLayout>
                </PrivateRoute>
              } />

              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            aria-label="Notificaciones"
          />
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
