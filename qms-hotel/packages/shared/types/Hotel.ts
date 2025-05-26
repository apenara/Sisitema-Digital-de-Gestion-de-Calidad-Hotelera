export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: 'es' | 'en';
    logo?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  departments: Department[];
  isActive: boolean;
  subscriptionPlan: 'basic' | 'standard' | 'premium';
  subscriptionExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHotelData {
  name: string;
  description?: string;
  address: Hotel['address'];
  contact: Hotel['contact'];
  settings: Partial<Hotel['settings']>;
  departments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateHotelData {
  name?: string;
  description?: string;
  address?: Partial<Hotel['address']>;
  contact?: Partial<Hotel['contact']>;
  settings?: Partial<Hotel['settings']>;
  isActive?: boolean;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes?: string[];
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  code?: string;
  managerId?: string;
  parentDepartmentId?: string;
  processes?: string[];
  isActive?: boolean;
}