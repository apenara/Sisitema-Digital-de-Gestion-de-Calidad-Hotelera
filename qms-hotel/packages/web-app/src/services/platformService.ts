import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Platform,
  PlatformSettings,
  PlatformStatistics,
  MaintenanceWindow,
  PlatformDashboardData,
  PlatformActivity,
  PlatformAlert,
  SystemHealth,
  FinancialMetrics,
  UpdatePlatformSettingsInput,
  CreateMaintenanceWindowInput,
  PlatformAnalyticsQuery,
  PlatformAnalyticsResult,
  Hotel,
  User,
  Subscription
} from '../../../shared/types';

class PlatformService {
  private readonly platformCollection = 'platform';
  private readonly activitiesCollection = 'platform_activities';
  private readonly alertsCollection = 'platform_alerts';
  private readonly maintenanceCollection = 'platform_maintenance';
  
  // ======================
  // CONFIGURACIÓN DE PLATAFORMA
  // ======================
  
  async getPlatformSettings(): Promise<Platform> {
    try {
      const docRef = doc(db, this.platformCollection, 'settings');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Configuración de plataforma no encontrada');
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Platform;
    } catch (error) {
      console.error('Error obteniendo configuración de plataforma:', error);
      throw error;
    }
  }
  
  async updatePlatformSettings(updates: UpdatePlatformSettingsInput): Promise<Platform> {
    try {
      const docRef = doc(db, this.platformCollection, 'settings');
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      return await this.getPlatformSettings();
    } catch (error) {
      console.error('Error actualizando configuración de plataforma:', error);
      throw error;
    }
  }
  
  // ======================
  // ESTADÍSTICAS DE PLATAFORMA
  // ======================
  
  async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      // Obtener estadísticas de diferentes colecciones
      const [
        organizationsSnap,
        hotelsSnap,
        usersSnap,
        subscriptionsSnap
      ] = await Promise.all([
        getDocs(collection(db, 'organizations')),
        getDocs(collection(db, 'hotels')),
        getDocs(collection(db, 'platform_users')),
        getDocs(collection(db, 'subscriptions'))
      ]);
      
      // Calcular estadísticas básicas
      const totalOrganizations = organizationsSnap.size;
      const totalHotels = hotelsSnap.size;
      const totalUsers = usersSnap.size;
      const totalSubscriptions = subscriptionsSnap.size;
      
      // Calcular estadísticas activas
      const activeOrganizations = organizationsSnap.docs.filter(
        doc => doc.data().status === 'active'
      ).length;
      
      const activeHotels = hotelsSnap.docs.filter(
        doc => doc.data().status === 'active'
      ).length;
      
      const activeUsers = usersSnap.docs.filter(
        doc => doc.data().isActive === true
      ).length;
      
      const activeSubscriptions = subscriptionsSnap.docs.filter(
        doc => doc.data().status === 'active'
      ).length;
      
      // Calcular métricas financieras básicas
      let monthlyRecurringRevenue = 0;
      let totalRevenue = 0;
      
      subscriptionsSnap.docs.forEach(doc => {
        const subscription = doc.data();
        if (subscription.status === 'active') {
          const amount = subscription.plan?.pricing?.amount || 0;
          monthlyRecurringRevenue += amount;
          totalRevenue += amount;
        }
      });
      
      const annualRecurringRevenue = monthlyRecurringRevenue * 12;
      const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
      
