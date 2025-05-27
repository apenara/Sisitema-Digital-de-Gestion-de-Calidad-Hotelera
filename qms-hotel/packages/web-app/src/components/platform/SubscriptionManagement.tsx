import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadActiveSubscriptions,
  loadSubscriptionPlans,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  loadSubscriptionMetrics,
  loadSubscriptionEvents,
  selectSubscriptions,
  selectSubscriptionPlans,
  selectGlobalMetrics,
  selectFilteredSubscriptions,
  selectSubscriptionsByStatus,
  selectTotalMonthlyRevenue,
  selectExpiredTrials,
  selectUpcomingRenewals,
  selectSubscriptionLoading,
  selectSubscriptionErrors,
  setSubscriptionFilters,
  showCancelModal,
  hideCancelModal
} from '../../store/slices/subscriptionSlice';
import {
  loadOrganizations,
  selectOrganizations
} from '../../store/slices/organizationSlice';
import type { Subscription, SubscriptionPlan, CreateSubscriptionInput } from '../../../../shared/types/Subscription';

interface SubscriptionFormData {
  organizationId?: string;
  hotelId?: string;
  planId: string;
  startDate: string;
  trialDays?: number;
  billing: {
    email: string;
    name: string;
    invoiceSettings: {
      sendInvoices: boolean;
      invoiceLanguage: string;
    };
  };
}

const initialFormData: SubscriptionFormData = {
  planId: '',
  startDate: new Date().toISOString().split('T')[0],
  billing: {
    email: '',
    name: '',
    invoiceSettings: {
      sendInvoices: true,
      invoiceLanguage: 'es'
    }
  }
};

const SubscriptionManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'trials' | 'cancelled' | 'all'>('active');

  // Selectors
  const subscriptions = useAppSelector(selectFilteredSubscriptions);
  const allSubscriptions = useAppSelector(selectSubscriptions);
  const plans = useAppSelector(selectSubscriptionPlans);
  const organizations = useAppSelector(selectOrganizations);
  const globalMetrics = useAppSelector(selectGlobalMetrics);
  const subscriptionsByStatus = useAppSelector(selectSubscriptionsByStatus);
  const totalMRR = useAppSelector(selectTotalMonthlyRevenue);
  const expiredTrials = useAppSelector(selectExpiredTrials);
  const upcomingRenewals = useAppSelector(selectUpcomingRenewals);
  const loading = useAppSelector(selectSubscriptionLoading);
  const errors = useAppSelector(selectSubscriptionErrors);

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(loadActiveSubscriptions());
    dispatch(loadSubscriptionPlans(false)); // false para no incluir inactivos
    dispatch(loadSubscriptionMetrics());
    dispatch(loadOrganizations());
  }, [dispatch]);

  // Aplicar filtros según la pestaña activa
  useEffect(() => {
    const filters: any = {};
    
    switch (activeTab) {
      case 'active':
        filters.status = ['active'];
        break;
      case 'trials':
        filters.status = ['trialing'];
        break;
      case 'cancelled':
        filters.status = ['canceled', 'unpaid'];
        break;
      case 'all':
        // Sin filtros
        break;
    }
    
    dispatch(setSubscriptionFilters(filters));
  }, [dispatch, activeTab]);

  const handleCreateSubscription = async () => {
    try {
      const createData: CreateSubscriptionInput = {
        organizationId: formData.organizationId,
        hotelId: formData.hotelId,
        planId: formData.planId,
        billing: formData.billing,
        trialDays: formData.trialDays
      };
      
      await dispatch(createSubscription({
        data: createData,
        createdBy: 'current-user-id' // TODO: obtener del contexto de auth
      })).unwrap();
      
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, reason?: string) => {
    try {
      await dispatch(cancelSubscription({ subscriptionId, reason })).unwrap();
      dispatch(hideCancelModal());
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      await dispatch(reactivateSubscription(subscriptionId)).unwrap();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  const openDetailModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    dispatch(loadSubscriptionEvents({ subscriptionId: subscription.id, limit: 10 }));
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-red-100 text-red-800',
      unpaid: 'bg-gray-100 text-gray-800',
      paused: 'bg-purple-100 text-purple-800'
    };
    
    const statusLabels = {
      active: 'Activa',
      trialing: 'Prueba',
      past_due: 'Vencida',
      canceled: 'Cancelada',
      unpaid: 'Sin Pagar',
      paused: 'Pausada'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.active}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getPlanBadge = (planType: string) => {
    const planClasses = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planClasses[planType as keyof typeof planClasses] || planClasses.basic}`}>
        {planType.charAt(0).toUpperCase() + planType.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredSubscriptionsList = allSubscriptions.filter(sub => {
    if (!searchQuery) return true;
    
    return (
      sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.organizationId && organizations.find(org => org.id === sub.organizationId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Gestión de Subscripciones
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administrar planes, facturación y métricas de subscripciones
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
                Nueva Subscripción
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">MRR</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(totalMRR)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Subscripciones Activas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {subscriptionsByStatus.active || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">⏰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Trials Expirados</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {expiredTrials.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">🔄</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Renovaciones Próximas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {upcomingRenewals.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas y búsqueda */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'active', label: 'Activas', count: subscriptionsByStatus.active || 0 },
                    { key: 'trials', label: 'Pruebas', count: subscriptionsByStatus.trialing || 0 },
                    { key: 'cancelled', label: 'Canceladas', count: (subscriptionsByStatus.cancelled || 0) + (subscriptionsByStatus.expired || 0) },
                    { key: 'all', label: 'Todas', count: allSubscriptions.length }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
                <div className="w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar subscripciones..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de subscripciones */}
          <div className="overflow-hidden">
            {loading.subscriptions ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSubscriptionsList.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5h6m-6 4h6m2-5V9a2 2 0 012-2h4a2 2 0 012 2v6m-6 0h6m-6 4h6m2-5V9a2 2 0 012-2h4a2 2 0 012 2v6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay subscripciones</h3>
                <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva subscripción.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredSubscriptionsList.map((subscription) => (
                  <li key={subscription.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {subscription.plan.name}
                          </h3>
                          {getStatusBadge(subscription.status)}
                          {getPlanBadge(subscription.plan.type)}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>ID: {subscription.id}</span>
                          {subscription.organizationId && (
                            <>
                              <span>•</span>
                              <span>
                                Org: {organizations.find(org => org.id === subscription.organizationId)?.name || subscription.organizationId}
                              </span>
                            </>
                          )}
                          {subscription.hotelId && (
                            <>
                              <span>•</span>
                              <span>Hotel: {subscription.hotelId}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {formatCurrency(subscription.plan.pricing.amount, subscription.plan.pricing.currency)} / {subscription.plan.pricing.interval}
                          </span>
                          <span>•</span>
                          <span>
                            Próxima facturación: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            Creada: {new Date(subscription.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailModal(subscription)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Ver Detalles
                        </button>
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => dispatch(showCancelModal())}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                        {(subscription.status === 'canceled' || subscription.status === 'unpaid') && (
                          <button
                            onClick={() => handleReactivateSubscription(subscription.id)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de creación */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Nueva Subscripción
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <select
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar plan</option>
                      {plans.filter(plan => plan.isActive && plan.isPublic).map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatCurrency(plan.pricing.amount, plan.pricing.currency)}/{plan.pricing.interval}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email de Facturación</label>
                    <input
                      type="email"
                      value={formData.billing.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        billing: { ...formData.billing, email: e.target.value }
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre para Facturación</label>
                  <input
                    type="text"
                    value={formData.billing.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      billing: { ...formData.billing, name: e.target.value }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organización</label>
                    <select
                      value={formData.organizationId || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        organizationId: e.target.value || undefined,
                        hotelId: undefined // Reset hotel when org changes
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar organización (opcional)</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel ID</label>
                    <input
                      type="text"
                      value={formData.hotelId || ''}
                      onChange={(e) => setFormData({ ...formData, hotelId: e.target.value || undefined })}
                      placeholder="ID del hotel (opcional)"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Días de Prueba</label>
                    <input
                      type="number"
                      value={formData.trialDays || ''}
                      onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || undefined })}
                      placeholder="Días (opcional)"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
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
                  onClick={handleCreateSubscription}
                  disabled={loading.creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.creating ? 'Creando...' : 'Crear Subscripción'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Detalles de Subscripción
                </h3>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Información General</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">ID</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedSubscription.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Plan</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedSubscription.plan.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Estado</dt>
                      <dd>{getStatusBadge(selectedSubscription.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Precio</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedSubscription.plan.pricing.amount, selectedSubscription.plan.pricing.currency)} / {selectedSubscription.plan.pricing.interval}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Fechas</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Creada</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedSubscription.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Período Actual</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedSubscription.currentPeriodStart).toLocaleDateString()} - {new Date(selectedSubscription.currentPeriodEnd).toLocaleDateString()}
                      </dd>
                    </div>
                    {selectedSubscription.status === 'canceled' && (
                      <div>
                        <dt className="text-sm text-gray-500">Estado</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          Cancelada
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {selectedSubscription.usage && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Uso Actual</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Hoteles:</span>
                        <span className="ml-2 font-medium">{selectedSubscription.usage.currentHotels} / {selectedSubscription.limits.maxHotels === -1 ? '∞' : selectedSubscription.limits.maxHotels}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usuarios:</span>
                        <span className="ml-2 font-medium">{selectedSubscription.usage.currentUsers} / {selectedSubscription.limits.maxUsers === -1 ? '∞' : selectedSubscription.limits.maxUsers}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Documentos:</span>
                        <span className="ml-2 font-medium">{selectedSubscription.usage.currentDocuments} / {selectedSubscription.limits.maxDocuments === -1 ? '∞' : selectedSubscription.limits.maxDocuments}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Almacenamiento:</span>
                        <span className="ml-2 font-medium">{(selectedSubscription.usage.currentStorage / 1024 / 1024).toFixed(2)} MB / {selectedSubscription.limits.maxStorage === -1 ? '∞' : (selectedSubscription.limits.maxStorage / 1024 / 1024).toFixed(0)} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;