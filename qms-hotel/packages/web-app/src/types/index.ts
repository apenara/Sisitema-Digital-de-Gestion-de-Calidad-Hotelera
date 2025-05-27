export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  hotelId?: string;
  departmentIds?: string[];
  isActive: boolean;
  permissions?: Record<string, boolean>;
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
}; 