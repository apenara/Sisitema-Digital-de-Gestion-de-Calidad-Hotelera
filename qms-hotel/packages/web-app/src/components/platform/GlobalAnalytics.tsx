import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadPlatformDashboard,
  selectPlatformDashboard,
  selectPlatformLoading
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
  selectTotalMonthlyRevenue,
  selectSubscriptionsByStatus,
  selectSubscriptionsByPlan
} from '../../store/slices/subscriptionSlice';

interface DateRange {
  start: Date;
  end: Date;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }>;
}

const GlobalAnalytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
    end: new Date()
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'usage' | 'growth'>('overview');

  // Selectors
  const dashboard = useAppSelector(selectPlatformDashboard);
  const organizations = useAppSelector(selectOrganizations);
  const organizationStats = useAppSelector(selectOrganizationStats);
  const subscriptions = useAppSelector(selectSubscriptions);
  const globalMetrics = useAppSelector(selectGlobalMetrics);
  const totalMRR = useAppSelector(selectTotalMonthlyRevenue);
  const subscriptionsByStatus = useAppSelector(selectSubscriptionsByStatus);
  const subscriptionsByPlan = useAppSelector(selectSubscriptionsByPlan);
  const loading = useAppSelector(selectPlatformLoading);

  // Cargar datos
  useEffect(() => {
    dispatch(loadPlatformDashboard());
    dispatch(loadOrganizations());
    dispatch(loadActiveSubscriptions());
    dispatch(loadSubscriptionMetrics());
  }, [dispatch]);

  // Datos para gráficos
  const revenueChartData: ChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'MRR',
        data: [15000, 18000, 22000, 25000, 28000, totalMRR],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)'
      }
    ]
  };

  const subscriptionsByPlanData: ChartData = {
    labels: Object.keys(subscriptionsByPlan),
    datasets: [
      {
        label: 'Subscripciones por Plan',
        data: Object.values(subscriptionsByPlan),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }
    ]
  };

  const organizationGrowthData: ChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Nuevas Organizaciones',
        data: [2, 4, 3, 6, 5, 8],
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)'
      },
      {
        label: 'Nuevos Hoteles',
        data: [8, 12, 15, 18, 22, 25],
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgb(245, 158, 11)'
      }
    ]
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading.dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                Analytics Globales
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Métricas y reportes de toda la plataforma QMS+Hotel
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Exportar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Resumen General' },
              { key: 'revenue', label: 'Ingresos' },
              { key: 'usage', label: 'Uso de la Plataforma' },
              { key: 'growth', label: 'Crecimiento' }
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
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido por pestaña */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-6">
            {/* KPIs principales */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">🏢</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Organizaciones
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {organizationStats?.total || 0}
                        </dd>
                        <dd className="text-sm text-green-600">
                          +{calculateGrowthRate(organizationStats?.total || 0, 45).toFixed(1)}% este mes
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
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">🏨</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Hoteles
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboard?.statistics?.totalHotels || 0}
                        </dd>
                        <dd className="text-sm text-green-600">
                          +8.3% este mes
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
                        <span className="text-white text-lg">👥</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Usuarios Activos
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboard?.statistics?.activeUsers || 0}
                        </dd>
                        <dd className="text-sm text-green-600">
                          +12.1% este mes
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
                        <span className="text-white text-lg">💰</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          MRR Total
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {formatCurrency(totalMRR)}
                        </dd>
                        <dd className="text-sm text-green-600">
                          +15.4% este mes
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de resumen */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Distribución de Subscripciones
                </h3>
                <div className="space-y-3">
                  {Object.entries(subscriptionsByPlan).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{plan}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / subscriptions.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de Subscripciones
                </h3>
                <div className="space-y-3">
                  {Object.entries(subscriptionsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="mt-8 space-y-6">
            {/* Métricas de ingresos */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">MRR</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalMRR)}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ARR</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalMRR * 12)}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">LTV Promedio</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalMRR * 24)}</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Gráfico de tendencia de ingresos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tendencia de Ingresos Recurrentes
              </h3>
              <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
                <p className="text-gray-500">Gráfico de líneas aquí (integrar con librería de gráficos)</p>
              </div>
            </div>

            {/* Ingresos por plan */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ingresos por Plan
              </h3>
              <div className="space-y-4">
                {Object.entries(subscriptionsByPlan).map(([plan, count]) => {
                  const planRevenue = count * (plan === 'basic' ? 99 : plan === 'premium' ? 299 : plan === 'enterprise' ? 999 : 0);
                  return (
                    <div key={plan} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 capitalize">{plan}</h4>
                        <p className="text-sm text-gray-500">{count} subscripciones activas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{formatCurrency(planRevenue)}</p>
                        <p className="text-sm text-gray-500">MRR</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="mt-8 space-y-6">
            {/* Estadísticas de uso */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Documentos Totales</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard?.statistics?.totalDocuments || 0}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">No Conformidades</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard?.statistics?.totalNonConformities || 0}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">API Requests (mes)</dt>
                    <dd className="text-lg font-medium text-gray-900">1.2M</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Almacenamiento</dt>
                    <dd className="text-lg font-medium text-gray-900">2.8 GB</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Uso por características */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Uso de Características
              </h3>
              <div className="space-y-4">
                {[
                  { feature: 'Gestión de Documentos', usage: 89, total: 100 },
                  { feature: 'No Conformidades', usage: 76, total: 100 },
                  { feature: 'Analytics Avanzados', usage: 45, total: 50 },
                  { feature: 'API Access', usage: 23, total: 30 },
                  { feature: 'Integraciones Custom', usage: 12, total: 15 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.usage / item.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{item.usage}/{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="mt-8 space-y-6">
            {/* Métricas de crecimiento */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Nuevas Organizaciones</dt>
                    <dd className="text-lg font-medium text-gray-900">8</dd>
                    <dd className="text-sm text-green-600">+33% vs mes anterior</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Nuevos Hoteles</dt>
                    <dd className="text-lg font-medium text-gray-900">25</dd>
                    <dd className="text-sm text-green-600">+14% vs mes anterior</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tasa de Conversión</dt>
                    <dd className="text-lg font-medium text-gray-900">23.5%</dd>
                    <dd className="text-sm text-green-600">+2.1% vs mes anterior</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Churn Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">3.2%</dd>
                    <dd className="text-sm text-red-600">+0.5% vs mes anterior</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Gráfico de crecimiento */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crecimiento de la Plataforma
              </h3>
              <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
                <p className="text-gray-500">Gráfico de crecimiento aquí (integrar con librería de gráficos)</p>
              </div>
            </div>

            {/* Embudo de conversión */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Embudo de Conversión
              </h3>
              <div className="space-y-4">
                {[
                  { stage: 'Visitantes del sitio', count: 10000, percentage: 100 },
                  { stage: 'Registros de prueba', count: 1200, percentage: 12 },
                  { stage: 'Usuarios activos en trial', count: 850, percentage: 8.5 },
                  { stage: 'Conversiones a pago', count: 200, percentage: 2.0 },
                  { stage: 'Retención a 6 meses', count: 170, percentage: 1.7 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.stage}</h4>
                      <p className="text-sm text-gray-500">{item.percentage}% del total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAnalytics;