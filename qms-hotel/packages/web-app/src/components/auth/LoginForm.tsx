import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Hotel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import type { LoginCredentials } from '../../../../shared/types';

const schema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida')
});

interface LoginFormProps {
  onToggleMode?: () => void;
  onForgotPassword?: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onToggleMode, 
  onForgotPassword 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearError();
      await login(data);
    } catch (error) {
      // El error se maneja en el contexto de autenticación
      console.error('Error en login:', error);
    }
  };

  const handleForgotPassword = () => {
    const email = getValues('email');
    if (onForgotPassword && email) {
      onForgotPassword(email);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Hotel sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            QMS+Hotel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de Gestión de Calidad Hotelera
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                autoComplete="email"
                autoFocus
                disabled={isLoading || isSubmitting}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                margin="normal"
                autoComplete="current-password"
                disabled={isLoading || isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                        disabled={isLoading || isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading || isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              component="button"
              variant="body2"
              type="button"
              onClick={handleForgotPassword}
              sx={{ mr: 2 }}
              disabled={isLoading || isSubmitting}
            >
              ¿Olvidaste tu contraseña?
            </Link>

            {onToggleMode && (
              <Link
                component="button"
                variant="body2"
                type="button"
                onClick={onToggleMode}
                disabled={isLoading || isSubmitting}
              >
                ¿No tienes cuenta? Regístrate
              </Link>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginForm;