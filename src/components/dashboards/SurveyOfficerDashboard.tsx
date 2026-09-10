import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  Compass,
  MapPin,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit3,
  SplitSquareHorizontal,
  Maximize2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface SurveyOfficerDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
  onRefresh: () => void;
}

export const SurveyOfficerDashboard: React.FC<SurveyOfficerDashboardProps> = ({
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
  const [activeSplitTab, setActiveSplitTab] = useState<'cadastral' | 'drone' | 'both'>('both');

  const filteredApps = applications.filter(
    (a) =>
      a.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.surveyNumber.includes(searchTerm)
  );

  const handleGrantSurveyClearance = async (appId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/department-clearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          department: 'Survey and Land Records',
          status: 'Verified',
          remarks: clearanceRemarks || 'FMB field ladder, DGPS GCP points, and cadastral boundaries verified on ground.',
        }),
      });
      if (res.ok) {
        setMessage('Survey Department clearance recorded and forwarded.');
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
      <div className="bg-sky-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-900 text-sky-200 border border-sky-700">
                Survey & Land Records • நில அளவைத் துறை
              </span>
              <span className="text-xs text-sky-300 font-mono">DGPS / Drone Wing: Coimbatore</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              நில அளவர் பணிமேடை • Survey Officer Dashboard
            </h1>
            <p className="text-xs text-sky-200 mt-1 max-w-2xl leading-relaxed">
              Officer: <span className="font-semibold text-white">{user?.name || 'S. Anandhi, Field Surveyor'}</span> | Authorized for FMB / TSLR reconciliation, Drone Orthomosaic (ORI) analysis, DGPS ground control point validation, topology QA (slivers/overlaps), and parcel boundary editing.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('maps_workspace')}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Launch Full GIS Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('field_inspection')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 flex items-center space-x-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Field Tasks</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Field Survey Tasks</span>
            <MapPin className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">11</div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Physical Measurements Assigned</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Drone ORI Datasets</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">5cm GSD</div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Coimbatore South Flight Complete</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Topology QA Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">2</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">1.4m Ridge Boundary Variance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">DGPS Benchmarks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">6 Points</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">CORS Network Locked</span>
        </div>
      </div>

      {/* Role AI Insights */}
      <RoleAIInsights />

      {/* Split-Screen Spatial Comparison Card (Cadastral Boundary vs Geospatial Evidence) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <SplitSquareHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Interactive Split-Screen: Cadastral FMB vs Drone Orthomosaic
            </h3>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveSplitTab('cadastral')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeSplitTab === 'cadastral'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              FMB Vector (1982)
            </button>
            <button
              onClick={() => setActiveSplitTab('drone')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeSplitTab === 'drone'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Drone ORI (2025)
            </button>
            <button
              onClick={() => setActiveSplitTab('both')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeSplitTab === 'both'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Side-by-Side Overlay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Side A: Cadastral FMB */}
          {(activeSplitTab === 'cadastral' || activeSplitTab === 'both') && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                  Layer A: Statutory Cadastral FMB Ladder
                </span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-mono">
                  Scale 1:1000 • Village FMB
                </span>
              </div>
              <div className="h-44 rounded-lg bg-sky-900/10 dark:bg-sky-900/30 border border-sky-300/40 dark:border-sky-800/60 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 border-2 border-dashed border-sky-600 rounded-md relative flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-300">
                    Sy. 84/2B
                    <br />
                    1.25 Acres
                  </span>
                  <div className="absolute -top-2 left-4 bg-sky-600 text-white text-[9px] px-1 rounded">54.2m</div>
                  <div className="absolute -bottom-2 left-4 bg-sky-600 text-white text-[9px] px-1 rounded">53.8m</div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  Survey ladder baseline offset: 12.4m north from junction tri-junction stone TJ-04.
                </p>
              </div>
            </div>
          )}

          {/* Side B: Drone Orthomosaic */}
          {(activeSplitTab === 'drone' || activeSplitTab === 'both') && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Layer B: High-Res Drone Ortho & DSM (2025)
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">
                  5cm GSD • Orthorectified
                </span>
              </div>
              <div className="h-44 rounded-lg bg-emerald-900/10 dark:bg-emerald-900/30 border border-emerald-300/40 dark:border-emerald-800/60 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 border-2 border-rose-500 rounded-md relative flex items-center justify-center bg-rose-500/10">
                  <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300">
                    Ground Reality
                    <br />
                    1.21 Acres
                  </span>
                  <div className="absolute -right-3 top-4 bg-rose-600 text-white text-[9px] px-1 rounded animate-pulse">
                    -1.4m Encroach
                  </div>
                </div>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-2">
                  Encroachment detected on Western Ridge. Compound wall built past statutory FMB ladder boundary.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Survey Cases Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Survey & Demarcation Cases • அளவை மற்றும் எல்லை நிர்ணய வரிசை</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Field verification, boundary recalculation, and cadastral endorsement.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search survey, applicant, village..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Survey & Subdivision</th>
                <th className="px-4 py-3">Extent Documented</th>
                <th className="px-4 py-3">FMB Topology</th>
                <th className="px-4 py-3">Survey Clearance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => {
                const isCleared = app.departmentClearances?.['Survey and Land Records']?.status === 'Verified';
                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
                        Sy. {app.surveyNumber}/{app.subdivision}
                      </div>
                      <div className="text-[11px] text-slate-400">{app.village}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.extentValue} {app.extentUnit}</div>
                    </td>
                    <td className="px-4 py-3">
                      {app.screeningState === 'Discrepancy detected' ? (
                        <span className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">
                          Boundary Deficit Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          Closed Polygon (0 Errors)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isCleared ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Survey Cleared</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Field Survey</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!isCleared && (
                          <button
                            onClick={() => setSelectedAppForClearance(app.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
                          >
                            Approve Survey
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('maps_workspace')}
                          className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-md"
                          title="Open in Spatial Workspace"
                        >
                          <Compass className="w-4 h-4" />
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

      {/* Survey Clearance Modal */}
      {selectedAppForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Endorse Survey Clearance • நில அளவைத் துறை ஒப்புதல்
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Case ID: <span className="font-mono font-semibold">{selectedAppForClearance}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Field Surveyor Physical Measurement Notes
              </label>
              <textarea
                value={clearanceRemarks}
                onChange={(e) => setClearanceRemarks(e.target.value)}
                placeholder="Document stone boundary checkpoints, DGPS coordinates, and boundary closure..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
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
                onClick={() => handleGrantSurveyClearance(selectedAppForClearance)}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Endorse & Clear Survey'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