      return {
        totalOrganizations,
        totalHotels,
        totalUsers,
        totalSubscriptions,
        activeOrganizations,
        activeHotels,
        activeUsers,
        activeSubscriptions,
        totalDocuments: 0, // TODO: Calcular desde documentos
        totalNonConformities: 0, // TODO: Calcular desde no conformidades
        totalStorageUsed: 0, // TODO: Calcular desde archivos
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        totalRevenue,
        averageRevenuePerUser,
        dailyActiveUsers: 0, // TODO: Implementar tracking de actividad
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        lastCalculated: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de plataforma:', error);
      throw error;
    }
  }
  
  // ======================
  // DASHBOARD DE PLATAFORMA
  // ======================
  
  async getPlatformDashboardData(): Promise<PlatformDashboardData> {
    try {
      const [statistics, recentActivity, alerts, systemHealth, financialMetrics] = await Promise.all([
        this.getPlatformStatistics(),
        this.getRecentActivity(10),
        this.getActiveAlerts(),
        this.getSystemHealth(),
        this.getFinancialMetrics()
      ]);
      
      return {
        statistics,
        recentActivity,
        alerts,
        systemHealth,
        financialMetrics
      };
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      throw error;
    }
  }
  
  // ======================
  // ACTIVIDAD DE PLATAFORMA
  // ======================
  
  async getRecentActivity(limitCount: number = 50): Promise<PlatformActivity[]> {
    try {
      const q = query(
        collection(db, this.activitiesCollection),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as PlatformActivity[];
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      throw error;
    }
  }
  
  async logActivity(activity: Omit<PlatformActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, this.activitiesCollection), {
        ...activity,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error registrando actividad:', error);
      throw error;
    }
  }
  
  // ======================
  // ALERTAS DE PLATAFORMA
  // ======================
  
  async getActiveAlerts(): Promise<PlatformAlert[]> {
    try {
      const q = query(
        collection(db, this.alertsCollection),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        acknowledgedAt: doc.data().acknowledgedAt?.toDate(),
        resolvedAt: doc.data().resolvedAt?.toDate()
      })) as PlatformAlert[];
    } catch (error) {
      console.error('Error obteniendo alertas activas:', error);
      throw error;
    }
  }
  
  async createAlert(alert: Omit<PlatformAlert, 'id' | 'createdAt' | 'status'>): Promise<PlatformAlert> {
    try {
      const docRef = await addDoc(collection(db, this.alertsCollection), {
        ...alert,
        status: 'active',
        createdAt: Timestamp.now()
      });
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data()?.createdAt?.toDate()
      } as PlatformAlert;
    } catch (error) {
      console.error('Error creando alerta:', error);
      throw error;
    }
  }
  
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.alertsCollection, alertId);
      await updateDoc(docRef, {
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error confirmando alerta:', error);
      throw error;
    }
  }
  
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.alertsCollection, alertId);
      await updateDoc(docRef, {
        status: 'resolved',
        resolvedBy,
        resolvedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
    }
  }
  
  // ======================
  // SALUD DEL SISTEMA
  // ======================
  
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // TODO: Implementar verificaciones reales de salud del sistema
      // Por ahora, devolver datos simulados
      return {
        overall: 'healthy',
        components: [
          {
            name: 'Database',
            status: 'operational',
            responseTime: 45,
            uptime: 99.9,
            lastChecked: new Date(),
            incidents: 0
          },
          {
            name: 'Authentication',
            status: 'operational',
            responseTime: 120,
            uptime: 99.8,
            lastChecked: new Date(),
            incidents: 0
          },
          {
            name: 'Storage',
            status: 'operational',
            responseTime: 89,
            uptime: 99.7,
            lastChecked: new Date(),
            incidents: 1
          },
          {
            name: 'Email Service',
            status: 'degraded',
            responseTime: 340,
            uptime: 98.2,
            lastChecked: new Date(),
            incidents: 3
          }
        ],
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo salud del sistema:', error);
      throw error;
    }
  }
  
  // ======================
  // MÉTRICAS FINANCIERAS
  // ======================
  
  async getFinancialMetrics(): Promise<FinancialMetrics> {
    try {
      // TODO: Implementar cálculos reales de métricas financieras
      // Por ahora, devolver datos simulados basados en subscripciones
      const subscriptionsSnap = await getDocs(collection(db, 'subscriptions'));
      
      let todayRevenue = 0;
      let monthRevenue = 0;
      let yearRevenue = 0;
      
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      
      subscriptionsSnap.docs.forEach(doc => {
        const subscription = doc.data();
        if (subscription.status === 'active') {
          const amount = subscription.plan?.pricing?.amount || 0;
          
          // Simular ingresos diarios/mensuales
          if (subscription.plan?.pricing?.interval === 'monthly') {
            monthRevenue += amount;
            yearRevenue += amount;
            todayRevenue += amount / 30; // Aproximación diaria
          }
        }
      });
      
      return {
        revenue: {
          today: todayRevenue,
          thisWeek: todayRevenue * 7,
          thisMonth: monthRevenue,
          thisYear: yearRevenue
        },
        subscriptions: {
          new: 5,  // TODO: Calcular reales
          cancelled: 2,
          upgraded: 3,
          downgraded: 1
        },
        churn: {
          rate: 2.5,  // TODO: Calcular real
          gross: 8,
          net: 6
        },
        growth: {
          mrr: 15.2,  // TODO: Calcular real
          arr: 18.7,
          userBase: 12.3
        },
        forecasting: {
          nextMonthRevenue: monthRevenue * 1.15,
          nextQuarterRevenue: monthRevenue * 3.2,
          yearEndRevenue: yearRevenue * 1.8
        }
      };
    } catch (error) {
      console.error('Error obteniendo métricas financieras:', error);
      throw error;
    }
  }
  
  // ======================
  // VENTANAS DE MANTENIMIENTO
  // ======================
  
  async getMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    try {
      const q = query(
        collection(db, this.maintenanceCollection),
        orderBy('startTime', 'desc')
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        notificationTime: doc.data().notificationTime?.toDate()
      })) as MaintenanceWindow[];
    } catch (error) {
      console.error('Error obteniendo ventanas de mantenimiento:', error);
      throw error;
    }
  }
  
  async createMaintenanceWindow(data: CreateMaintenanceWindowInput): Promise<MaintenanceWindow> {
    try {
      const docRef = await addDoc(collection(db, this.maintenanceCollection), {
        ...data,
        status: 'scheduled',
        notificationSent: false,
        startTime: Timestamp.fromDate(data.startTime),
        endTime: Timestamp.fromDate(data.endTime),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startTime: docSnap.data()?.startTime?.toDate(),
        endTime: docSnap.data()?.endTime?.toDate(),
        createdAt: docSnap.data()?.createdAt?.toDate(),
        updatedAt: docSnap.data()?.updatedAt?.toDate()
      } as MaintenanceWindow;
    } catch (error) {
      console.error('Error creando ventana de mantenimiento:', error);
      throw error;
    }
  }
  
  async updateMaintenanceWindow(id: string, updates: Partial<MaintenanceWindow>): Promise<MaintenanceWindow> {
    try {
      const docRef = doc(db, this.maintenanceCollection, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Convertir fechas a Timestamp si están presentes
      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }
      
      await updateDoc(docRef, updateData);
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startTime: docSnap.data()?.startTime?.toDate(),
        endTime: docSnap.data()?.endTime?.toDate(),
        createdAt: docSnap.data()?.createdAt?.toDate(),
        updatedAt: docSnap.data()?.updatedAt?.toDate()
      } as MaintenanceWindow;
    } catch (error) {
      console.error('Error actualizando ventana de mantenimiento:', error);
      throw error;
    }
  }
  
  // ======================
  // ANALYTICS DE PLATAFORMA
  // ======================
  
  async getPlatformAnalytics(query: PlatformAnalyticsQuery): Promise<PlatformAnalyticsResult> {
    try {
      // TODO: Implementar analytics reales con agregaciones por fecha
      // Por ahora, devolver datos simulados
      const result: PlatformAnalyticsResult = {
        query,
        data: [],
        summary: {
          total: {},
          average: {},
          growth: {}
        },
        generatedAt: new Date()
      };
      
      // Generar datos simulados para el rango de fechas
      const startDate = new Date(query.dateRange.start);
      const endDate = new Date(query.dateRange.end);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const dataPoint: any = {
          date: date.toISOString().split('T')[0],
          metrics: {}
        };
        
        query.metrics.forEach((metric: string) => {
          // Generar valores simulados
          switch (metric) {
            case 'new_users':
              dataPoint.metrics[metric] = Math.floor(Math.random() * 20) + 5;
              break;
            case 'new_hotels':
              dataPoint.metrics[metric] = Math.floor(Math.random() * 5) + 1;
              break;
            case 'revenue':
              dataPoint.metrics[metric] = Math.floor(Math.random() * 5000) + 1000;
              break;
            case 'active_subscriptions':
              dataPoint.metrics[metric] = Math.floor(Math.random() * 50) + 100;
              break;
            default:
              dataPoint.metrics[metric] = Math.floor(Math.random() * 100);
          }
        });
        
        result.data.push(dataPoint);
      }
      
      // Calcular resúmenes
      query.metrics.forEach(metric => {
        const values = result.data.map(d => d.metrics[metric]);
        result.summary.total[metric] = values.reduce((a, b) => a + b, 0);
        result.summary.average[metric] = result.summary.total[metric] / values.length;
        result.summary.growth[metric] = Math.random() * 20 - 10; // -10% a +10%
      });
      
      return result;
    } catch (error) {
      console.error('Error obteniendo analytics de plataforma:', error);
      throw error;
    }
  }
  
  // ======================
  // OPERACIONES BULK
  // ======================
  
  async bulkUpdateHotels(hotelIds: string[], updates: Partial<Hotel>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      hotelIds.forEach(hotelId => {
        const hotelRef = doc(db, 'hotels', hotelId);
        batch.update(hotelRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      
      // Registrar actividad
      await this.logActivity({
        type: 'hotel_updated',
        description: `Actualización masiva de ${hotelIds.length} hoteles`,
        entityType: 'hotel',
        entityId: hotelIds.join(','),
        entityName: `${hotelIds.length} hoteles`,
        severity: 'info',
        metadata: { updates, hotelIds }
      });
    } catch (error) {
      console.error('Error en actualización masiva de hoteles:', error);
      throw error;
    }
  }
  
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      userIds.forEach(userId => {
        const userRef = doc(db, 'platform_users', userId);
        batch.update(userRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      
      // Registrar actividad
      await this.logActivity({
        type: 'user_updated',
        description: `Actualización masiva de ${userIds.length} usuarios`,
        entityType: 'user',
        entityId: userIds.join(','),
        entityName: `${userIds.length} usuarios`,
        severity: 'info',
        metadata: { updates, userIds }
      });
    } catch (error) {
      console.error('Error en actualización masiva de usuarios:', error);
      throw error;
    }
  }
}

export const platformService = new PlatformService();