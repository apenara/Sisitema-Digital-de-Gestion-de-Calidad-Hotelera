import React, { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { router } from './router';
import { store } from './store';
import { lightTheme, darkTheme } from './theme';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // En una implementación más completa, esto se guardaría en localStorage o Redux
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Cargar preferencia de tema desde localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  const currentTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
