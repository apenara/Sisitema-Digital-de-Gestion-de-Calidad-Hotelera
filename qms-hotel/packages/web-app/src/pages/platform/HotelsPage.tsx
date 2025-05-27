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
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { hotelService } from '../../services/hotelService';
import type { Hotel } from '../../services/hotelService';
import { organizationService } from '../../services/organizationService';

const HotelsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [organizations, setOrganizations] = useState<{ id: string; name: string; }[]>([]);
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

  const [formData, setFormData] = useState({
    name: '',
    organizationId: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    status: 'pending' as Hotel['status'],
    stars: 3,
    rooms: 0,
    type: 'independent' as const,
    settings: {
      timezone: 'America/Bogota',
      currency: 'COP',
      language: 'es' as const,
      theme: {
        primaryColor: '#006A6B',
        secondaryColor: '#4A6363'
      },
      branding: {
        theme: {
          primaryColor: '#006A6B',
          secondaryColor: '#4A6363'
        }
      },
      features: {
        documentsEnabled: true,
        nonConformitiesEnabled: true,
        auditsEnabled: true,
        reportsEnabled: true,
        analyticsEnabled: true,
        notificationsEnabled: true
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true
      },
      quality: {
        defaultProcesses: [],
        auditFrequency: 'monthly' as const,
        complianceStandards: [],
        qualityObjectives: []
      },
      integrations: {}
    },
    departments: [],
    isActive: true,
    subscriptionPlan: 'basic' as const,
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  useEffect(() => {
    loadHotels();
    loadOrganizations();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await hotelService.getAll();
      setHotels(data);
    } catch (error) {
      setError('Error al cargar los hoteles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const data = await organizationService.getAll();
      setOrganizations(data.map(org => ({
        id: org.id,
        name: org.name
      })));
    } catch (error) {
      console.error('Error al cargar las organizaciones:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (hotel?: Hotel) => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        organizationId: hotel.organizationId,
        address: { ...hotel.address },
        contact: { ...hotel.contact },
        status: hotel.status,
        stars: hotel.stars,
        rooms: hotel.rooms,
        type: hotel.type,
        settings: hotel.settings,
        departments: hotel.departments,
        isActive: hotel.isActive,
        subscriptionPlan: hotel.subscriptionPlan,
        subscriptionExpiry: hotel.subscriptionExpiry
      });
      setSelectedHotel(hotel);
    } else {
      setFormData({
        name: '',
        organizationId: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        contact: {
          email: '',
          phone: '',
          website: ''
        },
        status: 'pending',
        stars: 3,
        rooms: 0,
        type: 'independent' as const,
        settings: {
          timezone: 'America/Bogota',
          currency: 'COP',
          language: 'es' as const,
          theme: {
            primaryColor: '#006A6B',
            secondaryColor: '#4A6363'
          },
          branding: {
            theme: {
              primaryColor: '#006A6B',
              secondaryColor: '#4A6363'
            }
          },
          features: {
            documentsEnabled: true,
            nonConformitiesEnabled: true,
            auditsEnabled: true,
            reportsEnabled: true,
            analyticsEnabled: true,
            notificationsEnabled: true
          },
          notifications: {
            emailAlerts: true,
            pushNotifications: true
          },
          quality: {
            defaultProcesses: [],
            auditFrequency: 'monthly' as const,
            complianceStandards: [],
            qualityObjectives: []
          },
          integrations: {}
        },
        departments: [],
        isActive: true,
        subscriptionPlan: 'basic' as const,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setSelectedHotel(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
    setFormData({
      name: '',
      organizationId: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      contact: {
        email: '',
        phone: '',
        website: ''
      },
      status: 'pending',
      stars: 3,
      rooms: 0,
      type: 'independent' as const,
      settings: {
        timezone: 'America/Bogota',
        currency: 'COP',
        language: 'es' as const,
        theme: {
          primaryColor: '#006A6B',
          secondaryColor: '#4A6363'
        },
        branding: {
          theme: {
            primaryColor: '#006A6B',
            secondaryColor: '#4A6363'
          }
        },
        features: {
          documentsEnabled: true,
          nonConformitiesEnabled: true,
          auditsEnabled: true,
          reportsEnabled: true,
          analyticsEnabled: true,
          notificationsEnabled: true
        },
        notifications: {
          emailAlerts: true,
          pushNotifications: true
        },
        quality: {
          defaultProcesses: [],
          auditFrequency: 'monthly' as const,
          complianceStandards: [],
          qualityObjectives: []
        },
        integrations: {}
      },
      departments: [],
      isActive: true,
      subscriptionPlan: 'basic' as const,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveHotel = async () => {
    try {
      setLoading(true);
      if (selectedHotel) {
        await hotelService.update(selectedHotel.id, formData);
        setSnackbar({
          open: true,
          message: 'Hotel actualizado exitosamente',
          severity: 'success'
        });
      } else {
        await hotelService.create(formData);
        setSnackbar({
          open: true,
          message: 'Hotel creado exitosamente',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadHotels();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar el hotel',
        severity: 'error'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este hotel?')) {
      try {
        setLoading(true);
        await hotelService.delete(id);
        setSnackbar({
          open: true,
          message: 'Hotel eliminado exitosamente',
          severity: 'success'
        });
        loadHotels();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el hotel',
          severity: 'error'
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: Hotel['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Hotel['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: stars }, (_, i) => (
      <StarIcon key={i} sx={{ color: 'gold' }} />
    ));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hoteles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Nuevo Hotel
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
              <TableCell>Organización</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Estrellas</TableCell>
              <TableCell>Habitaciones</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>{hotel.name}</TableCell>
                  <TableCell>
                    {organizations.find(org => org.id === hotel.organizationId)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{hotel.address.city}</TableCell>
                  <TableCell>{renderStars(hotel.stars)}</TableCell>
                  <TableCell>{hotel.rooms}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(hotel.status)}
                      color={getStatusColor(hotel.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(hotel.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(hotel)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteHotel(hotel.id)}
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
          count={hotels.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHotel ? 'Editar Hotel' : 'Nuevo Hotel'}
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
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Organización</InputLabel>
                <Select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  {organizations.map(org => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Dirección
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Calle"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado/Provincia"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} component="div">
              <Typography variant="subtitle1" gutterBottom>
                Contacto
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Email"
                name="contact.email"
                type="email"
                value={formData.contact.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Teléfono"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} component="div">
              <TextField
                fullWidth
                label="Sitio Web"
                name="contact.website"
                value={formData.contact.website || ''}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <FormControl fullWidth>
                <InputLabel>Estrellas</InputLabel>
                <Select
                  name="stars"
                  value={formData.stars}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  {[1, 2, 3, 4, 5].map(stars => (
                    <MenuItem key={stars} value={stars}>
                      {stars} {stars === 1 ? 'Estrella' : 'Estrellas'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} component="div">
              <TextField
                fullWidth
                label="Número de Habitaciones"
                name="rooms"
                type="number"
                value={formData.rooms}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveHotel}
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

export default HotelsPage; 