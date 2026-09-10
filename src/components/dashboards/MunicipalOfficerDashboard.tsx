import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  FileText,
  MapPin,
  Ruler,
  ShieldCheck,
} from 'lucide-react';

interface MunicipalOfficerDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const MunicipalOfficerDashboard: React.FC<MunicipalOfficerDashboardProps> = ({
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

  const handleGrantMunicipalClearance = async (appId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/department-clearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          department: 'Town and Country Planning',
          status: 'Verified',
          remarks: clearanceRemarks || 'DTCP Layout Approval, Property Tax Assessment, and Building Setbacks verified compliant.',
        }),
      });
      if (res.ok) {
        setMessage('Town & Country Planning municipal clearance successfully recorded.');
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
      <div className="bg-purple-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-900 text-purple-200 border border-purple-700">
                Town & Country Planning • நகர் ஊரமைப்புத் துறை
              </span>
              <span className="text-xs text-purple-300 font-mono">Coimbatore Municipal Corporation</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              நகராட்சி அலுவலர் பணிமேடை • Municipal Officer Dashboard
            </h1>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Officer: <span className="font-semibold text-white">{user?.name || 'P. Balakrishnan, Town Planning Officer'}</span> | Managing DTCP / CMDA layout sanctions, Building Plan approvals, property tax assessment PID linkages, master plan zoning compliance, and setback deviation audits.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('maps_workspace')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Inspect Building Footprints</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Planning Sanctions</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">6</div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Pending DTCP Review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PID Mapped</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">100%</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Corporation GIS ID Synchronized</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Setback Violations</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">1</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">1.2m Rear Setback Deficit</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Master Plan Zone</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">Residential Primary</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Mixed Use Permitted</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Municipal Cases Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Municipal Cases & Planning Consents • நகராட்சி அனுமதி வரிசை</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Property tax assessment, building permit concordance, and master plan setback compliance.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case, applicant, PID..."
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
                <th className="px-4 py-3">GIS Property ID (PID)</th>
                <th className="px-4 py-3">Building Permit</th>
                <th className="px-4 py-3">DTCP Clearance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const isCleared = app.departmentClearances?.['Town and Country Planning']?.status === 'Verified';
                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.applicantName}</div>
                      <div className="text-[11px] text-slate-400">Sy. {app.surveyNumber}/{app.subdivision}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-purple-700 dark:text-purple-300 font-semibold">
                      CBE-CORP-W12-B4-092
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        DTCP #BL-2023-441
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCleared ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>DTCP Cleared</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending DTCP Endorsement</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!isCleared && (
                          <button
                            onClick={() => setSelectedAppForClearance(app.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                          >
                            Verify & Clear
                          </button>
                        )}
                        <button
                          onClick={() => onSelectApplication(app.id)}
                          className="p-1 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-md"
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

      {/* Municipal Clearance Modal */}
      {selectedAppForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grant Municipal Clearance • நகராட்சி திட்ட ஒப்புதல்
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Case ID: <span className="font-mono font-semibold">{selectedAppForClearance}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Town Planning Officer (DTCP) Verification Remarks
              </label>
              <textarea
                value={clearanceRemarks}
                onChange={(e) => setClearanceRemarks(e.target.value)}
                placeholder="State confirmation of building plan layout, setback offsets, and property tax records..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
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
                onClick={() => handleGrantMunicipalClearance(selectedAppForClearance)}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Confirm DTCP Clearance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
