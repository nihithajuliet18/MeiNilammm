import { Request, Response, NextFunction } from 'express';
import { UserRole, Department } from '../src/types';
import { ROLE_PERMISSIONS, Permission, hasPermission } from '../src/auth/permissions';
import { db } from './db';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userName?: string;
  userDepartment?: Department;
  userId?: string;
}

/**
 * Authentication Middleware:
 * Resolves user identity and institutional role from request headers.
 */
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Support both header-based auth and bearer token
  const roleHeader = (req.headers['x-user-role'] as UserRole) || 'revenue_officer';
  const nameHeader = (req.headers['x-user-name'] as string) || 'Authorized Officer';
  const deptHeader = (req.headers['x-user-dept'] as Department) || 'Revenue';
  const userIdHeader = (req.headers['x-user-id'] as string) || 'usr_rev_01';

  req.userRole = roleHeader;
  req.userName = nameHeader;
  req.userDepartment = deptHeader;
  req.userId = userIdHeader;

  next();
};

/**
 * RBAC Permission Guard Middleware:
 * Returns 403 Forbidden if the authenticated user's role lacks the required permission.
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.userRole || 'revenue_officer';
    if (!hasPermission(role, permission)) {
      // Log unauthorized access attempt in the immutable audit trail
      db.logAudit({
        actorName: req.userName || 'Unknown User',
        actorRole: role,
        actorDepartment: req.userDepartment || 'General Administration',
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        details: `Access to ${req.method} ${req.originalUrl} was blocked. Required permission: "${permission}", but role "${role}" is not authorized.`,
        ipAddress: req.ip,
      });

      return res.status(403).json({
        error: '403 Forbidden: Insufficient Institutional Permissions',
        message: `Your current role (${role}) does not possess the required permission: "${permission}".`,
        requiredPermission: permission,
        currentRole: role,
      });
    }
    next();
  };
};

/**
 * Role-Based Guard Middleware:
 * Explicitly checks if the user has one of the allowed roles.
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.userRole || 'revenue_officer';
    if (!allowedRoles.includes(role)) {
      db.logAudit({
        actorName: req.userName || 'Unknown User',
        actorRole: role,
        actorDepartment: req.userDepartment || 'General Administration',
        action: 'UNAUTHORIZED_ROLE_BLOCKED',
        details: `Access to ${req.method} ${req.originalUrl} blocked. Allowed roles: [${allowedRoles.join(', ')}], actual role: "${role}".`,
        ipAddress: req.ip,
      });

      return res.status(403).json({
        error: '403 Forbidden: Role Unauthorized',
        message: `This operation requires one of [${allowedRoles.join(', ')}]. You are logged in as "${role}".`,
        allowedRoles,
        currentRole: role,
      });
    }
    next();
  };
};
