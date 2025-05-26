// Nueva jerarquía multi-tenant: super_admin > chain_admin > hotel_admin > quality_manager > department_manager > employee
export type UserRole =
  | 'super_admin'           // Gestiona toda la plataforma
  | 'chain_admin'           // Gestiona una cadena de hoteles
  | 'hotel_admin'           // Gestiona un hotel específico (antes 'admin')
  | 'quality_manager'       // Actual rol sin cambios
  | 'department_manager'    // Sin cambios
  | 'employee';            // Sin cambios

// Mantener compatibilidad hacia atrás
export type LegacyUserRole = 'admin' | 'quality_manager' | 'department_manager' | 'employee';

export interface UserPermissions {
  // Permisos existentes de hotel
  'documents:read': boolean;
  'documents:write': boolean;
  'documents:delete': boolean;
  'nc:view': boolean;
  'nc:manage': boolean;
  'nc:close': boolean;
  'reports:view': boolean;
  'reports:generate': boolean;
  'users:manage': boolean;
  'settings:manage': boolean;
  'audits:view': boolean;
  'audits:manage': boolean;
  
  // Nuevos permisos multi-tenant
  'platform:manage': boolean;        // super_admin
  'organizations:manage': boolean;    // super_admin
  'organizations:view': boolean;      // super_admin, chain_admin
  'hotels:manage': boolean;           // super_admin, chain_admin
  'hotels:create': boolean;           // super_admin, chain_admin
  'hotels:view': boolean;             // super_admin, chain_admin, hotel_admin
  'subscriptions:manage': boolean;    // super_admin
  'subscriptions:view': boolean;      // super_admin, chain_admin
  'analytics:global': boolean;        // super_admin
  'analytics:organization': boolean;  // chain_admin
  'analytics:hotel': boolean;         // hotel_admin, quality_manager
}

export interface UserRoleConfig {
  role: UserRole;
  permissions: (keyof UserPermissions)[];
  departmentAccess?: string[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  
  // Contexto multi-tenant
  organizationId?: string;  // Para chain_admin y usuarios de organización
  hotelId?: string;         // Para hotel_admin y usuarios de hotel (opcional para super_admin)
  departmentIds: string[];  // Departamentos del hotel (vacío para super_admin y chain_admin)
  
  // Estado y permisos
  isActive: boolean;
  permissions: UserPermissions;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  invitedBy?: string;       // Usuario que invitó a este usuario
  
  // Configuración personal
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  
  // Contexto de acceso (calculado dinámicamente)
  accessContext?: UserAccessContext;
}

export interface UserAccessContext {
  // Hoteles a los que tiene acceso (array de IDs)
  accessibleHotels: string[];
  
  // Organizaciones a las que tiene acceso (array de IDs)
  accessibleOrganizations: string[];
  
  // Nivel de acceso más alto
  highestLevel: 'platform' | 'organization' | 'hotel' | 'department';
  
  // Permisos efectivos (calculados según contexto)
  effectivePermissions: UserPermissions;
}

export interface CreateUserData {
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  hotelId?: string;
  departmentIds: string[];
}

export interface UpdateUserData {
  displayName?: string;
  role?: UserRole;
  organizationId?: string;
  hotelId?: string;
  departmentIds?: string[];
  isActive?: boolean;
  permissions?: UserPermissions;
  preferences?: Partial<User['preferences']>;
}

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, (keyof UserPermissions)[]> = {
  super_admin: [
    // Todos los permisos de plataforma
    'platform:manage',
    'organizations:manage',
    'organizations:view',
    'hotels:manage',
    'hotels:create',
    'hotels:view',
    'subscriptions:manage',
    'subscriptions:view',
    'analytics:global',
    'analytics:organization',
    'analytics:hotel',
    
    // Todos los permisos de hotel
    'documents:read',
    'documents:write',
    'documents:delete',
    'nc:view',
    'nc:manage',
    'nc:close',
    'reports:view',
    'reports:generate',
    'users:manage',
    'settings:manage',
    'audits:view',
    'audits:manage'
  ],
  
  chain_admin: [
    // Permisos de organización
    'organizations:view',
    'hotels:manage',
    'hotels:create',
    'hotels:view',
    'subscriptions:view',
    'analytics:organization',
    'analytics:hotel',
    
    // Permisos de hotel
    'documents:read',
    'documents:write',
    'documents:delete',
    'nc:view',
    'nc:manage',
    'nc:close',
    'reports:view',
    'reports:generate',
    'users:manage',
    'settings:manage',
    'audits:view',
    'audits:manage'
  ],
  
  hotel_admin: [
    // Permisos de hotel (antes 'admin')
    'hotels:view',
    'analytics:hotel',
    'documents:read',
    'documents:write',
    'documents:delete',
    'nc:view',
    'nc:manage',
    'nc:close',
    'reports:view',
    'reports:generate',
    'users:manage',
    'settings:manage',
    'audits:view',
    'audits:manage'
  ],
  
  quality_manager: [
    // Sin cambios del rol original
    'analytics:hotel',
    'documents:read',
    'documents:write',
    'nc:view',
    'nc:manage',
    'nc:close',
    'reports:view',
    'reports:generate',
    'audits:view',
    'audits:manage'
  ],
  
  department_manager: [
    // Sin cambios del rol original
    'documents:read',
    'documents:write',
    'nc:view',
    'nc:manage',
    'reports:view',
    'audits:view'
  ],
  
  employee: [
    // Sin cambios del rol original
    'documents:read',
    'nc:view',
    'reports:view'
  ]
};

// Jerarquía de roles para verificación de permisos
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  chain_admin: 5,
  hotel_admin: 4,
  quality_manager: 3,
  department_manager: 2,
  employee: 1
};

// Utilidades para roles
export const getRoleLevel = (role: UserRole): number => ROLE_HIERARCHY[role];

export const hasHigherRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
};

export const hasEqualOrHigherRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole);
};

export const canManageUser = (managerRole: UserRole, targetRole: UserRole): boolean => {
  return hasHigherRole(managerRole, targetRole);
};

// Tipos para migración de datos legacy
export interface LegacyUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: LegacyUserRole;
  hotelId: string;
  departmentIds: string[];
  isActive: boolean;
  permissions: Partial<UserPermissions>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Función para migrar usuario legacy a nuevo formato
export const migrateLegacyUser = (legacyUser: LegacyUser): Omit<User, 'permissions' | 'accessContext'> => {
  // Convertir role 'admin' a 'hotel_admin'
  const newRole: UserRole = legacyUser.role === 'admin' ? 'hotel_admin' : legacyUser.role as UserRole;
  
  return {
    ...legacyUser,
    role: newRole,
    organizationId: undefined, // Los usuarios legacy no pertenecen a organizaciones
    hotelId: legacyUser.hotelId,
    invitedBy: undefined,
    preferences: {
      theme: 'system',
      language: 'es',
      notifications: {
        email: true,
        push: true,
        inApp: true
      }
    }
  };
};

// Tipos para invitaciones de usuarios
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  hotelId?: string;
  departmentIds: string[];
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  acceptedAt?: Date;
  message?: string;
}

export interface CreateInvitationData {
  email: string;
  role: UserRole;
  organizationId?: string;
  hotelId?: string;
  departmentIds: string[];
  message?: string;
  expiresInDays?: number;
}