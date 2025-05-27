import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';
import type { Organization } from '../../../shared/types/Organization';

// OrganizationStatus es el tipo de estado de Organization
// Lo definimos así para usarlo en los helpers de color y label
export type OrganizationStatus = Organization['status'];

const OrganizationsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    status: 'active',
    type: 'hotel_chain',
    settings: {
      theme: 'light',
      language: 'es',
      notifications: {
        globalAlerts: true,
        crossHotelReports: true,
        chainMetrics: true
      },
      branding: {
        logo: '',
        colors: {
          primary: '#1976d2',
          secondary: '#dc004e'
        }
      },
      features: {
        multiHotelManagement: false,
        centralizedReporting: false,
        crossHotelAnalytics: false,
        standardizedProcesses: false
      },
      integrations: {
        enabled: [],
        config: {}
      }
    }
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getAll();
      setOrganizations(data);
    } catch (error) {
      setError('Error al cargar las organizaciones');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (organization?: Organization) => {
    if (organization) {
      setFormData({
        ...organization,
        address: organization.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        settings: {
          ...organization.settings,
          notifications: {
            globalAlerts: organization.settings?.notifications?.globalAlerts || true,
            crossHotelReports: organization.settings?.notifications?.crossHotelReports || true,
            chainMetrics: organization.settings?.notifications?.chainMetrics || true
          },
          features: {
            multiHotelManagement: organization.settings?.features?.multiHotelManagement || false,
            centralizedReporting: organization.settings?.features?.centralizedReporting || false,
            crossHotelAnalytics: organization.settings?.features?.crossHotelAnalytics || false,
            standardizedProcesses: organization.settings?.features?.standardizedProcesses || false
          },
          integrations: {
            enabled: organization.settings?.integrations?.enabled || [],
            config: organization.settings?.integrations?.config || {}
          }
        }
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        status: 'active',
        type: 'hotel_chain',
        settings: {
          theme: 'light',
          language: 'es',
          notifications: {
            globalAlerts: true,
            crossHotelReports: true,
            chainMetrics: true
          },
          branding: {
            logo: '',
            colors: {
              primary: '#1976d2',
              secondary: '#dc004e'
            }
          },
          features: {
            multiHotelManagement: false,
            centralizedReporting: false,
            crossHotelAnalytics: false,
            standardizedProcesses: false
          },
          integrations: {
            enabled: [],
            config: {}
          }
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrganization(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      status: 'active',
      type: 'hotel_chain',
      settings: {
        theme: 'light',
        language: 'es',
        notifications: {
          globalAlerts: true,
          crossHotelReports: true,
          chainMetrics: true
        },
        branding: {
          logo: '',
          colors: {
            primary: '#1976d2',
            secondary: '#dc004e'
          }
        },
        features: {
          multiHotelManagement: false,
          centralizedReporting: false,
          crossHotelAnalytics: false,
          standardizedProcesses: false
        },
        integrations: {
          enabled: [],
          config: {}
        }
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (selectedOrganization) {
        await organizationService.update(selectedOrganization.id, formData);
        setSnackbar({
          open: true,
          message: 'Organización actualizada exitosamente',
          severity: 'success'
        });
      } else {
        await organizationService.create(formData as Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>);
        setSnackbar({
          open: true,
          message: 'Organización creada exitosamente',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadOrganizations();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar la organización',
        severity: 'error'
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta organización?')) {
      try {
        setLoading(true);
        await organizationService.delete(id);
        setSnackbar({
          open: true,
          message: 'Organización eliminada exitosamente',
          severity: 'success'
        });
        loadOrganizations();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la organización',
          severity: 'error'
        });
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'suspended':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Organizaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Nueva Organización
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Hoteles</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell>{organization.name}</TableCell>
                  <TableCell>{organization.email}</TableCell>
                  <TableCell>{organization.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(organization.status)}
                      color={getStatusColor(organization.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{organization.hotels}</TableCell>
                  <TableCell>
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(organization)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(organization.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={organizations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedOrganization ? 'Editar Organización' : 'Nueva Organización'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Dirección
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Calle"
                name="address.street"
                value={formData.address?.street}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="address.city"
                value={formData.address?.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address?.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                name="address.country"
                value={formData.address?.country}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                name="address.postalCode"
                value={formData.address?.postalCode}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizationsPage; 