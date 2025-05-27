export type UserRole = 'super_admin' | 'chain_admin' | 'hotel_admin' | 'user';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  chain_admin: 'Administrador de Cadena',
  hotel_admin: 'Administrador de Hotel',
  user: 'Usuario'
}; 