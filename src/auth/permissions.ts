import { UserRole, Department } from '../types';

export type Permission =
  | 'parcel.read'
  | 'parcel.edit'
  | 'document.read'
  | 'document.upload'
  | 'document.verify'
  | 'survey.edit'
  | 'gis.edit'
  | 'registration.verify'
  | 'municipal.verify'
  | 'utility.verify'
  | 'case.review'
  | 'case.approve'
  | 'case.reject'
  | 'case.escalate'
  | 'audit.read'
  | 'user.manage'
  | 'role.manage'
  | 'system.configure';

/**
 * Complete RBAC Permission Matrix for all 9 Institutional and Citizen Roles
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // 1. Revenue Officer
  revenue_officer: [
    'parcel.read',
    'document.read',
    'document.upload',
    'document.verify',
    'case.review',
    'case.escalate',
    'audit.read',
  ],

  // 2. Registration Officer
  registration_officer: [
    'parcel.read',
    'document.read',
    'document.upload',
    'registration.verify',
    'case.review',
    'case.escalate',
    'audit.read',
  ],

  // 3. Survey Officer
  survey_officer: [
    'parcel.read',
    'parcel.edit',
    'document.read',
    'document.upload',
    'survey.edit',
    'gis.edit',
    'case.review',
    'case.escalate',
    'audit.read',
  ],

  // 4. Municipal Officer
  municipal_officer: [
    'parcel.read',
    'document.read',
    'document.upload',
    'municipal.verify',
    'case.review',
    'case.escalate',
    'audit.read',
  ],

  // 5. Utility Officer
  utility_officer: [
    'parcel.read',
    'document.read',
    'document.upload',
    'utility.verify',
    'case.review',
    'case.escalate',
    'audit.read',
  ],

  // 6. Reviewing Authority (District Collector / Appellate Authority)
  reviewing_authority: [
    'parcel.read',
    'document.read',
    'case.review',
    'case.approve',
    'case.reject',
    'case.escalate',
    'audit.read',
  ],

  // 7. Auditor (Predominantly READ-ONLY)
  auditor: [
    'parcel.read',
    'document.read',
    'audit.read',
  ],

  // 8. System Administrator (Platform & Technical Config - NO Land Decision Authority)
  system_administrator: [
    'audit.read',
    'user.manage',
    'role.manage',
    'system.configure',
  ],

  // 9. Applicant (Citizen Access - Restricted to own submissions)
  applicant: [
    'parcel.read',
    'document.read',
    'document.upload',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((p) => hasPermission(role, p));
};

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((p) => hasPermission(role, p));
};

/**
 * Cross-Department Access Rules:
 * Checks whether a role can view or modify records from a specific department.
 */
export const getDepartmentAccessLevel = (
  userRole: UserRole,
  department: Department
): 'none' | 'read' | 'write' => {
  if (userRole === 'system_administrator') {
    return department === 'General Administration' ? 'write' : 'read';
  }
  if (userRole === 'auditor') return 'read';
  if (userRole === 'reviewing_authority') return 'read';

  switch (department) {
    case 'Revenue':
      return userRole === 'revenue_officer' ? 'write' : 'read';
    case 'Registration':
      return userRole === 'registration_officer' ? 'write' : 'read';
    case 'Survey and Land Records':
      return userRole === 'survey_officer' ? 'write' : 'read';
    case 'Town and Country Planning':
      return userRole === 'municipal_officer' ? 'write' : 'read';
    case 'Public Works & Utilities':
      return userRole === 'utility_officer' ? 'write' : 'read';
    case 'General Administration':
      return 'none';
    default:
      return 'read';
  }
};
