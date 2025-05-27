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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { bootstrapService } from '../../services/bootstrapService';
import { useAppDispatch } from '../../store';
import { login } from '../../store/slices/authSlice';
import ViewSelector from './ViewSelector';
import type { User } from '../../../../shared/types';

interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

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
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onToggleMode, 
  onForgotPassword,
  onSuccess,
  onError
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showViewSelector, setShowViewSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: ''
    }
  });
  
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);

  const handleViewSelection = (view: 'platform' | 'dashboard') => {
    if (!currentUser) return;
    
    dispatch(login(currentUser));
    
    if (view === 'platform') {
      navigate('/platform');
    } else {
      navigate('/dashboard');
    }
    
    onSuccess?.();
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userDoc = await bootstrapService.getUserByEmail(data.email);
      if (userDoc) {
        const status = await bootstrapService.checkAccountStatus(userDoc.id);
        if (status.isLocked) {
          setAccountLocked(true);
          setLockUntil(status.lockUntil);
          setError(`Cuenta bloqueada. Intente nuevamente después de ${status.lockUntil?.toLocaleTimeString()}`);
          return;
        }
      }
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const userData = await bootstrapService.getUserById(userCredential.user.uid);
      if (!userData) {
        throw new Error('Usuario no encontrado');
      }

      if (userData.security?.twoFactorEnabled) {
        setShowTwoFactor(true);
        return;
      }
      
      await bootstrapService.recordLoginActivity(userCredential.user.uid, {
        ip: await getClientIP(),
        device: getDeviceInfo(),
        success: true
      });
      
      if (userData.role === 'super_admin') {
        setCurrentUser(userData);
        setShowViewSelector(true);
      } else {
        dispatch(login(userData));
        navigate('/dashboard');
        onSuccess?.();
      }
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      const userDoc = await bootstrapService.getUserByEmail(data.email);
      if (userDoc) {
        await bootstrapService.recordLoginActivity(userDoc.id, {
          ip: await getClientIP(),
          device: getDeviceInfo(),
          success: false
        });
        
        const status = await bootstrapService.checkAccountStatus(userDoc.id);
        if (status.isLocked) {
          setAccountLocked(true);
          setLockUntil(status.lockUntil);
          setError(`Cuenta bloqueada. Intente nuevamente después de ${status.lockUntil?.toLocaleTimeString()}`);
        } else {
          setError(`Credenciales inválidas. Intentos restantes: ${5 - status.failedAttempts}`);
        }
      } else {
        setError('Credenciales inválidas');
      }
      
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTwoFactorSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay usuario autenticado');
      
      const userData = await bootstrapService.getUserById(user.uid);
      if (!userData) {
        throw new Error('Usuario no encontrado');
      }
      
      await bootstrapService.recordLoginActivity(user.uid, {
        ip: await getClientIP(),
        device: getDeviceInfo(),
        success: true
      });
      
      if (userData.role === 'super_admin') {
        setCurrentUser(userData);
        setShowViewSelector(true);
      } else {
        dispatch(login(userData));
        navigate('/dashboard');
        onSuccess?.();
      }
      
    } catch (error: any) {
      console.error('Error en 2FA:', error);
      setError('Código 2FA inválido');
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };
  
  const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    const browser = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    const os = ua.match(/(?:windows|mac|linux|android|ios)/i)?.[0] || 'unknown';
    return `${browser[1]} ${browser[2]} on ${os}`;
  };

  if (showViewSelector) {
    return <ViewSelector onSelect={handleViewSelection} />;
  }
  
  if (showTwoFactor) {
    return (
      <form onSubmit={handleSubmit(handleTwoFactorSubmit)} className="space-y-6">
        <div>
          <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
            Código de autenticación
          </label>
          <Controller
            name="twoFactorCode"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="twoFactorCode"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese el código de 6 dígitos"
              />
            )}
          />
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </button>
        </div>
      </form>
    );
  }
  
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            QMS+Hotel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de Gestión de Calidad Hotelera
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
            disabled={isLoading || isSubmitting || accountLocked}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? (
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
              onClick={() => {
                if (onForgotPassword) {
                  onForgotPassword(getValues('email'));
                }
              }}
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