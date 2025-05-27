import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Código de restablecimiento inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.confirmPasswordReset(oobCode, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError('Error al restablecer la contraseña. Por favor, intente nuevamente.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Código de restablecimiento inválido o expirado
        </Alert>
        <Button
          component={Link}
          onClick={() => navigate('/forgot-password')}
          sx={{ mt: 2 }}
        >
          Solicitar nuevo código
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: 3
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Restablecer Contraseña
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
        Ingrese su nueva contraseña
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...
        </Alert>
      )}

      <TextField
        fullWidth
        label="Nueva Contraseña"
        type="password"
        margin="normal"
        {...register('password', {
          required: 'La contraseña es requerida',
          minLength: {
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres'
          }
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={loading || success}
      />

      <TextField
        fullWidth
        label="Confirmar Contraseña"
        type="password"
        margin="normal"
        {...register('confirmPassword', {
          required: 'Por favor confirme su contraseña',
          validate: value => value === password || 'Las contraseñas no coinciden'
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={loading || success}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || success}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Restablecer Contraseña'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/login')}
          sx={{ textDecoration: 'none' }}
        >
          Volver al inicio de sesión
        </Link>
      </Box>
    </Box>
  );
}; 