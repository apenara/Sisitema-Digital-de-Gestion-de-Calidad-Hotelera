import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadPlatformDashboard,
  loadPlatformAlerts,
  acknowledgeAlert,
  resolveAlert,
  selectPlatformDashboard,
  selectPlatformAlerts,
  selectUnreadAlertsCount,
  selectPlatformLoading,
  selectPlatformErrors
} from '../../store/slices/platformSlice';
import {
  loadOrganizations,
  selectOrganizations,
  selectOrganizationStats
} from '../../store/slices/organizationSlice';
import {
  loadActiveSubscriptions,
  loadSubscriptionMetrics,
  selectSubscriptions,
  selectGlobalMetrics,
  selectTotalMonthlyRevenue
} from '../../store/slices/subscriptionSlice';
import type { PlatformAlert } from '../../../../shared/types';
import { toast } from 'react-toastify';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

// Componente StatCard optimizado con React.memo
const StatCard = React.memo<StatCardProps>(({ title, value, change, changeLabel, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
          <div className="text-white text-xl">{icon}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </dd>
            {change !== undefined && (
              <dd className="text-sm text-gray-600">
                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {change >= 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && ` ${changeLabel}`}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
});

interface AlertItemProps {
  alert: PlatformAlert;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

// Componente AlertItem optimizado con React.memo
const AlertItem = React.memo<AlertItemProps>(({ alert, onAcknowledge, onResolve }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`border-l-4 p-4 ${getSeverityColor(alert.severity)}`}>
      <div className="flex">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {alert.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {alert.message}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(alert.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="ml-4 flex space-x-2">
          {alert.status === 'active' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
            >
              Confirmar
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
            >
              Resolver
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Componente Skeleton Loading
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const PlatformDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selectors
  const dashboard = useAppSelector(selectPlatformDashboard);
  const alerts = useAppSelector(selectPlatformAlerts);
  const unreadAlertsCount = useAppSelector(selectUnreadAlertsCount);
  const loading = useAppSelector(selectPlatformLoading);
  const errors = useAppSelector(selectPlatformErrors);
  
  const organizations = useAppSelector(selectOrganizations);
  const organizationStats = useAppSelector(selectOrganizationStats);
  
  const subscriptions = useAppSelector(selectSubscriptions);
  const globalMetrics = useAppSelector(selectGlobalMetrics);
  const totalMRR = useAppSelector(selectTotalMonthlyRevenue);

  // Memoized stats
  const stats = useMemo(() => ({
    totalOrganizations: dashboard?.statistics?.totalOrganizations || organizationStats?.total || 0,
    totalHotels: dashboard?.statistics?.totalHotels || 0,
    activeUsers: dashboard?.statistics?.activeUsers || 0,
    mrr: totalMRR
  }), [dashboard, organizationStats, totalMRR]);

  // Memoized filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [alerts, searchTerm, filterStatus]);

  // Cargar datos iniciales con manejo de errores
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos críticos primero
        await dispatch(loadPlatformDashboard());
        
        // Cargar datos secundarios después
        await Promise.all([
          dispatch(loadPlatformAlerts()),
          dispatch(loadOrganizations(100)),
          dispatch(loadActiveSubscriptions(100)),
          dispatch(loadSubscriptionMetrics())
        ]);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos del dashboard');
      }
    };

    loadData();
  }, [dispatch]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(loadPlatformDashboard());
      dispatch(loadPlatformAlerts());
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await dispatch(acknowledgeAlert({ alertId, acknowledgedBy: 'current-user-id' }));
      toast.success('Alerta confirmada exitosamente');
    } catch (error) {
      console.error('Error al confirmar alerta:', error);
      toast.error('Error al confirmar la alerta');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await dispatch(resolveAlert({ alertId, resolvedBy: 'current-user-id' }));
      toast.success('Alerta resuelta exitosamente');
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      toast.error('Error al resolver la alerta');
    }
  };

  const systemHealth = dashboard?.systemHealth;
  const financialMetrics = dashboard?.financialMetrics;

  if (loading.dashboard && !dashboard) {
    return <LoadingSkeleton />;
  }

  if (errors.dashboard && !dashboard) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-lg font-medium">Error cargando dashboard</h3>
            <p className="mt-2 text-sm">{errors.dashboard}</p>
            <button
              onClick={() => dispatch(loadPlatformDashboard())}
              className="mt-4 text-sm text-red-600 hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard de Plataforma
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Vista general del sistema QMS+Hotel
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => {
                  dispatch(loadPlatformDashboard());
                  dispatch(loadPlatformAlerts());
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Organizaciones"
            value={stats.totalOrganizations}
            change={5.2}
            changeLabel="este mes"
            icon="🏢"
            color="blue"
          />
          <StatCard
            title="Hoteles"
            value={stats.totalHotels}
            change={3.1}
            changeLabel="este mes"
            icon="🏨"
            color="green"
          />
          <StatCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            change={-1.2}
            changeLabel="esta semana"
            icon="👥"
            color="purple"
          />
          <StatCard
            title="MRR"
            value={`$${stats.mrr.toLocaleString()}`}
            change={12.5}
            changeLabel="este mes"
            icon="💰"
            color="green"
          />
        </div>

        {/* Grid principal */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Alertas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Alertas del Sistema
                </h3>
                {unreadAlertsCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadAlertsCount} nuevas
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay alertas activas
                  </p>
                ) : (
                  filteredAlerts.slice(0, 5).map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                      onResolve={handleResolveAlert}
                    />
                  ))
                )}
              </div>
              {filteredAlerts.length > 5 && (
                <div className="mt-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todas las alertas
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                {systemHealth?.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        component.status === 'operational' ? 'bg-green-500' :
                        component.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {component.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {component.responseTime && (
                        <span>{component.responseTime}ms</span>
                      )}
                      <span>{component.uptime}% uptime</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Estado General
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemHealth?.overall === 'healthy' ? 'bg-green-100 text-green-800' :
                    systemHealth?.overall === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth?.overall === 'healthy' ? 'Saludable' :
                     systemHealth?.overall === 'warning' ? 'Advertencia' : 'Crítico'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas financieras */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Métricas Financieras
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Ingresos Hoy</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${financialMetrics?.revenue.today.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Este Mes</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${financialMetrics?.revenue.thisMonth.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Este Año</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${financialMetrics?.revenue.thisYear.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Tasa de Churn</span>
                    <span className="text-sm font-bold text-red-600">
                      {financialMetrics?.churn.rate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                  dashboard.recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'success' ? 'bg-green-500' :
                        activity.severity === 'warning' ? 'bg-yellow-500' :
                        activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay actividad reciente
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div className="mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-blue-600 bg-blue-100 rounded-lg inline-flex p-3 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h4 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Gestionar Organizaciones
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Crear, editar y administrar cadenas hoteleras
                    </p>
                  </div>
                </button>

                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-green-600 bg-green-100 rounded-lg inline-flex p-3 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h4 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Gestionar Subscripciones
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Planes, facturación y métricas de subscripciones
                    </p>
                  </div>
                </button>

                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-purple-600 bg-purple-100 rounded-lg inline-flex p-3 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h4 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Analytics Globales
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Métricas y reportes de toda la plataforma
                    </p>
                  </div>
                </button>

                <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-yellow-600 bg-yellow-100 rounded-lg inline-flex p-3 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h4 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Configuración de Plataforma
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Ajustes generales y configuración del sistema
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;