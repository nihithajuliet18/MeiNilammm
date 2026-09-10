import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  FileCheck,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileText,
  Layers,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RegistrationOfficerDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const RegistrationOfficerDashboard: React.FC<RegistrationOfficerDashboardProps> = ({
  applications,
  onSelectApplication,
  onNavigate,
  onRefresh,
}) => {
  const { user, authHeaders } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppForClearance, setSelectedAppForClearance] = useState<string | null>(null);
  const [clearanceRemarks, setClearanceRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredApps = applications.filter(
    (a) =>
      a.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.surveyNumber.includes(searchTerm)
  );

  const handleGrantRegistrationClearance = async (appId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/department-clearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          department: 'Registration',
          status: 'Verified',
          remarks: clearanceRemarks || 'Sale Deed Doc #2024/1892 & 30-Year Encumbrance Certificate verified clean.',
        }),
      });
      if (res.ok) {
        setMessage('Registration clearance verified and recorded in state ledger.');
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
      {/* Officer Header */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-900 text-indigo-200 border border-indigo-700">
                Registration Department • பதிவுத் துறை
              </span>
              <span className="text-xs text-indigo-300 font-mono">Sub-Registrar Office: Coimbatore South</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              பத்திரப் பதிவு அலுவலர் பணிமேடை • Registration Officer Dashboard
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Officer: <span className="font-semibold text-white">{user?.name || 'M. Selvaraj, SRO'}</span> | Operational focus on registered deeds, 30-year Encumbrance Certificates (EC), executant-claimant title continuity, guideline valuation, and duplicate transaction fraud prevention.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('documents_review')}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Verify Sale Deeds & EC</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">EC Verification Queue</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">8</div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">30-Year Search Pending</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Title Chain Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">14</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Devolution Clear</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fraud / Duplicate Alerts</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">1</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Competing Prior Filing Flagged</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Guideline Concordance</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">100%</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Stamp Duty Adhered</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Deeds Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Registered Deeds & Encumbrance Queue • பத்திர சரிபார்ப்பு வரிசை</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registration verification across registered sale deeds, EC records, and prior devolution deeds.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deed, applicant, survey..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Executant / Claimant</th>
                <th className="px-4 py-3">Deed Reference</th>
                <th className="px-4 py-3">EC Status</th>
                <th className="px-4 py-3">Registration Clearance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const isCleared = app.departmentClearances?.Registration?.status === 'Verified';
                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.applicantName}</div>
                      <div className="text-[11px] text-slate-400">Sy. {app.surveyNumber}/{app.subdivision}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                      Doc #2024/{app.id.slice(-4)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        30-Yr Nil Encumbrance
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCleared ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SRO Cleared</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending SRO Action</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!isCleared && (
                          <button
                            onClick={() => setSelectedAppForClearance(app.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                          >
                            Verify & Clear
                          </button>
                        )}
                        <button
                          onClick={() => onSelectApplication(app.id)}
                          className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md"
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

      {/* SRO Clearance Modal */}
      {selectedAppForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grant Registration Clearance • பத்திரப் பதிவு ஒப்புதல்
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Case ID: <span className="font-mono font-semibold">{selectedAppForClearance}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Registrar (SRO) Verification Remarks
              </label>
              <textarea
                value={clearanceRemarks}
                onChange={(e) => setClearanceRemarks(e.target.value)}
                placeholder="Confirm title chain, absence of competing mortgages, and guideline value compliance..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
                onClick={() => handleGrantRegistrationClearance(selectedAppForClearance)}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Registration Clearance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
