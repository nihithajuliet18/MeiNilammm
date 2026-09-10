import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application, Department } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Search,
  Eye,
  FileCheck2,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ReviewingAuthorityDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const ReviewingAuthorityDashboard: React.FC<ReviewingAuthorityDashboardProps> = ({
  applications,
  onSelectApplication,
  onNavigate,
  onRefresh,
}) => {
  const { user, authHeaders } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppForDecision, setSelectedAppForDecision] = useState<Application | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED' | 'CLARIFICATION REQUIRED' | 'FIELD VERIFICATION' | 'ESCALATED'>('APPROVED');
  const [decisionReason, setDecisionReason] = useState('');
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const departments: Department[] = [
    'Revenue',
    'Registration',
    'Survey and Land Records',
    'Town and Country Planning',
    'Public Works & Utilities',
  ];

  const handleDecisionSubmit = async () => {
    if (!selectedAppForDecision) return;
    if (!decisionReason.trim()) {
      alert('Statutory decision requires official justification notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${selectedAppForDecision.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          decision: decisionType,
          reason: decisionReason,
          conditions: conditions || undefined,
        }),
      });

      if (res.ok) {
        setMessage(`Statutory Order [${decisionType}] issued for case ${selectedAppForDecision.applicationNumber}.`);
        setSelectedAppForDecision(null);
        setDecisionReason('');
        setConditions('');
        onRefresh();
      } else {
        const data = await res.json();
        setMessage(`Decision failed: ${data.message || data.error}`);
      }
    } catch (err: any) {
      setMessage(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApps = applications.filter(
    (a) =>
      a.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.surveyNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Supervisory Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border-b-4 border-amber-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Statutory Appellate Authority • மாவட்ட ஆட்சியர் / மேல்முறையீட்டு அதிகாரம்
              </span>
              <span className="text-xs text-slate-400 font-mono">Appellate Jurisdiction: Coimbatore District</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              ஆய்வு அதிகாரி கட்டளை மேடை • Reviewing Authority Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Presiding: <span className="font-semibold text-white">{user?.name || 'Dr. R. Meenakshi Sundaram, IAS'}</span> | Consolidated multi-departmental adjudication across Revenue, Registration, Cadastral Survey, DTCP, and TANGEDCO with statutory order issuance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('reports_audit')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>District Audit Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* District Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Cases Active</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{applications.length}</div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Across 5 Departments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">High Risk Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {applications.filter((a) => a.screeningState === 'Discrepancy detected').length}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Requiring Officer Determination</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Disposal Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">4.2 Days</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Citizen SLA: &lt; 7 Days</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Final Orders Issued</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {applications.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED').length}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Statutory Adjudications</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Cross-Department Multi-Evidence Adjudication Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Unified 5-Department Clearance Matrix • துறைசார் ஒப்புதல் அணி</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidated view of clearances across Revenue, Registration, Survey, Municipal, and Utilities.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case, applicant, survey..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Parcel Identifiers</th>
                <th className="px-4 py-3 text-center">Revenue</th>
                <th className="px-4 py-3 text-center">Registration</th>
                <th className="px-4 py-3 text-center">Survey</th>
                <th className="px-4 py-3 text-center">Municipal</th>
                <th className="px-4 py-3 text-center">Utility</th>
                <th className="px-4 py-3">Statutory Determination</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const clearances = app.departmentClearances || {};
                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      <div>{app.applicationNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{app.applicantName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                        Sy. {app.surveyNumber}/{app.subdivision}
                      </div>
                      <div className="text-[10px] text-slate-400">{app.village}</div>
                    </td>

                    {/* 5 Department Status Pills */}
                    {departments.map((dept) => {
                      const clear = clearances[dept];
                      const isOk = clear?.status === 'Verified';
                      return (
                        <td key={dept} className="px-2 py-3 text-center">
                          {isOk ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Pending
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedAppForDecision(app)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white rounded-md transition-colors shadow-xs"
                        >
                          Adjudicate
                        </button>
                        <button
                          onClick={() => onSelectApplication(app.id)}
                          className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjudication Decision Modal */}
      {selectedAppForDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Statutory Order Determination • அதிகாரப்பூர்வ தீர்ப்பு ஆணை
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Case: <span className="font-mono font-semibold">{selectedAppForDecision.applicationNumber}</span> (Sy. {selectedAppForDecision.surveyNumber}/{selectedAppForDecision.subdivision})
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForDecision(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Statutory Determination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'APPROVED', label: 'Approve & Issue Patta', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400' },
                    { type: 'REJECTED', label: 'Reject Application', color: 'border-rose-500 text-rose-700 dark:text-rose-400' },
                    { type: 'CLARIFICATION REQUIRED', label: 'Seek Clarification', color: 'border-amber-500 text-amber-700 dark:text-amber-400' },
                    { type: 'FIELD VERIFICATION', label: 'Order Field Survey', color: 'border-sky-500 text-sky-700 dark:text-sky-400' },
                    { type: 'ESCALATED', label: 'Escalate to Tribunal', color: 'border-purple-500 text-purple-700 dark:text-purple-400' },
                  ].map((btn) => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => setDecisionType(btn.type as any)}
                      className={`p-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                        decisionType === btn.type
                          ? `${btn.color} bg-slate-50 dark:bg-slate-800 ring-2 ring-amber-500`
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Statutory Reason & Adjudication Grounds (Required)
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="State the statutory justification based on verified revenue records, FMB survey reports, or legal encumbrance continuity..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Statutory Conditions / Provisos (Optional)
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="E.g., Subject to physical boundary wall realignment within 30 days."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedAppForDecision(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDecisionSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Signing Order...' : `Sign & Execute: ${decisionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
