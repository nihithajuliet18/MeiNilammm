import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  Zap,
  Droplet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  ShieldCheck,
  Layers,
  MapPin,
} from 'lucide-react';

interface UtilityOfficerDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const UtilityOfficerDashboard: React.FC<UtilityOfficerDashboardProps> = ({
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

  const handleGrantUtilityClearance = async (appId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/department-clearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          department: 'Public Works & Utilities',
          status: 'Verified',
          remarks: clearanceRemarks || 'TANGEDCO Electricity Service Connection & TWAD Pipeline Right-of-Way verified clear.',
        }),
      });
      if (res.ok) {
        setMessage('Public Works & Utilities clearance recorded.');
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
      <div className="bg-amber-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-900 text-amber-200 border border-amber-700">
                Public Works & Utilities • பொதுப்பணி மற்றும் பயன்பாட்டுத் துறை
              </span>
              <span className="text-xs text-amber-300 font-mono">TANGEDCO / TWAD: Coimbatore</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              பயன்பாட்டு அலுவலர் பணிமேடை • Utility Officer Dashboard
            </h1>
            <p className="text-xs text-amber-200 mt-1 max-w-2xl leading-relaxed">
              Officer: <span className="font-semibold text-white">{user?.name || 'V. Senthilkumar, AE TANGEDCO'}</span> | Verifying electricity service connections, smart meter geo-association, TWAD potable water pipelines, and High-Tension (HT) transmission corridor Right-of-Way (RoW) safety buffers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('maps_workspace')}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Utility GIS Layers</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">TANGEDCO Meters</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">100%</div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Smart Meter Linked</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">TWAD Water Supply</span>
            <Droplet className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">Active</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Supply Pipeline Verified</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">RoW Corridor Clear</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">0 Encroach</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">HT Line Buffer Preserved</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Clearances</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">5</div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Utility Verification Queue</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Utility Cases Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Service Connections & RoW Consents • பயன்பாட்டு இணைப்பு வரிசை</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Service connection authentication, smart meter coordinate verification, and pipeline RoW clearance.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case, meter, survey..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Applicant & Survey</th>
                <th className="px-4 py-3">TANGEDCO SC No.</th>
                <th className="px-4 py-3">TWAD Water Supply</th>
                <th className="px-4 py-3">Utility Clearance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const isCleared = app.departmentClearances?.['Public Works & Utilities']?.status === 'Verified';
                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.applicantName}</div>
                      <div className="text-[11px] text-slate-400">Sy. {app.surveyNumber}/{app.subdivision}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-700 dark:text-amber-300 font-semibold">
                      03-241-008-112
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">
                        Domestic Connection #4921
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCleared ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Utility Cleared</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending AE Endorsement</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!isCleared && (
                          <button
                            onClick={() => setSelectedAppForClearance(app.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                          >
                            Verify & Clear
                          </button>
                        )}
                        <button
                          onClick={() => onSelectApplication(app.id)}
                          className="p-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-md"
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

      {/* Utility Clearance Modal */}
      {selectedAppForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grant Utility Clearance • பயன்பாட்டுத் துறை ஒப்புதல்
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Case ID: <span className="font-mono font-semibold">{selectedAppForClearance}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assistant Engineer (TANGEDCO) Verification Remarks
              </label>
              <textarea
                value={clearanceRemarks}
                onChange={(e) => setClearanceRemarks(e.target.value)}
                placeholder="State confirmation of meter geo-location and absence of power/pipeline RoW infringements..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
                onClick={() => handleGrantUtilityClearance(selectedAppForClearance)}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Utility Clearance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
