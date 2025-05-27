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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, Hotel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import type { RegisterCredentials, UserRole } from '../../../../shared/types';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: UserRole;
  hotelId: string;
  departmentIds: string[];
}

const schema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerido'),
  displayName: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('Nombre es requerido'),
  role: yup
    .string()
    .oneOf(['super_admin', 'chain_admin', 'hotel_admin', 'quality_manager', 'department_manager', 'employee'])
    .required('Rol es requerido'),
  hotelId: yup
    .string()
    .required('ID del hotel es requerido'),
  departmentIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Debe seleccionar al menos un departamento')
    .required('Departamentos son requeridos')
});

interface RegisterFormProps {
  onToggleMode?: () => void;
}

const roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
  {
    value: 'employee',
    label: 'Empleado',
    description: 'Acceso básico para consulta de documentos y reportes'
  },
  {
    value: 'department_manager',
    label: 'Jefe de Departamento',
    description: 'Gestión de documentos y no conformidades del departamento'
  },
  {
    value: 'quality_manager',
    label: 'Gerente de Calidad',
    description: 'Gestión completa del sistema de calidad'
  },
  {
    value: 'hotel_admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema'
  }
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      role: 'employee',
      hotelId: '',
      departmentIds: []
    }
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
    } catch (error) {
      // El error se maneja en el contexto de autenticación
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roleOptions.find(option => option.value === watchedRole);

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Hotel sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Registro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crear nueva cuenta en QMS+Hotel
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="displayName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nombre completo"
                error={!!errors.displayName}
                helperText={errors.displayName?.message}
                margin="normal"
                autoComplete="name"
                autoFocus
              />
            )}
          />

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
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirmar contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                margin="normal"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.role}>
                <InputLabel>Rol</InputLabel>
                <Select
                  {...field}
                  label="Rol"
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {selectedRole && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Chip
                label={`${selectedRole.label}: ${selectedRole.description}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}

          <Controller
            name="hotelId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="ID del Hotel"
                error={!!errors.hotelId}
                helperText={errors.hotelId?.message || 'Identificador único del hotel'}
                margin="normal"
                placeholder="hotel_123"
              />
            )}
          />

          <Controller
            name="departmentIds"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="IDs de Departamentos"
                error={!!errors.departmentIds}
                helperText={errors.departmentIds?.message || 'Separar con comas: recepcion,limpieza,cocina'}
                margin="normal"
                placeholder="recepcion,limpieza,cocina"
                onChange={(e) => {
                  const value = e.target.value;
                  const departments = value.split(',').map(d => d.trim()).filter(d => d.length > 0);
                  field.onChange(departments);
                }}
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Registrarse'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            {onToggleMode && (
              <Link
                component="button"
                variant="body2"
                type="button"
                onClick={onToggleMode}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;