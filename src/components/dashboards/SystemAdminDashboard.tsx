import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, Department } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  Settings,
  Users,
  ShieldCheck,
  Activity,
  Database,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Server,
} from 'lucide-react';

interface SystemAdminDashboardProps {
  onResetDemo: () => void;
  onNavigate: (view: any) => void;
}

export const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({
  onResetDemo,
  onNavigate,
}) => {
  const { user, authHeaders } = useAuth();
  const { t } = useLanguage();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'integrations' | 'system'>('users');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, hRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeaders }),
        fetch('/api/admin/system-health', { headers: authHeaders }),
      ]);
      if (uRes.ok) setUsersList(await uRes.json());
      if (hRes.ok) setSystemHealth(await hRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage(`User account status toggled to ${newStatus}.`);
        fetchAdminData();
      }
    } catch (err: any) {
      setMessage(`Operation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border-b-4 border-blue-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                System Administration • கணினி நிர்வாகக் கட்டளைப் பிரிவு
              </span>
              <span className="text-xs text-slate-400 font-mono">Platform Infrastructure & RBAC Engine</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              கணினி நிர்வாகி பணிமேடை • System Administrator Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Administrator: <span className="font-semibold text-white">{user?.name || 'S. Bennitta (System Admin)'}</span> | Technical administration: RBAC identity lifecycle, 9-role authorization matrices, Gemini 2.5 API health, GIS orthomosaic pipeline, and state database connectors.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (window.confirm('Reset all demonstration records and test cases to baseline seed state?')) {
                  onResetDemo();
                  setMessage('Demonstration data successfully reset to baseline.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Role Boundary Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl flex items-center space-x-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Technical Authority Only:</strong> The System Administrator manages identity provisioning, role assignments, and security configurations. Under statutory law, the administrator cannot adjudicate, approve, or reject land applications or alter cadastral boundary coordinates.
        </span>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">System Uptime</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">99.98%</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cloud Run Container Healthy</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Provisioned Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{usersList.length || 9}</div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">9 Distinct Roles Active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gemini 2.5 Flash</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">Online</div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Multimodal AI Engine</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">GIS Orthomosaic</span>
            <Server className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">EPSG:4326</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">5cm High-Res Drone ORI</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50 dark:bg-slate-800/40">
          {[
            { key: 'users', label: 'User Directory & Provisioning', icon: Users },
            { key: 'matrix', label: 'RBAC Permission Matrix', icon: ShieldCheck },
            { key: 'integrations', label: 'Government & AI Integrations', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Officer Name & ID</th>
                    <th className="px-4 py-3">Role Designation</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Jurisdiction</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {u.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.department}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {u.jurisdiction?.district || 'All Districts'}
                        {u.jurisdiction?.taluk ? ` • ${u.jurisdiction.taluk}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory granular permissions enforced across the API and frontend components for each of the 9 roles:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { role: 'Revenue Officer', permissions: ['case.read', 'revenue.verify', 'field.request', 'case.forward', 'evidence.share'] },
                  { role: 'Registration Officer', permissions: ['case.read', 'registration.verify', 'case.forward', 'evidence.share'] },
                  { role: 'Survey Officer', permissions: ['case.read', 'survey.edit', 'field.execute', 'case.forward', 'evidence.share'] },
                  { role: 'Municipal Officer', permissions: ['case.read', 'municipal.verify', 'case.forward', 'evidence.share'] },
                  { role: 'Utility Officer', permissions: ['case.read', 'utility.verify', 'case.forward', 'evidence.share'] },
                  { role: 'Reviewing Authority', permissions: ['case.read', 'case.approve', 'case.reject', 'case.escalate', 'audit.read'] },
                  { role: 'Auditor', permissions: ['case.read', 'audit.read', 'report.export'] },
                  { role: 'System Administrator', permissions: ['user.manage', 'role.assign', 'system.configure', 'demo.reset', 'audit.read'] },
                  { role: 'Applicant', permissions: ['case.read_own', 'case.create', 'doc.upload'] },
                ].map((item) => (
                  <div key={item.role} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">{item.role}</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.permissions.map((p) => (
                        <span key={p} className="text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Gemini 2.5 Multimodal API</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Server-side proxy configured. Used for real-time document OCR, 14-point Tamil document reasoning, and spatial discrepancy detection.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Tamil Nilam Central Registry Connector</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Live state land records interface for automated A-Register, Chitta, and Patta verification across Tamil Nadu taluks.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">STAR 2.0 Registration Sub-System</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Encumbrance Certificate (EC) 30-year search and registered sale deed indexing pipeline.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Drone ORI Tile Server</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  High-resolution 5cm GSD Orthomosaic and DSM/DTM elevation layers served via WMS/XYZ map endpoints.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
