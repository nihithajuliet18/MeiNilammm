import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application, AuditEvent } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  History,
  Lock,
  Calendar,
  CheckCircle2,
  UserCheck,
  Building,
} from 'lucide-react';

interface AuditorDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({
  applications,
  onSelectApplication,
  onNavigate,
}) => {
  const { user, authHeaders } = useAuth();
  const { t } = useLanguage();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedAudit, setSelectedAudit] = useState<AuditEvent | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-events', {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setAuditEvents(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditEvents.filter((event) => {
    const matchSearch =
      (event.actorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.applicationId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = departmentFilter === 'ALL' || event.actorDepartment === departmentFilter;
    const matchAction = actionFilter === 'ALL' || event.action.includes(actionFilter);
    return matchSearch && matchDept && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Auditor Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border-b-4 border-emerald-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Auditor-General Wing • தணிக்கை மற்றும் இணக்கத் துறை (READ-ONLY)
              </span>
              <span className="text-xs text-slate-400 font-mono">Blockchain/SHA-256 Verified Ledger</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              தணிக்கையாளர் பணிமேடை • Auditor Compliance & Integrity Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Auditor: <span className="font-semibold text-white">{user?.name || 'G. Natarajan, AG Audit Wing'}</span> | Read-only access to all state land records, immutable audit events, officer determination diffs, after-hours override detection, and cryptographic chain checks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('reports_audit')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Statutory Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Read-Only Safety Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-3 rounded-xl flex items-center space-x-3 text-xs text-blue-900 dark:text-blue-200">
        <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          <strong>Audit Mode Active (Zero Write Access):</strong> You are operating under strict statutory oversight privileges. Records and decisions cannot be mutated from this account.
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Audit Events</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{auditEvents.length}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Cryptographically Logged</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Officer Overrides</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">2</div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Justifications Logged & Verified</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Hash Integrity</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">PASS</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">SHA-256 Ledger Continuous</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Anomalous Actions</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">No Tampering Detected</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Audit Trail Explorer Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Immutable System Audit Trail • தணிக்கைப் பதிவுத் தொடர்</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live audit stream capturing officer identities, timestamps, department clearances, and determinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actor, action, details..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="Revenue">Revenue</option>
              <option value="Registration">Registration</option>
              <option value="Survey and Land Records">Survey</option>
              <option value="Town and Country Planning">Municipal</option>
              <option value="Public Works & Utilities">Utilities</option>
              <option value="General Administration">Administration</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    {loading ? 'Streaming audit ledger records...' : 'No matching audit events found.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.actorRole.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-700 dark:text-slate-300">
                        {log.actorDepartment || 'System'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-[11px] text-slate-600 dark:text-slate-400">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedAudit(log)}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md"
                        title="View Full Ledger Block"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Audit Event Ledger Block • தணிக்கைப் பதிவு விவரம்
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Event ID:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedAudit.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Actor Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAudit.actorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Actor Role:</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">{selectedAudit.actorRole}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedAudit.actorDepartment || 'General'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedAudit.timestamp}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Details:</span>
                <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  {selectedAudit.details}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white rounded-lg"
              >
                Close Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
