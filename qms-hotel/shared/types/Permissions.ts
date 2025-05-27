export interface UserPermissions {
  // Permisos de hotel
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
  
  // Permisos multi-tenant
  'platform:manage': boolean;
  'organizations:manage': boolean;
  'organizations:view': boolean;
  'hotels:manage': boolean;
  'hotels:create': boolean;
  'hotels:view': boolean;
  'subscriptions:manage': boolean;
  'subscriptions:view': boolean;
  'analytics:global': boolean;
  'analytics:organization': boolean;
  'analytics:hotel': boolean;
}

export const ROLE_PERMISSIONS: Record<string, (keyof UserPermissions)[]> = {
  super_admin: [
    // Todos los permisos
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
    'audits:manage',
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
    'analytics:hotel'
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
    'audits:manage',
    'analytics:hotel'
  ],
  
  user: [
    // Permisos básicos
    'documents:read',
    'nc:view',
    'reports:view',
    'audits:view'
  ]
}; 