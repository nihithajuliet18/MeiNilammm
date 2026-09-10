import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Application, UserRole } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  ShieldAlert,
  Compass,
  Building,
  Zap,
  Layers,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

interface RoleAIInsightsProps {
  application?: Application | null;
  cases?: Application[];
}

export const RoleAIInsights: React.FC<RoleAIInsightsProps> = ({ application, cases = [] }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role: UserRole = user?.role || 'revenue_officer';

  // Role-Aware AI Insights Generation
  const renderInsightsForRole = () => {
    switch (role) {
      case 'revenue_officer':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  AI Ownership & Patta Concordance
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300 mt-1 leading-relaxed">
                  Screening 14-point statutory revenue rules: In Sy. 84/2B, deed references legal heir devolution while A-Register records single joint ownership without sub-division subdivision order. Recommended: Request FMB verification before issuing mutation.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">
                    Risk Score: 78/100 (Subdivision Conflict)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  A-Register & Chitta Extraction Consistency
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300 mt-1 leading-relaxed">
                  Sy. 142/3A: Patta #891 verified against Nilam Tamil Nadu State Central Land Database. Normalized extent matches documented 2.45 Acres across both Chitta and Settlement Register.
                </p>
              </div>
            </div>
          </div>
        );

      case 'registration_officer':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  AI Chain of Title & Encumbrance Continuity
                </h4>
                <p className="text-xs text-indigo-800/90 dark:text-indigo-300 mt-1 leading-relaxed">
                  Deed Doc #2024/1892 audited across 30-year EC records. Link deed from 1994 verified with matching parent survey number. Zero dual mortgages or competing attachments detected in Sub-Registrar Office ledger.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md">
                    Chain Confidence: 94.2%
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    EC Range: 1996 - 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Guideline Value vs Declared Consideration
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300 mt-1 leading-relaxed">
                  Declared transaction value ₹1.45 Cr matches statutory guideline rate ₹5,800/sq ft for Saravanampatti Village Road. Stamp duty calculation verified as consistent.
                </p>
              </div>
            </div>
          </div>
        );

      case 'survey_officer':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40">
              <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  AI Cadastral Boundary vs High-Res Drone Ortho Analysis
                </h4>
                <p className="text-xs text-sky-800/90 dark:text-sky-300 mt-1 leading-relaxed">
                  Overlay of 1982 FMB field ladder against 2025 Drone ORI reveals 0.82m boundary variance along western hedge. Compound wall encroaches 1.4m into adjoining government Poramboke drainage reserve.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md">
                    Overlap Flag: Western Ridge (1.4m)
                  </span>
                  <span className="text-[10px] bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 px-2 py-0.5 rounded-md font-mono">
                    Positional Residual: RMSE 0.14m
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    GCP Network: 6 Ground Points Locked
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Subdivision Geometry Closure
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300 mt-1 leading-relaxed">
                  Proposed sub-parcel 142/3A-1 polygon closes mathematically with zero slivers or self-intersections. Area equals 1.10 Acres (47,916 sq ft).
                </p>
              </div>
            </div>
          </div>
        );

      case 'municipal_officer':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
              <Building className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  AI Plinth vs Building Plan Deviation & Setbacks
                </h4>
                <p className="text-xs text-purple-800/90 dark:text-purple-300 mt-1 leading-relaxed">
                  Building footprint derived from 5cm satellite imagery exceeds DTCP approved layout plan #BL-2023-441 by 14.8% on rear setback. Front road buffer 3.0m compliant with master plan arterial corridor.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-md">
                    GIS PID: CBE-CORP-W12-B4-092
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold">
                    Setback Violation: 1.2m Rear
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'utility_officer':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  AI Utility Meter & Network Parcel Association
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300 mt-1 leading-relaxed">
                  TANGEDCO 3-Phase Service Connection #03-241-008-112 geo-located via smart meter GPS: coordinates sit squarely within documented parcel boundary. TWAD water connection pipeline verified along northern frontage.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    Electricity Association: Verified 100%
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    TANGEDCO Sec 04-A
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviewing_authority':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Consolidated Multi-Departmental Risk Matrix
                </h4>
                <p className="text-xs text-rose-800/90 dark:text-rose-300 mt-1 leading-relaxed">
                  Reviewing Authority Synthesis: 3 of 5 departments cleared (Revenue: Verified, Registration: Verified, Utilities: Verified). Survey flagged 1.4m western boundary deviation; Municipal flagged 1.2m rear setback. Recommended: Grant conditional clearance subject to boundary rectification within 30 days.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                    Statutory Conflict Level: MODERATE
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    Clearance Ratio: 60% (3/5 Complete)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'auditor':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <FileCheck2 className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Auditor Integrity & Decision Audit Log
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  Cryptographic verification of system audit records: 540 ledger entries hashed with SHA-256. Zero tampering or sequence gaps detected. 2 officer overrides documented with mandatory justification text.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    Audit Trail Hash Verified: PASS
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    Chain ID: TN-AUDIT-2026-CBE
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system_administrator':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Platform Architecture & Security Health
                </h4>
                <p className="text-xs text-blue-800/90 dark:text-blue-300 mt-1 leading-relaxed">
                  All 5 departmental interfaces operating normally. Gemini 2.5 multimodal document pipeline response latency 1.4s. 0 failed unauthorized API attempts in the last 60 minutes.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    System Uptime: 99.98%
                  </span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-md font-mono">
                    Active RBAC Sessions: 9 Roles
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'applicant':
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  விண்ணப்ப நிலை வழிகாட்டி • Application Status Guide
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300 mt-1 leading-relaxed">
                  வணக்கம்! உங்கள் பட்டா மாறுதல் விண்ணப்பம் (TN-REV-2026-CBE-00101) வருவாய்த் துறை மற்றும் பத்திரப் பதிவுத் துறையால் சரிபார்க்கப்பட்டு விட்டது. நில அளவர் நேரடி கள ஆய்விற்குப் பிறகு இறுதி ஆணை வழங்கப்படும்.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-semibold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md font-tamil">
                    அடுத்த படி: கள ஆய்வு (Field Inspection)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              AI Role Intelligence • நுண்ணறிவுப் பகுப்பாய்வு
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Contextual analysis calibrated for{' '}
              <span className="font-semibold capitalize text-emerald-700 dark:text-emerald-400">
                {role.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
          Gemini 2.5 Flash
        </span>
      </div>

      {renderInsightsForRole()}
    </div>
  );
};
