import { Role } from '../types';

const roleHierarchy: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.FREE]: 1,
  [Role.PRO]: 2,
  [Role.NGO_PARTNER]: 3,
  [Role.NGO_GOLD]: 4,
  [Role.INVESTOR]: 4,
  [Role.PA]: 5,
  [Role.MANAGER]: 6,
  [Role.DEVELOPER]: 7,
  [Role.ADMIN]: 8,
  [Role.CHIEF_OFFICER]: 9,
  [Role.FOUNDER]: 10
};

export function canAccess(userRole: Role, requiredRole: Role): boolean {
  if (!roleHierarchy[userRole] && roleHierarchy[userRole] !== 0) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
