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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Hotel,
  User
} from '../../../shared/types';
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionLimits,
  SubscriptionUsage,
  SubscriptionStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionMetrics,
  SubscriptionEvent,
  SubscriptionEventType
} from '../../../shared/types/Subscription';
import { DEFAULT_PLANS } from '../../../shared/types/Subscription';

class SubscriptionService {
  private readonly subscriptionsCollection = 'subscriptions';
  private readonly plansCollection = 'subscription_plans';
  private readonly eventsCollection = 'subscription_events';
  private readonly usageCollection = 'subscription_usage';
  
  // ======================
  // GESTIÓN DE PLANES
  // ======================
  
  async createPlan(plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    try {
      const planData = {
        ...plan,
        isActive: true,
        isPublic: plan.isPublic ?? true
      };
      
      const docRef = await addDoc(collection(db, this.plansCollection), planData);
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error creando plan:', error);
      throw error;
    }
  }
  
  async getPlans(includeInactive: boolean = false): Promise<SubscriptionPlan[]> {
    try {
      let q = query(collection(db, this.plansCollection));
      
      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubscriptionPlan[];
    } catch (error) {
      console.error('Error obteniendo planes:', error);
      throw error;
    }
  }
  
  async getPlan(planId: string): Promise<SubscriptionPlan> {
    try {
      const docRef = doc(db, this.plansCollection, planId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Plan no encontrado');
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error obteniendo plan:', error);
      throw error;
    }
  }
  
  async updatePlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    try {
      const docRef = doc(db, this.plansCollection, planId);
      await updateDoc(docRef, updates);
      
      return await this.getPlan(planId);
    } catch (error) {
      console.error('Error actualizando plan:', error);
      throw error;
    }
  }
  
  async initializeDefaultPlans(): Promise<void> {
    try {
      const existingPlans = await this.getPlans(true);
      
      if (existingPlans.length === 0) {
        const batch = writeBatch(db);
        
        Object.entries(DEFAULT_PLANS).forEach(([key, planData]) => {
          const planRef = doc(collection(db, this.plansCollection));
          batch.set(planRef, {
            ...planData,
            id: key,
            isActive: true,
            isPublic: true
          });
        });
        
        await batch.commit();
        console.log('Planes por defecto inicializados');
      }
    } catch (error) {
      console.error('Error inicializando planes por defecto:', error);
      throw error;
    }
  }
  
  // ======================
  // GESTIÓN DE SUBSCRIPCIONES
  // ======================
  
  async createSubscription(data: CreateSubscriptionInput, createdBy: string): Promise<Subscription> {
    try {
      const plan = await this.getPlan(data.planId);
      
      const now = new Date();
      const trialDays = data.trialDays || plan.pricing.trialDays || 0;
      const trialEnd = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));
      
