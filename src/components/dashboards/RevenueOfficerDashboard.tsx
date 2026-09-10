import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application, ParcelModel } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

interface RevenueOfficerDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const RevenueOfficerDashboard: React.FC<RevenueOfficerDashboardProps> = ({
  applications,
  onSelectApplication,
  onNavigate,
  onRefresh,
}) => {
  const { user, authHeaders } = useLanguage ? useAuth() : { user: null, authHeaders: {} };
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAppForClearance, setSelectedAppForClearance] = useState<string | null>(null);
  const [clearanceRemarks, setClearanceRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    const matchSearch =
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.surveyNumber.includes(searchTerm) ||
      app.pattaNumber.includes(searchTerm) ||
      app.village.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'ALL') return matchSearch;
    return matchSearch && app.status === statusFilter;
  });

  const pendingCount = applications.filter((a) => a.status === 'Review Required' || a.status === 'IN REVIEW').length;
  const discrepancyCount = applications.filter((a) => a.screeningState === 'Discrepancy detected').length;
  const fieldRequiredCount = applications.filter((a) => a.status === 'Field Verification Assigned' || a.screeningState === 'Field verification required').length;
  const clearedCount = applications.filter((a) => a.departmentClearances?.Revenue?.status === 'Verified' || a.status === 'DEPARTMENT VERIFIED').length;

  const handleGrantRevenueClearance = async (appId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/department-clearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          department: 'Revenue',
          status: 'Verified',
          remarks: clearanceRemarks || 'Revenue records, Patta #891, and A-Register verified consistent.',
        }),
      });
      if (res.ok) {
        setMessage('Revenue Department clearance successfully verified and forwarded.');
        setSelectedAppForClearance(null);
        setClearanceRemarks('');
        onRefresh();
      } else {
        const data = await res.json();
        setMessage(`Clearance failed: ${data.message || data.error}`);
      }
    } catch (err: any) {
      setMessage(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Welcome Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-800 text-emerald-200 border border-emerald-700">
                Revenue Administration • வருவாய்த் துறை
              </span>
              <span className="text-xs text-emerald-300 font-mono">Jurisdiction: Coimbatore South</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              வருவாய் அலுவலர் பணிமேடை • Revenue Officer Dashboard
            </h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-2xl leading-relaxed">
              Officer: <span className="font-semibold text-white">{user?.name || 'K. Rajasekaran, DRO'}</span> | Operational focus on Patta/Chitta reconciliation, A-Register title records, mutation validation, and cross-departmental evidence screening.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('application_new')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <span>+ New Intake</span>
            </button>
            <button
              onClick={() => onNavigate('maps_workspace')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 flex items-center space-x-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Viewer</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pendingCount}</div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Patta / Mutation Queue</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Discrepancy Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{discrepancyCount}</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Ownership / Extent Mismatches</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Field Inspections</span>
            <MapPin className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">{fieldRequiredCount}</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Survey Verification Assigned</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenue Cleared</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{clearedCount}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Department Verified</span>
        </div>
      </div>

      {/* AI Role Intelligence */}
      <RoleAIInsights />

      {/* Revenue Verification Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Revenue Verification & Mutation Cases • நில ஆவண ஆய்வு வரிசை</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statutory verification of Patta, Chitta, A-Register, and Village Account records.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search survey, patta, applicant..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Review Required">Review Required</option>
              <option value="Field Verification Assigned">Field Verification Assigned</option>
              <option value="DEPARTMENT VERIFIED">Department Verified</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID & Applicant</th>
                <th className="px-4 py-3">Parcel Identifiers</th>
                <th className="px-4 py-3">Type & Village</th>
                <th className="px-4 py-3">AI Screening State</th>
                <th className="px-4 py-3">Revenue Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No matching revenue cases found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isRevenueCleared = app.departmentClearances?.Revenue?.status === 'Verified';
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{app.applicationNumber}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{app.applicantName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          Sy. {app.surveyNumber}/{app.subdivision}
                        </div>
                        <div className="text-[11px] text-slate-400">Patta: {app.pattaNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{app.applicationType}</div>
                        <div className="text-[11px] text-slate-400">{app.village}, {app.taluk}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.screeningState === 'Discrepancy detected'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : app.screeningState === 'Field verification required'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {app.screeningState}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isRevenueCleared ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Revenue Cleared</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending DRO Action</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!isRevenueCleared && (
                            <button
                              onClick={() => setSelectedAppForClearance(app.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                            >
                              Clear & Forward
                            </button>
                          )}
                          <button
                            onClick={() => onSelectApplication(app.id)}
                            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Open in Workspace"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Clearance Modal */}
      {selectedAppForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grant Revenue Clearance • வருவாய்த் துறை ஒப்புதல்
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Case ID: <span className="font-mono font-semibold">{selectedAppForClearance}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                DRO Statutory Verification Remarks
              </label>
              <textarea
                value={clearanceRemarks}
                onChange={(e) => setClearanceRemarks(e.target.value)}
                placeholder="Enter statutory verification findings regarding Patta, Chitta, and A-Register concordance..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedAppForClearance(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGrantRevenueClearance(selectedAppForClearance)}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Revenue Clearance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
