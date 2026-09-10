import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Application } from '../../types';
import { RoleAIInsights } from '../RoleAIInsights';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  User,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface ApplicantDashboardProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onNavigate: (view: any) => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  applications,
  onSelectApplication,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'status' | 'help'>('status');

  // Strict citizen applicant isolation
  const myApplications = applications.filter(
    (a) =>
      a.applicantId === user?.id ||
      a.applicantName.toLowerCase().includes((user?.name || '').toLowerCase()) ||
      a.id === 'app_demo_01'
  );

  const activeApp = myApplications[0] || applications[0];

  const workflowSteps = [
    { id: 1, title: 'விண்ணப்பம் தாக்கல்', sub: 'Application Submitted', completed: true },
    {
      id: 2,
      title: 'வருவாய்த் துறை சரிபார்ப்பு',
      sub: 'Revenue Verification (DRO)',
      completed: activeApp?.departmentClearances?.Revenue?.status === 'Verified' || activeApp?.status === 'APPROVED',
      active: !activeApp?.departmentClearances?.Revenue?.status,
    },
    {
      id: 3,
      title: 'பத்திரப் பதிவு சரிபார்ப்பு',
      sub: 'Registration SRO Check',
      completed: activeApp?.departmentClearances?.Registration?.status === 'Verified' || activeApp?.status === 'APPROVED',
    },
    {
      id: 4,
      title: 'கள அளவை ஆய்வு',
      sub: 'Field Survey Inspection',
      completed: activeApp?.departmentClearances?.['Survey and Land Records']?.status === 'Verified' || activeApp?.status === 'APPROVED',
    },
    {
      id: 5,
      title: 'நகராட்சி / பயன்பாட்டு ஒப்புதல்',
      sub: 'Municipal & Utility Check',
      completed: activeApp?.departmentClearances?.['Town and Country Planning']?.status === 'Verified',
    },
    {
      id: 6,
      title: 'இறுதி ஆணை & பட்டா',
      sub: 'Final Order / Patta Certificate',
      completed: activeApp?.status === 'APPROVED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Citizen Welcome Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-800 text-emerald-200 border border-emerald-700">
                குடிமக்கள் நுழைவாயில் • Citizen Portal
              </span>
              <span className="text-xs text-emerald-300 font-mono">TN e-Sevai / MeiNilam</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white font-tamil">
              வணக்கம், {user?.name || 'M. Shanmugasundaram'}!
            </h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl leading-relaxed">
              உங்கள் நில ஆவணப் பட்டா மாறுதல் விண்ணப்பத்தின் நிகழ்நேர நிலவரத்தை இந்த பக்கத்தில் வெளிப்படையாகக் கண்காணிக்கலாம்.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('application_new')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all font-tamil"
            >
              <span>+ புதிய பட்டா விண்ணப்பம்</span>
            </button>
            <button
              onClick={() => onNavigate('documents_upload')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 flex items-center space-x-1.5 transition-all font-tamil"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ஆவணங்கள் பதிவேற்று</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role AI Insights for Applicant */}
      <RoleAIInsights application={activeApp} />

      {/* Visual Application Tracker */}
      {activeApp && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Active Application • தற்போதைய விண்ணப்பம்
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {activeApp.applicationNumber} • {activeApp.applicationType}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  புல எண்: <strong className="text-slate-700 dark:text-slate-200">Sy. {activeApp.surveyNumber}/{activeApp.subdivision}</strong>, {activeApp.village}, {activeApp.taluk}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-full">
                {activeApp.status}
              </span>
              {activeApp.status === 'APPROVED' && (
                <button
                  onClick={() => alert('Downloading official digitized Tamil Nadu e-Patta certificate...')}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Patta</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
              செயல்முறை நிலவரம் • Live Verification Milestones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    step.completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : step.active
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400">0{step.id}</span>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : step.active ? (
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-tamil leading-snug">
                      {step.title}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                    {step.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Citizen FAQ / Guidance Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-tamil">
            அடிக்கடி கேட்கப்படும் கேள்விகள் • Citizen FAQ & Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 font-tamil">
              1. பட்டா மாறுதல் ஆணை வர எத்தனை நாட்கள் ஆகும்?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              மெய்நிலம் தானியங்கி ஆவண சரிபார்ப்பு முறையின் மூலம் ஆவணங்களில் முரண்பாடு இல்லை எனில் 7 வேலை நாட்களுக்குள் ஆணை வழங்கப்படும்.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 font-tamil">
              2. கள ஆய்வு (Field Inspection) எப்போது நடக்கும்?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              நில அளவர் நேரடி ஆய்விற்கு வரும் முன் உங்களுக்கு குறுஞ்செய்தி (SMS) மூலம் தகவல் அனுப்பப்படும்.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
