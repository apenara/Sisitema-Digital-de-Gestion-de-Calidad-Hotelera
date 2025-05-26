import React, { useState } from 'react';
import { Container, Alert, Snackbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      setSnackbar({
        open: true,
        message: 'Por favor ingresa tu email primero',
        severity: 'error'
      });
      return;
    }

    try {
      await resetPassword(email);
      setSnackbar({
        open: true,
        message: 'Se ha enviado un email para restablecer tu contraseña',
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al enviar email de recuperación',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Redirigir a dashboard si ya está autenticado
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      {mode === 'login' ? (
        <LoginForm
          onToggleMode={handleToggleMode}
          onForgotPassword={handleForgotPassword}
        />
      ) : (
        <RegisterForm onToggleMode={handleToggleMode} />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;