import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { Hotel } from '../../../shared/types/Hotel';
import { hotelService } from '../../services/hotelService';

const HotelsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    status: 'active'
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hotelService.getHotels();
      setHotels(data);
    } catch (err) {
      setError('Error al cargar los hoteles');
      console.error('Error loading hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hotel?: Hotel) => {
    if (hotel) {
      setFormData({
        ...hotel,
        address: { ...hotel.address }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      status: 'active'
    });
  };

  const handleInputChange = (field: keyof Hotel) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: Partial<Hotel>) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAddressChange = (field: keyof Hotel['address']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: Partial<Hotel>) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: event.target.value,
      },
    }));
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: Partial<Hotel>) => ({
      ...prev,
      status: event.target.value as Hotel['status'],
    }));
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await hotelService.updateHotel(formData.id, formData);
      } else {
        await hotelService.createHotel(formData, user?.uid || '');
      }
      handleCloseDialog();
      loadHotels();
    } catch (err) {
      setError('Error al guardar el hotel');
      console.error('Error saving hotel:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este hotel?')) {
      try {
        await hotelService.deleteHotel(id);
        loadHotels();
      } catch (err) {
        setError('Error al eliminar el hotel');
        console.error('Error deleting hotel:', err);
      }
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hotel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" component="h1">
                Hoteles
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Nuevo Hotel
              </Button>
            </Box>

            {/* Mensaje de carga */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Mensaje de error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* Mensaje de lista vacía */}
            {!loading && !error && filteredHotels.length === 0 && (
              <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
                No hay hoteles registrados.
              </Typography>
            )}

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar hoteles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    variant="outlined"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos los estados</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="inactive">Inactivos</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {!loading && !error && filteredHotels.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Dirección</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Usuarios</TableCell>
                      <TableCell>Documentos</TableCell>
                      <TableCell>Calidad</TableCell>
                      <TableCell>Fecha de creación</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHotels.map((hotel) => (
                      <TableRow key={hotel.id}>
                        <TableCell>{hotel.name}</TableCell>
                        <TableCell>
                          {`${hotel.address.street}, ${hotel.address.city}, ${hotel.address.state}`}
                        </TableCell>
                        <TableCell>
                          <Typography
                            color={hotel.status === 'active' ? 'success.main' : 'error.main'}
                          >
                            {hotel.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Typography>
                        </TableCell>
                        <TableCell>{hotel.statistics?.totalUsers || 0}</TableCell>
                        <TableCell>{hotel.statistics?.totalDocuments || 0}</TableCell>
                        <TableCell>{hotel.statistics?.qualityScore || 0}%</TableCell>
                        <TableCell>
                          {format(new Date(hotel.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(hotel)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(hotel.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.id ? 'Editar Hotel' : 'Nuevo Hotel'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Calle"
                value={formData.address.street}
                onChange={handleAddressChange('street')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.address.city}
                onChange={handleAddressChange('city')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.address.state}
                onChange={handleAddressChange('state')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                value={formData.address.country}
                onChange={handleAddressChange('country')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={formData.address.postalCode}
                onChange={handleAddressChange('postalCode')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={formData.status}
                onChange={handleStatusChange}
                required
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HotelsPage; 