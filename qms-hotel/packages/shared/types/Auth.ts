import type { User, UserRole } from './User';

// Generic Firebase User type (to avoid dependency on firebase/auth)
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  hotelId: string;
  departmentIds: string[];
}

export interface AuthError {
  code: string;
  message: string;
}

export interface FirebaseCustomClaims {
  role: UserRole;
  permissions: string[];
  hotelId: string;
  departmentIds?: string[];
}

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export interface ProtectedRouteProps {
  children: any; // React.ReactNode equivalent
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  fallback?: any; // React.ReactNode equivalent
}