import { UserRole } from './Roles';
import { UserPermissions } from './Permissions';

export interface UserSecurity {
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  failedLoginAttempts: number;
  lastFailedLogin: Date | null;
  accountLocked: boolean;
  accountLockedUntil: Date | null;
  lastLoginAt: Date;
  lastLoginIP: string | null;
  lastLoginDevice: string | null;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  organizationId?: string;
  hotelId?: string;
  departmentIds: string[];
  isActive: boolean;
  permissions: UserPermissions;
  createdAt: Date;
  updatedAt: Date;
  invitedBy?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  security: UserSecurity;
} 