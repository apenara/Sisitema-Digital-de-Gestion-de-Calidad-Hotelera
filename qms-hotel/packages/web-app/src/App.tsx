import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
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
          <RouterProvider router={router} />
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
