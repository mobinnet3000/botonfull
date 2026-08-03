import type { Role } from '../types';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'مدیر سیستم',
  lab_manager: 'مدیر آزمایشگاه',
  quality_manager: 'مدیر کنترل کیفیت',
  engineer: 'مهندس',
  technician: 'تکنسین',
  reception: 'پذیرش',
  client: 'مشتری',
  readonly: 'فقط‌خواندنی',
  factory_manager: 'مدیر کارخانه',
  supervisor: 'ناظر',
};

export const WRITE_ROLES: Record<string, Role[]> = {
  projects: ['admin', 'lab_manager'],
  samples: ['admin', 'lab_manager', 'technician', 'reception'],
  clients: ['admin', 'lab_manager', 'reception'],
  factories: ['admin', 'factory_manager'],
  requests: ['admin', 'lab_manager', 'engineer', 'reception'],
  tests: ['admin', 'lab_manager', 'technician', 'quality_manager'],
  equipment: ['admin', 'lab_manager'],
  curing: ['admin', 'lab_manager', 'technician'],
  reports: ['admin', 'lab_manager', 'engineer', 'quality_manager'],
  criteria: ['admin', 'lab_manager', 'quality_manager'],
  users: ['admin'],
  catalog: ['admin', 'lab_manager', 'quality_manager'],
  files: ['admin', 'lab_manager', 'technician', 'reception', 'engineer'],
  activity: ['admin'],
};

export function canWrite(role: Role | undefined, resource: keyof typeof WRITE_ROLES): boolean {
  if (!role) return false;
  return WRITE_ROLES[resource]?.includes(role) ?? false;
}

export function canAccess(role: Role | undefined, resource: string): boolean {
  if (!role) return false;
  if (resource === 'users' || resource === 'activity') return role === 'admin';
  if (resource === 'factories') return ['lab_manager', 'factory_manager'].includes(role);
  if (resource === 'clients') return ['lab_manager', 'reception', 'client'].includes(role);
  return true;
}