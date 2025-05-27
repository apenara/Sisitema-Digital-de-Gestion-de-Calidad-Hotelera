import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { useBootstrap } from '../../hooks/useBootstrap';
import { SuperAdminSetup } from './SuperAdminSetup';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { loadSubscriptionPlans, initializeDefaultPlans } from '../../store/slices/subscriptionSlice';

interface BootstrapStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

const PlatformBootstrap: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isInitialized,
    superAdminCount,
    isLoading,
    error,
    checkInitialization,
    initializePlatform
  } = useBootstrap();
  
  const currentUser = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);

  // Verificar estado del bootstrap al cargar
  useEffect(() => {
    checkInitialization();
  }, [checkInitialization]);

  // Definir pasos del bootstrap
  const bootstrapSteps: BootstrapStep[] = [
    {
      id: 'super_admin',
      title: 'Configurar Super Administrador',
      description: 'Crear el primer usuario administrador de la plataforma',
      completed: superAdminCount > 0,
      required: true
    },
    {
      id: 'default_plans',
      title: 'Inicializar Planes de Subscripción',
      description: 'Crear los planes de subscripción por defecto',
      completed: false, // TODO: implementar verificación
      required: true
    },
    {
      id: 'platform_settings',
      title: 'Configuración de Plataforma',
      description: 'Configurar ajustes básicos del sistema',
      completed: false,
      required: false
    }
  ];

  const handleSuperAdminCreated = async () => {
    // Actualizar estado y continuar al siguiente paso
    await checkInitialization();
    setCurrentStep(1);
  };

  const handleInitializePlans = async () => {
    try {
      await dispatch(initializeDefaultPlans()).unwrap();
      await checkInitialization();
      setCurrentStep(2);
    } catch (error) {
      console.error('Error initializing plans:', error);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      // TODO: implementar completePlatformSetup
      setSetupComplete(true);
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  // Si ya está inicializado, no mostrar bootstrap
  if (isInitialized && !isLoading) {
    return null;
  }

  // Si el setup está completo, mostrar mensaje de éxito
  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                ¡Configuración Completa!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                QMS+Hotel ha sido configurado exitosamente. La plataforma está lista para usar.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/platform'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir al Dashboard de Plataforma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
                Verificando configuración...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
                Error de Configuración
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => checkInitialization()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Configuración Inicial de QMS+Hotel
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Configuremos tu plataforma multi-tenant paso a paso
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {bootstrapSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === index
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < bootstrapSteps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {bootstrapSteps[currentStep]?.title}
              </h3>
              <p className="text-sm text-gray-600">
                {bootstrapSteps[currentStep]?.description}
              </p>
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {currentStep === 0 && superAdminCount === 0 && (
              <SuperAdminSetup onSuccess={handleSuperAdminCreated} />
            )}

            {currentStep === 1 && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Inicializar Planes de Subscripción
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Vamos a crear los planes de subscripción por defecto (Gratuito, Básico, Premium, Enterprise)
                </p>
                <button
                  onClick={handleInitializePlans}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Crear Planes por Defecto
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Finalizar Configuración
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  La configuración básica está completa. ¿Deseas finalizar el setup?
                </p>
                <button
                  onClick={handleCompleteSetup}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Completar Configuración
                </button>
              </div>
            )}
          </div>

          {/* Skip option for non-required steps */}
          {currentStep > 1 && !bootstrapSteps[currentStep]?.required && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Omitir este paso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformBootstrap;