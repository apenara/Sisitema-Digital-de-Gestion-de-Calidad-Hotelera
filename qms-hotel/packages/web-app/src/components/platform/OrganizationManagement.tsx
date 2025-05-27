import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  loadOrganizationUsers,
  addUserToOrganization,
  removeUserFromOrganization,
  updateUserRole,
  loadOrganizationHotels,
  loadOrganizationMetrics,
  selectOrganizations,
  selectCurrentOrganization,
  selectOrganizationUsers,
  selectOrganizationHotels,
  selectOrganizationMetrics,
  selectOrganizationLoading,
  selectOrganizationErrors,
  setCurrentOrganization
} from '../../store/slices/organizationSlice';
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput, OrganizationUser, OrganizationSettings } from '../../../../shared/types/Organization';

interface OrganizationFormData {
  name: string;
  description: string;
  type: 'hotel_chain' | 'hotel_group' | 'management_company';
  settings: Partial<OrganizationSettings>;
}

const initialFormData: OrganizationFormData = {
  name: '',
  description: '',
  type: 'hotel_chain',
  settings: {
    branding: {
      primaryColor: '#1976d2',
      secondaryColor: '#424242'
    },
    features: {
      multiHotelManagement: true,
      centralizedReporting: true,
      crossHotelAnalytics: true,
      standardizedProcesses: true
    },
    integrations: {
      enabled: [],
      config: {}
    },
    notifications: {
      globalAlerts: true,
      crossHotelReports: true,
      chainMetrics: true
    }
  }
};

const OrganizationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });

  // Selectors
  const organizations = useAppSelector(selectOrganizations);
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const loading = useAppSelector(selectOrganizationLoading);
  const errors = useAppSelector(selectOrganizationErrors);

  // Selectors para organización seleccionada
  const organizationUsers = useAppSelector(state => 
    selectedOrganization ? selectOrganizationUsers(state, selectedOrganization.id) : []
  );
  const organizationHotels = useAppSelector(state => 
    selectedOrganization ? selectOrganizationHotels(state, selectedOrganization.id) : []
  );
  const organizationMetrics = useAppSelector(state => 
    selectedOrganization ? selectOrganizationMetrics(state, selectedOrganization.id) : null
  );

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(loadOrganizations());
  }, [dispatch]);

  // Cargar datos de organización seleccionada
  useEffect(() => {
    if (selectedOrganization) {
      dispatch(loadOrganizationUsers(selectedOrganization.id));
      dispatch(loadOrganizationHotels(selectedOrganization.id));
      dispatch(loadOrganizationMetrics(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  // Filtrar organizaciones
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filters.type || org.type === filters.type;
    const matchesStatus = !filters.status || org.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateOrganization = async () => {
    try {
      const createData: CreateOrganizationInput = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        settings: formData.settings
      };
      
      await dispatch(createOrganization({
        data: createData,
        createdBy: 'current-user-id' // TODO: obtener del contexto de auth
      })).unwrap();
      
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrganization) return;
    
    try {
      const updateData: UpdateOrganizationInput = {
        name: formData.name,
        description: formData.description,
        settings: formData.settings
      };
      
      await dispatch(updateOrganization({
        id: selectedOrganization.id,
        updates: updateData
      })).unwrap();
      
      setIsEditModalOpen(false);
      setSelectedOrganization(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;
    
    try {
      await dispatch(deleteOrganization(selectedOrganization.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedOrganization(null);
      if (currentOrganization?.id === selectedOrganization.id) {
        dispatch(setCurrentOrganization(null));
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const openEditModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setFormData({
      name: organization.name,
      description: organization.description || '',
      type: organization.type,
      settings: organization.settings
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDeleteModalOpen(true);
  };

  const openUserModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsUserModalOpen(true);
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedOrganization) return;
    
    try {
      await dispatch(removeUserFromOrganization({
        organizationId: selectedOrganization.id,
        userId
      })).unwrap();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: OrganizationUser['role']) => {
    if (!selectedOrganization) return;
    
    try {
      await dispatch(updateUserRole({
        organizationId: selectedOrganization.id,
        userId,
        newRole
      })).unwrap();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    const statusLabels = {
      active: 'Activa',
      inactive: 'Inactiva',
      suspended: 'Suspendida'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.inactive}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      hotel_chain: 'bg-blue-100 text-blue-800',
      hotel_group: 'bg-purple-100 text-purple-800',
      management_company: 'bg-green-100 text-green-800'
    };
    
    const typeLabels = {
      hotel_chain: 'Cadena Hotelera',
      hotel_group: 'Grupo Hotelero',
      management_company: 'Administradora'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type as keyof typeof typeClasses] || typeClasses.hotel_chain}`}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      chain_admin: 'bg-red-100 text-red-800',
      chain_manager: 'bg-blue-100 text-blue-800',
      chain_analyst: 'bg-gray-100 text-gray-800'
    };
    
    const roleLabels = {
      chain_admin: 'Administrador',
      chain_manager: 'Gerente',
      chain_analyst: 'Analista'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleClasses[role as keyof typeof roleClasses] || roleClasses.chain_analyst}`}>
        {roleLabels[role as keyof typeof roleLabels] || role}
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
                Gestión de Organizaciones
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administrar cadenas hoteleras y grupos empresariales
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
                Crear Organización
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="hotel_chain">Cadena Hotelera</option>
                <option value="hotel_group">Grupo Hotelero</option>
                <option value="management_company">Administradora</option>
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
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="suspended">Suspendida</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de organizaciones */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading.organizations ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay organizaciones</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva organización.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrganizations.map((organization) => (
                <li key={organization.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{organization.name}</h3>
                          <div className="ml-3 flex space-x-2">
                            {getStatusBadge(organization.status)}
                            {getTypeBadge(organization.type)}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{organization.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Hoteles: {organization.totalHotels || 0}</span>
                          <span>•</span>
                          <span>Usuarios: {organization.totalUsers || 0}</span>
                          <span>•</span>
                          <span>Creada: {new Date(organization.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openUserModal(organization)}
                          className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                        >
                          Usuarios
                        </button>
                        <button
                          onClick={() => openEditModal(organization)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(organization)}
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
                Crear Nueva Organización
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
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="hotel_chain">Cadena Hotelera</option>
                      <option value="hotel_group">Grupo Hotelero</option>
                      <option value="management_company">Administradora</option>
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

                {/* Configuración de características */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Características</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="multiHotelManagement"
                        type="checkbox"
                        checked={formData.settings.features?.multiHotelManagement || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            features: {
                              ...formData.settings.features!,
                              multiHotelManagement: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="multiHotelManagement" className="ml-2 block text-sm text-gray-900">
                        Gestión multi-hotel
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="centralizedReporting"
                        type="checkbox"
                        checked={formData.settings.features?.centralizedReporting || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            features: {
                              ...formData.settings.features!,
                              centralizedReporting: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="centralizedReporting" className="ml-2 block text-sm text-gray-900">
                        Reportes centralizados
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="crossHotelAnalytics"
                        type="checkbox"
                        checked={formData.settings.features?.crossHotelAnalytics || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            features: {
                              ...formData.settings.features!,
                              crossHotelAnalytics: e.target.checked
                            }
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="crossHotelAnalytics" className="ml-2 block text-sm text-gray-900">
                        Análisis cross-hotel
                      </label>
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
                  onClick={handleCreateOrganization}
                  disabled={loading.creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.creating ? 'Creando...' : 'Crear Organización'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestión de usuarios */}
      {isUserModalOpen && selectedOrganization && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Usuarios de {selectedOrganization.name}
                </h3>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading.users[selectedOrganization.id] ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : organizationUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No hay usuarios en esta organización.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizationUsers.map((orgUser) => (
                    <div key={orgUser.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {orgUser.userId}
                            </h4>
                            <p className="text-sm text-gray-500">Usuario ID: {orgUser.userId}</p>
                          </div>
                          {getRoleBadge(orgUser.role)}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Unido: {new Date(orgUser.joinedAt).toLocaleDateString()}
                          {orgUser.invitedBy && ` por ${orgUser.invitedBy}`}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={orgUser.role}
                          onChange={(e) => handleUpdateUserRole(orgUser.userId, e.target.value as any)}
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="chain_admin">Administrador</option>
                          <option value="chain_manager">Gerente</option>
                          <option value="chain_analyst">Analista</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(orgUser.userId)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      {isDeleteModalOpen && selectedOrganization && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-5">Eliminar Organización</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar la organización "{selectedOrganization.name}"? 
                  Esta acción no se puede deshacer y eliminará todos los datos asociados.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedOrganization(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteOrganization}
                  disabled={loading.deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading.deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;