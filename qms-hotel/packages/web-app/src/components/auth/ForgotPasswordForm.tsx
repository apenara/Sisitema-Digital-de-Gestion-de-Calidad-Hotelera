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
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword(data.email);
      setSuccess(true);
    } catch (error) {
      setError('Error al enviar el correo de recuperación. Por favor, intente nuevamente.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        Recuperar Contraseña
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
        Ingrese su correo electrónico y le enviaremos instrucciones para recuperar su contraseña.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Se han enviado las instrucciones a su correo electrónico.
        </Alert>
      )}

      <TextField
        fullWidth
        label="Correo Electrónico"
        type="email"
        margin="normal"
        {...register('email', {
          required: 'El correo electrónico es requerido',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo electrónico inválido'
          }
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
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
        {loading ? <CircularProgress size={24} /> : 'Enviar Instrucciones'}
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