import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Upload,
  MapPin,
  Map as MapIcon,
  CheckSquare,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Building2,
  FileSearch,
  Play,
  Compass,
} from 'lucide-react';

export type ActiveView =
  | 'dashboard'
  | 'application_new'
  | 'applications_all'
  | 'case_workspace'
  | 'documents_upload'
  | 'documents_review'
  | 'fmb_studio'
  | 'maps_workspace'
  | 'verification_matrix'
  | 'field_inspection'
  | 'collaboration'
  | 'reports_audit'
  | 'admin_settings';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onResetDemo: () => void;
  reviewRequiredCount: number;
  fieldTaskCount: number;
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onResetDemo,
  reviewRequiredCount,
  fieldTaskCount,
  onOpenLanding,
}) => {
  const { t } = useLanguage();
  const { user, checkPermission } = useAuth();

  const isApplicant = user?.role === 'applicant';
  const canViewAllCases = checkPermission('parcel.read') && !isApplicant;
  const canUploadDocs = checkPermission('document.upload');
  const canReviewDocs = (checkPermission('document.verify') || checkPermission('case.review')) && !isApplicant;
  const canViewMatrix = (checkPermission('document.verify') || checkPermission('case.review')) && !isApplicant;
  const canViewMaps = checkPermission('parcel.read');
  const canViewField = (checkPermission('survey.edit') || checkPermission('gis.edit') || checkPermission('case.approve') || user?.role === 'revenue_officer') && !isApplicant;
  const canViewCollab = !isApplicant;
  const canViewAudit = checkPermission('audit.read');
  const canViewAdmin = checkPermission('system.configure') || checkPermission('user.manage');

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-[calc(100vh-4rem)] select-none transition-colors">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {isApplicant ? t('sidebar_citizen_services') : t('sidebar_main_ops')}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{isApplicant ? t('sidebar_my_status') : t('nav_dashboard')}</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('application_new')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeView === 'application_new'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FilePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{isApplicant ? t('sidebar.new_application') : t('nav_intake')}</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Intake
              </span>
            </button>

            {canViewAllCases && (
              <button
                onClick={() => onNavigate('applications_all')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'applications_all'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Files className="w-4 h-4" />
                  <span>{t('nav_app_all')}</span>
                </div>
                {reviewRequiredCount > 0 && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                    {reviewRequiredCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Evidence & Verification Section */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {t('sidebar_verif_evidence')}
          </div>
          <div className="space-y-1">
            {canUploadDocs && (
              <button
                onClick={() => onNavigate('documents_upload')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'documents_upload'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{t('nav_doc_upload')}</span>
              </button>
            )}

            {canReviewDocs && (
              <button
                onClick={() => onNavigate('documents_review')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'documents_review'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <FileSearch className="w-4 h-4" />
                <span>{t('nav_doc_extract_review')}</span>
              </button>
            )}

            {canViewMatrix && (
              <button
                onClick={() => onNavigate('verification_matrix')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'verification_matrix'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('nav_verif_evidence')}</span>
                </div>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  14 Rules
                </span>
              </button>
            )}

            {canViewMaps && (
              <button
                onClick={() => onNavigate('fmb_studio')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'fmb_studio'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{t('nav_fmb_studio_full')}</span>
                </div>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  Vision
                </span>
              </button>
            )}

            {canViewMaps && (
              <button
                onClick={() => onNavigate('maps_workspace')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'maps_workspace'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-semibold">{t('nav_maps_workspace')}</span>
              </button>
            )}

            {canViewField && (
              <button
                onClick={() => onNavigate('field_inspection')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeView === 'field_inspection'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('nav_maps_field_verif')}</span>
                </div>
                {fieldTaskCount > 0 && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                    {fieldTaskCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Governance & Institutional Collaboration */}
        {(canViewCollab || canViewAudit || canViewAdmin) && (
          <div>
            <div className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {t('sidebar_governance_audit')}
            </div>
            <div className="space-y-1">
              {canViewCollab && (
                <button
                  onClick={() => onNavigate('collaboration')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeView === 'collaboration'
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t('nav_collaboration')}</span>
                </button>
              )}

              {canViewAudit && (
                <button
                  onClick={() => onNavigate('reports_audit')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeView === 'reports_audit'
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('nav_reports_audit')}</span>
                </button>
              )}

              {canViewAdmin && (
                <button
                  onClick={() => onNavigate('admin_settings')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeView === 'admin_settings'
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('nav_admin_languages')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Area: Demo Reset Action & BENNITTA Attribution */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 space-y-2">
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-emerald-800/80 hover:bg-emerald-700 text-white transition-colors shadow-2xs cursor-pointer"
            title={t('sidebar_landing_video')}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{t('sidebar_landing_video')}</span>
          </button>
        )}

        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-md bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-2xs"
          title={t('btn_reset_demo')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('btn_reset_demo')}</span>
        </button>

        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500">
          {t('sidebar_developed_by')} <span className="font-semibold text-slate-600 dark:text-slate-400">BENNITTA</span> for Smart Cities
        </div>
      </div>
    </aside>
  );
};
