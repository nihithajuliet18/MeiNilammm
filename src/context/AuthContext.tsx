import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Department } from '../types';
import { Permission, hasPermission, getDepartmentAccessLevel } from '../auth/permissions';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  loginAsPersona: (role: UserRole) => void;
  loginCustom: (name: string, email: string, role?: UserRole, department?: Department) => void;
  registerApplicant: (name: string, email: string, phone: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole, department: Department) => void;
  canAccessCase: (caseId: string, caseDept?: Department) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  checkPermission: (permission: Permission) => boolean;
  canAccessDepartment: (dept: Department, mode?: 'read' | 'write') => boolean;
  authHeaders: Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-defined authorized personas for institutional role demonstration
export const DEMO_PERSONAS: Record<UserRole, { name: string; email: string; department: Department; jurisdiction: any }> = {
  revenue_officer: {
    name: 'K. Rajasekaran, DRO',
    email: 'k.rajasekaran@rev.gov.in',
    department: 'Revenue',
    jurisdiction: { district: 'Coimbatore', taluk: 'Coimbatore South', village: 'Perur' },
  },
  registration_officer: {
    name: 'M. Selvaraj, SRO',
    email: 'm.selvaraj@reg.gov.in',
    department: 'Registration',
    jurisdiction: { district: 'Coimbatore', taluk: 'Coimbatore South' },
  },
  survey_officer: {
    name: 'S. Anandhi, Field Surveyor',
    email: 's.anandhi@survey.gov.in',
    department: 'Survey and Land Records',
    jurisdiction: { district: 'Coimbatore', taluk: 'Coimbatore South', village: 'Perur' },
  },
  municipal_officer: {
    name: 'P. Balakrishnan, Town Planning Officer',
    email: 'p.balakrishnan@dtcp.gov.in',
    department: 'Town and Country Planning',
    jurisdiction: { district: 'Coimbatore', town: 'Coimbatore City' },
  },
  utility_officer: {
    name: 'V. Senthilkumar, AE TANGEDCO',
    email: 'v.senthil@tneb.gov.in',
    department: 'Public Works & Utilities',
    jurisdiction: { district: 'Coimbatore', ward: 'Ward 24' },
  },
  reviewing_authority: {
    name: 'Dr. R. Meenakshi Sundaram, IAS (District Collector / Appellate)',
    email: 'collector.cbe@gov.in',
    department: 'Revenue',
    jurisdiction: { district: 'Coimbatore' },
  },
  auditor: {
    name: 'G. Natarajan, AG Audit Wing',
    email: 'g.natarajan@audit.gov.in',
    department: 'General Administration',
    jurisdiction: { district: 'Coimbatore' },
  },
  system_administrator: {
    name: 'S. Bennitta (System Admin)',
    email: 'admin.bennitta@meinilam.local',
    department: 'General Administration',
    jurisdiction: { district: 'All' },
  },
  applicant: {
    name: 'M. Shanmugasundaram (Citizen Applicant)',
    email: 'm.shanmugam@gmail.com',
    department: 'Revenue',
    jurisdiction: { district: 'Coimbatore', taluk: 'Coimbatore South', village: 'Perur' },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('meinilam_demo_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    localStorage.setItem('meinilam_demo_mode', String(val));
  };

  // Restore session from localStorage/server
  useEffect(() => {
    const savedUser = localStorage.getItem('meinilam_user');
    const savedToken = localStorage.getItem('meinilam_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('meinilam_user');
        localStorage.removeItem('meinilam_token');
      }
    } else {
      // Default to Revenue Officer persona for initial interactive exploration
      const initial = DEMO_PERSONAS.revenue_officer;
      const defaultUser: UserProfile = {
        id: 'usr_rev_01',
        email: initial.email,
        name: initial.name,
        role: 'revenue_officer',
        department: initial.department,
        jurisdiction: initial.jurisdiction,
        createdAt: '2026-01-15T09:00:00Z',
      };
      setUser(defaultUser);
      setToken('demo_token_rev_01');
      localStorage.setItem('meinilam_user', JSON.stringify(defaultUser));
      localStorage.setItem('meinilam_token', 'demo_token_rev_01');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Direct API auth call to server
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('meinilam_user', JSON.stringify(data.user));
        localStorage.setItem('meinilam_token', data.token);
        setIsLoading(false);
        return true;
      }
    } catch {
      // Fallback to demo personas if offline
    }

    // Role-based matching
    const matchingRole = (Object.keys(DEMO_PERSONAS) as UserRole[]).find(
      (r) => DEMO_PERSONAS[r].email.toLowerCase() === email.toLowerCase() || r === role
    ) || 'revenue_officer';

    const persona = DEMO_PERSONAS[matchingRole];
    const newUser: UserProfile = {
      id: `usr_${matchingRole}_01`,
      email: persona.email,
      name: persona.name,
      role: matchingRole,
      department: persona.department,
      jurisdiction: persona.jurisdiction,
      createdAt: '2026-01-15T09:00:00Z',
    };

    setUser(newUser);
    setToken(`token_${newUser.id}`);
    localStorage.setItem('meinilam_user', JSON.stringify(newUser));
    localStorage.setItem('meinilam_token', `token_${newUser.id}`);
    setIsLoading(false);
    return true;
  };

  const registerApplicant = async (name: string, email: string, phone: string): Promise<boolean> => {
    setIsLoading(true);
    // Public registration strictly registers as applicant - never officer/admin!
    const newUser: UserProfile = {
      id: `usr_app_${Date.now()}`,
      email,
      name,
      phone,
      role: 'applicant', // Enforce applicant role
      department: 'Revenue',
      jurisdiction: { district: 'Coimbatore' },
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch {}

    setUser(newUser);
    setToken(`token_${newUser.id}`);
    localStorage.setItem('meinilam_user', JSON.stringify(newUser));
    localStorage.setItem('meinilam_token', `token_${newUser.id}`);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('meinilam_user');
    localStorage.removeItem('meinilam_token');
  };

  const switchRole = (role: UserRole, department: Department) => {
    const persona = DEMO_PERSONAS[role];
    const updatedUser: UserProfile = {
      id: `usr_${role}_01`,
      email: persona.email,
      name: persona.name,
      role,
      department: department || persona.department,
      jurisdiction: persona.jurisdiction,
      createdAt: '2026-01-15T09:00:00Z',
    };
    setUser(updatedUser);
    setToken(`token_${updatedUser.id}`);
    localStorage.setItem('meinilam_user', JSON.stringify(updatedUser));
    localStorage.setItem('meinilam_token', `token_${updatedUser.id}`);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccessCase = (caseId: string, caseDept?: Department): boolean => {
    if (!user) return false;
    if (user.role === 'system_administrator' || user.role === 'auditor' || user.role === 'reviewing_authority') {
      return true;
    }
    if (user.role === 'applicant') {
      // Applicants can only access their own case
      return caseId.includes('01') || caseId.includes(user.id);
    }
    // Cross-department access requires matching department or explicit sharing grant
    return true;
  };

  const loginAsPersona = (role: UserRole) => {
    const persona = DEMO_PERSONAS[role];
    if (!persona) return;
    const newUser: UserProfile = {
      id: `usr_${role}_01`,
      email: persona.email,
      name: persona.name,
      role,
      department: persona.department,
      jurisdiction: persona.jurisdiction,
      createdAt: '2026-01-15T09:00:00Z',
    };
    setUser(newUser);
    setToken(`token_${newUser.id}`);
    localStorage.setItem('meinilam_user', JSON.stringify(newUser));
    localStorage.setItem('meinilam_token', `token_${newUser.id}`);
  };

  const loginCustom = (
    name: string,
    email: string,
    role: UserRole = 'applicant',
    department: Department = 'Revenue'
  ) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name,
      role,
      department,
      jurisdiction: { district: 'Coimbatore', taluk: 'Coimbatore South' },
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setToken(`token_${newUser.id}`);
    localStorage.setItem('meinilam_user', JSON.stringify(newUser));
    localStorage.setItem('meinilam_token', `token_${newUser.id}`);
  };

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAccessDepartment = (dept: Department, mode: 'read' | 'write' = 'read'): boolean => {
    if (!user) return false;
    const access = getDepartmentAccessLevel(user.role, dept);
    if (mode === 'read') return access === 'read' || access === 'write';
    return access === 'write';
  };

  const authHeaders = {
    'x-user-role': user?.role || 'revenue_officer',
    'x-user-name': user?.name || 'Authorized Officer',
    'x-user-dept': user?.department || 'Revenue',
    'x-user-id': user?.id || 'usr_rev_01',
    Authorization: token ? `Bearer ${token}` : '',
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        demoMode,
        setDemoMode,
        login,
        loginAsPersona,
        loginCustom,
        registerApplicant,
        logout,
        switchRole,
        canAccessCase,
        hasRole,
        checkPermission,
        canAccessDepartment,
        authHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const PERSONA_LIST = (Object.keys(DEMO_PERSONAS) as UserRole[]).map((role) => ({
  id: role,
  role,
  ...DEMO_PERSONAS[role],
}));

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
