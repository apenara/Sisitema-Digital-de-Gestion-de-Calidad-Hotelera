export type UserRole = 'admin' | 'quality_manager' | 'department_manager' | 'employee';

export interface UserPermissions {
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
  hotelId: string;
  departmentIds: string[];
  isActive: boolean;
  permissions: UserPermissions;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
}

export interface CreateUserData {
  email: string;
  displayName: string;
  role: UserRole;
  departmentIds: string[];
  hotelId: string;
}

export interface UpdateUserData {
  displayName?: string;
  role?: UserRole;
  departmentIds?: string[];
  isActive?: boolean;
  permissions?: UserPermissions;
  preferences?: Partial<User['preferences']>;
}

// Role configurations
export const ROLE_PERMISSIONS: Record<UserRole, (keyof UserPermissions)[]> = {
  admin: [
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
    'documents:read',
    'documents:write',
    'nc:view',
    'nc:manage',
    'reports:view',
    'audits:view'
  ],
  employee: [
    'documents:read',
    'nc:view',
    'reports:view'
  ]
};