      const subscriptionData = {
        ...data,
        plan,
        status: trialDays > 0 ? 'trialing' as SubscriptionStatus : 'active' as SubscriptionStatus,
        startDate: Timestamp.fromDate(now),
        currentPeriodStart: Timestamp.fromDate(now),
        currentPeriodEnd: Timestamp.fromDate(trialDays > 0 ? trialEnd : 
          new Date(now.getTime() + (plan.pricing.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)),
        limits: plan.limits,
        usage: {
          currentUsers: 0,
          currentHotels: 0,
          currentDocuments: 0,
          currentStorage: 0,
          currentAPIRequests: 0,
          lastMonth: {
            apiRequests: 0,
            documentsCreated: 0,
            storageUsed: 0
          },
          lastCalculated: Timestamp.fromDate(now)
        },
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        createdBy
      };
      
      const docRef = await addDoc(collection(db, this.subscriptionsCollection), subscriptionData);
      
      // Registrar evento
      await this.logEvent(docRef.id, 'subscription_created', {
        planId: data.planId,
        trialDays,
        createdBy
      });
      
      const docSnap = await getDoc(docRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data()?.startDate?.toDate(),
        endDate: docSnap.data()?.endDate?.toDate(),
        currentPeriodStart: docSnap.data()?.currentPeriodStart?.toDate(),
        currentPeriodEnd: docSnap.data()?.currentPeriodEnd?.toDate(),
        createdAt: docSnap.data()?.createdAt?.toDate(),
        updatedAt: docSnap.data()?.updatedAt?.toDate(),
        usage: {
          ...docSnap.data()?.usage,
          lastCalculated: docSnap.data()?.usage?.lastCalculated?.toDate()
        }
      } as Subscription;
    } catch (error) {
      console.error('Error creando subscripción:', error);
      throw error;
    }
  }
  
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const docRef = doc(db, this.subscriptionsCollection, subscriptionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Subscripción no encontrada');
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        currentPeriodStart: data.currentPeriodStart?.toDate(),
        currentPeriodEnd: data.currentPeriodEnd?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        usage: {
          ...data.usage,
          lastCalculated: data.usage?.lastCalculated?.toDate()
        }
      } as Subscription;
    } catch (error) {
      console.error('Error obteniendo subscripción:', error);
      throw error;
    }
  }
  
  async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionInput): Promise<Subscription> {
    try {
      const docRef = doc(db, this.subscriptionsCollection, subscriptionId);
      
      let updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Si se cambia el plan, obtener los nuevos límites
      if (updates.planId) {
        const newPlan = await this.getPlan(updates.planId);
        updateData.plan = newPlan;
        updateData.limits = newPlan.limits;
        
        // Registrar evento de cambio de plan
        const currentSub = await this.getSubscription(subscriptionId);
        const eventType: SubscriptionEventType = 
          newPlan.pricing.amount > currentSub.plan.pricing.amount ? 
          'plan_upgraded' : 'plan_downgraded';
        
        await this.logEvent(subscriptionId, eventType, {
          oldPlanId: currentSub.plan.id,
          newPlanId: updates.planId
        });
      }
      
      await updateDoc(docRef, updateData);
      return await this.getSubscription(subscriptionId);
    } catch (error) {
      console.error('Error actualizando subscripción:', error);
      throw error;
    }
  }
  
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    try {
      const updates: UpdateSubscriptionInput = {
        status: 'canceled'
      };
      
      await this.logEvent(subscriptionId, 'subscription_canceled', { reason });
      return await this.updateSubscription(subscriptionId, updates);
    } catch (error) {
      console.error('Error cancelando subscripción:', error);
      throw error;
    }
  }
  
  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      
      if (subscription.status !== 'canceled') {
        throw new Error('Solo se pueden reactivar subscripciones canceladas');
      }
      
      const now = new Date();
      const intervalDays = subscription.plan.pricing.interval === 'yearly' ? 365 : 30;
      const newPeriodEnd = new Date(now.getTime() + (intervalDays * 24 * 60 * 60 * 1000));
      
      const docRef = doc(db, this.subscriptionsCollection, subscriptionId);
      await updateDoc(docRef, {
        status: 'active',
        currentPeriodStart: Timestamp.fromDate(now),
        currentPeriodEnd: Timestamp.fromDate(newPeriodEnd),
        updatedAt: Timestamp.now()
      });
      
      await this.logEvent(subscriptionId, 'subscription_created', { reactivated: true });
      return await this.getSubscription(subscriptionId);
    } catch (error) {
      console.error('Error reactivando subscripción:', error);
      throw error;
    }
  }
  
  // ======================
  // BÚSQUEDA Y FILTRADO
  // ======================
  
  async getSubscriptionsByOrganization(organizationId: string): Promise<Subscription[]> {
    try {
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          currentPeriodStart: data.currentPeriodStart?.toDate(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          usage: {
            ...data.usage,
            lastCalculated: data.usage?.lastCalculated?.toDate()
          }
        };
      }) as Subscription[];
    } catch (error) {
      console.error('Error obteniendo subscripciones por organización:', error);
      throw error;
    }
  }
  
  async getSubscriptionByHotel(hotelId: string): Promise<Subscription | null> {
    try {
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('hotelId', '==', hotelId),
        where('status', 'in', ['active', 'trialing']),
        limit(1)
      );
      
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) {
        return null;
      }
      
      const doc = querySnap.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        currentPeriodStart: data.currentPeriodStart?.toDate(),
        currentPeriodEnd: data.currentPeriodEnd?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        usage: {
          ...data.usage,
          lastCalculated: data.usage?.lastCalculated?.toDate()
        }
      } as Subscription;
    } catch (error) {
      console.error('Error obteniendo subscripción por hotel:', error);
      throw error;
    }
  }
  
  async getActiveSubscriptions(limitCount: number = 100): Promise<Subscription[]> {
    try {
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('status', 'in', ['active', 'trialing']),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          currentPeriodStart: data.currentPeriodStart?.toDate(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          usage: {
            ...data.usage,
            lastCalculated: data.usage?.lastCalculated?.toDate()
          }
        };
      }) as Subscription[];
    } catch (error) {
      console.error('Error obteniendo subscripciones activas:', error);
      throw error;
    }
  }
  
  // ======================
  // GESTIÓN DE USO
  // ======================
  
  async updateUsage(subscriptionId: string, usage: Partial<SubscriptionUsage>): Promise<void> {
    try {
      const docRef = doc(db, this.subscriptionsCollection, subscriptionId);
      await updateDoc(docRef, {
        'usage': {
          ...usage,
          lastCalculated: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando uso de subscripción:', error);
      throw error;
    }
  }
  
  async checkLimits(subscriptionId: string): Promise<{ exceeded: boolean; warnings: string[] }> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      const warnings: string[] = [];
      let exceeded = false;
      
      const { limits, usage } = subscription;
      
      // Verificar límites
      if (limits.maxUsers !== -1 && usage.currentUsers >= limits.maxUsers) {
        warnings.push('Límite de usuarios alcanzado');
        exceeded = true;
      }
      
      if (limits.maxHotels !== -1 && usage.currentHotels >= limits.maxHotels) {
        warnings.push('Límite de hoteles alcanzado');
        exceeded = true;
      }
      
      if (limits.maxDocuments !== -1 && usage.currentDocuments >= limits.maxDocuments) {
        warnings.push('Límite de documentos alcanzado');
        exceeded = true;
      }
      
      if (limits.maxStorage !== -1 && usage.currentStorage >= limits.maxStorage) {
        warnings.push('Límite de almacenamiento alcanzado');
        exceeded = true;
      }
      
      // Advertencias tempranas (80% del límite)
      if (limits.maxUsers !== -1 && usage.currentUsers >= limits.maxUsers * 0.8) {
        warnings.push('Próximo al límite de usuarios (80%)');
      }
      
      if (exceeded) {
        await this.logEvent(subscriptionId, 'usage_limit_exceeded', { warnings });
      }
      
      return { exceeded, warnings };
    } catch (error) {
      console.error('Error verificando límites:', error);
      return { exceeded: false, warnings: [] };
    }
  }
  
  async calculateUsageForSubscription(subscriptionId: string): Promise<SubscriptionUsage> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      
      // Obtener uso real desde las colecciones
      let currentUsers = 0;
      let currentHotels = 0;
      let currentDocuments = 0;
      let currentStorage = 0;
      
      if (subscription.organizationId) {
        // Para organizaciones, contar todos los hoteles y usuarios de la organización
        const hotelsQuery = query(
          collection(db, 'hotels'),
          where('organizationId', '==', subscription.organizationId)
        );
        const hotelsSnap = await getDocs(hotelsQuery);
        currentHotels = hotelsSnap.size;
        
        const usersQuery = query(
          collection(db, 'organization_users'),
          where('organizationId', '==', subscription.organizationId),
          where('status', '==', 'active')
        );
        const usersSnap = await getDocs(usersQuery);
        currentUsers = usersSnap.size;
        
      } else if (subscription.hotelId) {
        // Para hoteles individuales
        currentHotels = 1;
        
        const usersQuery = query(
          collection(db, 'users'),
          where('hotelId', '==', subscription.hotelId),
          where('isActive', '==', true)
        );
        const usersSnap = await getDocs(usersQuery);
        currentUsers = usersSnap.size;
      }
      
      // TODO: Calcular documentos y almacenamiento real
      // Por ahora usar valores simulados
      currentDocuments = Math.floor(Math.random() * 1000);
      currentStorage = Math.floor(Math.random() * 1024 * 1024 * 100); // 100MB max
      
      const usage: SubscriptionUsage = {
        currentUsers,
        currentHotels,
        currentDocuments,
        currentStorage,
        currentAPIRequests: subscription.usage.currentAPIRequests || 0,
        lastMonth: subscription.usage.lastMonth || {
          apiRequests: 0,
          documentsCreated: 0,
          storageUsed: 0
        },
        lastCalculated: new Date()
      };
      
      // Actualizar en la base de datos
      await this.updateUsage(subscriptionId, usage);
      
      return usage;
    } catch (error) {
      console.error('Error calculando uso de subscripción:', error);
      throw error;
    }
  }
  
  // ======================
  // EVENTOS
  // ======================
  
  async logEvent(subscriptionId: string, type: SubscriptionEventType, data: Record<string, any>): Promise<void> {
    try {
      await addDoc(collection(db, this.eventsCollection), {
        subscriptionId,
        type,
        data,
        createdAt: Timestamp.now(),
        processedAt: null
      });
    } catch (error) {
      console.error('Error registrando evento de subscripción:', error);
    }
  }
  
  async getSubscriptionEvents(subscriptionId: string, limitCount: number = 50): Promise<SubscriptionEvent[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where('subscriptionId', '==', subscriptionId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        processedAt: doc.data().processedAt?.toDate()
      })) as SubscriptionEvent[];
    } catch (error) {
      console.error('Error obteniendo eventos de subscripción:', error);
      throw error;
    }
  }
  
  // ======================
  // MÉTRICAS Y REPORTES
  // ======================
  
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const subscriptionsSnap = await getDocs(collection(db, this.subscriptionsCollection));
      
      const subscriptions = subscriptionsSnap.docs.map(doc => doc.data());
      
      // Calcular métricas básicas
      const totalRevenue = subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => sum + (sub.plan?.pricing?.amount || 0), 0);
      
      const planDistribution = subscriptions.reduce((acc, sub) => {
        const planType = sub.plan?.type || 'unknown';
        acc[planType] = (acc[planType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        subscriptionId: 'platform', // Para métricas globales
        planType: 'enterprise', // Placeholder
        revenue: {
          mrr: totalRevenue,
          arr: totalRevenue * 12,
          ltv: totalRevenue * 24 // Estimación simple
        },
        growth: {
          newSubscriptions: 0, // TODO: Calcular desde eventos
          cancellations: 0,
          upgrades: 0,
          downgrades: 0
        },
        usageMetrics: {
          utilizationRate: 75, // TODO: Calcular real
          activeUsers: subscriptions.length,
          featuresUsed: ['documentManagement', 'nonConformityTracking']
        },
        calculatedAt: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo métricas de subscripciones:', error);
      throw error;
    }
  }
  
  // ======================
  // UTILIDADES
  // ======================
  
  async processExpiringTrials(): Promise<void> {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('status', '==', 'trialing'),
        where('currentPeriodEnd', '<=', Timestamp.fromDate(tomorrow))
      );
      
      const querySnap = await getDocs(q);
      
      for (const docSnap of querySnap.docs) {
        const subscription = docSnap.data() as Subscription;
        
        if (subscription.currentPeriodEnd.getTime() <= now.getTime()) {
          // Trial expirado
          await updateDoc(docSnap.ref, {
            status: 'past_due',
            updatedAt: Timestamp.now()
          });
          
          await this.logEvent(docSnap.id, 'trial_ended', {});
        }
      }
    } catch (error) {
      console.error('Error procesando trials que expiran:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();