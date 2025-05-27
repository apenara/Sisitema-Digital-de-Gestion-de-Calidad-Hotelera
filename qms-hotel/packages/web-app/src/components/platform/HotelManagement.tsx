import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchHotelsByOwner,
  createHotel,
  updateHotel,
  selectHotels,
  selectHotelIsLoading,
  selectHotelError
} from '../../store/slices/hotelSlice';
import {
  loadOrganizations,
  selectOrganizations
} from '../../store/slices/organizationSlice';
import type { CreateHotelData, UpdateHotelData, Hotel } from '../../../../shared/types';

interface HotelFormData {
  name: string;
  description: string;
  organizationId: string;
  type: 'independent' | 'chain_member';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  classification: {
    category: 'boutique' | 'business' | 'resort' | 'economy' | 'luxury' | 'extended_stay';
    size: 'small' | 'medium' | 'large' | 'enterprise';
    rooms?: number;
  };
}

const initialFormData: HotelFormData = {
  name: '',
  description: '',
  organizationId: '',
  type: 'chain_member',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  classification: {
    category: 'business',
    size: 'medium'
  }
};

const HotelManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<HotelFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    organizationId: '',
    type: '',
    status: ''
  });

  // Selectors
  const hotels = useAppSelector(selectHotels);
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectHotelIsLoading);
  const error = useAppSelector(selectHotelError);

  // Cargar datos iniciales
  useEffect(() => {
    // TODO: Implementar carga de todos los hoteles para super admin
    // dispatch(fetchAllHotels());
    dispatch(loadOrganizations());
  }, [dispatch]);

  // Filtrar hoteles
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = !filters.organizationId || hotel.organizationId === filters.organizationId;
    const matchesType = !filters.type || hotel.type === filters.type;
    const matchesStatus = !filters.status || hotel.status === filters.status;
    
    return matchesSearch && matchesOrg && matchesType && matchesStatus;
  });

  const handleCreateHotel = async () => {
    try {
      const createData: CreateHotelData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        organizationId: formData.organizationId || undefined,
        address: formData.address,
        contact: {
          ...formData.contact,
          website: formData.contact.website || undefined
        },
        classification: formData.classification,
        departments: [] // Se pueden agregar departamentos por defecto
      };
      
      await dispatch(createHotel({
        data: createData,
        ownerId: 'current-user-id' // TODO: obtener del contexto de auth
      })).unwrap();
      
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating hotel:', error);
    }
  };

  const handleUpdateHotel = async () => {
    if (!selectedHotel) return;
    
    try {
      const updateData: UpdateHotelData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        contact: {
          ...formData.contact,
          website: formData.contact.website || undefined
        },
        classification: formData.classification
      };
      
      await dispatch(updateHotel({
        hotelId: selectedHotel.id,
        data: updateData
      })).unwrap();
      
      setIsEditModalOpen(false);
      setSelectedHotel(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error updating hotel:', error);
    }
  };

  const handleDeleteHotel = async () => {
    if (!selectedHotel) return;
    
    try {
      // TODO: Implementar deleteHotel en el slice
      console.log('Delete hotel functionality not implemented yet');
      setIsDeleteModalOpen(false);
      setSelectedHotel(null);
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  };

  const openEditModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description || '',
      organizationId: hotel.organizationId || '',
      type: hotel.type,
      address: {
        ...hotel.address,
        postalCode: hotel.address.postalCode
      },
      contact: {
        ...hotel.contact,
        website: hotel.contact.website || ''
      },
      classification: hotel.classification
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    
    const statusLabels = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
      maintenance: 'Mantenimiento'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.inactive}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      independent: 'bg-purple-100 text-purple-800',
      chain_member: 'bg-blue-100 text-blue-800'
    };
    
    const typeLabels = {
      independent: 'Independiente',
      chain_member: 'Cadena'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type as keyof typeof typeClasses] || typeClasses.chain_member}`}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryClasses = {
      boutique: 'bg-purple-100 text-purple-800',
      business: 'bg-blue-100 text-blue-800',
      resort: 'bg-green-100 text-green-800',
      economy: 'bg-yellow-100 text-yellow-800',
      luxury: 'bg-red-100 text-red-800',
      extended_stay: 'bg-gray-100 text-gray-800'
    };
    
    const categoryLabels = {
      boutique: 'Boutique',
      business: 'Negocios',
      resort: 'Resort',
      economy: 'Económico',
      luxury: 'Lujo',
      extended_stay: 'Estancia Extendida'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClasses[category as keyof typeof categoryClasses] || categoryClasses.business}`}>
        {categoryLabels[category as keyof typeof categoryLabels] || category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Gestión de Hoteles
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administrar hoteles de toda la plataforma
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Hotel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buscar</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o descripción..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organización</label>
              <select
                value={filters.organizationId}
                onChange={(e) => setFilters({ ...filters, organizationId: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las organizaciones</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="independent">Independiente</option>
                <option value="chain_member">Cadena</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de hoteles */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay hoteles</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo hotel.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredHotels.map((hotel) => (
                <li key={hotel.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{hotel.name}</h3>
                          <div className="ml-3 flex space-x-2">
                            {getStatusBadge(hotel.status)}
                            {getTypeBadge(hotel.type)}
                            {getCategoryBadge(hotel.classification.category)}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{hotel.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{hotel.address.city}, {hotel.address.country}</span>
                          <span>•</span>
                          <span>{hotel.contact.email}</span>
                          <span>•</span>
                          <span>{hotel.classification.size} - {hotel.classification.rooms || 'N/A'} habitaciones</span>
                          {hotel.organizationId && (
                            <>
                              <span>•</span>
                              <span>{organizations.find(org => org.id === hotel.organizationId)?.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(hotel)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(hotel)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de creación */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Crear Nuevo Hotel
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organización</label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar organización</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="independent">Independiente</option>
                      <option value="chain_member">Cadena</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                      value={formData.classification.category}
                      onChange={(e) => setFormData({
                        ...formData,
                        classification: { ...formData.classification, category: e.target.value as any }
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="boutique">Boutique</option>
                      <option value="business">Negocios</option>
                      <option value="resort">Resort</option>
                      <option value="economy">Económico</option>
                      <option value="luxury">Lujo</option>
                      <option value="extended_stay">Estancia Extendida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                    <select
                      value={formData.classification.size}
                      onChange={(e) => setFormData({
                        ...formData,
                        classification: { ...formData.classification, size: e.target.value as any }
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="small">Pequeño</option>
                      <option value="medium">Mediano</option>
                      <option value="large">Grande</option>
                      <option value="enterprise">Empresa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Habitaciones</label>
                  <input
                    type="number"
                    value={formData.classification.rooms || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      classification: { ...formData.classification, rooms: parseInt(e.target.value) || undefined }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Dirección</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Calle</label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, street: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, city: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado/Región</label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, state: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">País</label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, country: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, postalCode: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Contacto</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="text"
                        value={formData.contact.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, phone: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, email: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Sitio Web (opcional)</label>
                      <input
                        type="url"
                        value={formData.contact.website}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, website: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormData(initialFormData);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateHotel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición - Similar al de creación pero con datos pre-poblados */}
      {isEditModalOpen && selectedHotel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Editar Hotel: {selectedHotel.name}
              </h3>
              {/* Aquí iría el mismo formulario que en el modal de creación */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedHotel(null);
                    setFormData(initialFormData);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateHotel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && selectedHotel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-5">Eliminar Hotel</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar el hotel "{selectedHotel.name}"? 
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedHotel(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteHotel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;