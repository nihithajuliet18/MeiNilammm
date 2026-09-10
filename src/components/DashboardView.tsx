import React, { useState } from 'react';
import { Application, AutomatedScreeningState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RevenueOfficerDashboard } from './dashboards/RevenueOfficerDashboard';
import { RegistrationOfficerDashboard } from './dashboards/RegistrationOfficerDashboard';
import { SurveyOfficerDashboard } from './dashboards/SurveyOfficerDashboard';
import { MunicipalOfficerDashboard } from './dashboards/MunicipalOfficerDashboard';
import { UtilityOfficerDashboard } from './dashboards/UtilityOfficerDashboard';
import { ReviewingAuthorityDashboard } from './dashboards/ReviewingAuthorityDashboard';
import { AuditorDashboard } from './dashboards/AuditorDashboard';
import { SystemAdminDashboard } from './dashboards/SystemAdminDashboard';
import { ApplicantDashboard } from './dashboards/ApplicantDashboard';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onSelectScenario: (scenarioId: number) => void;
  onNavigateToIntake: () => void;
  onRunVerification: (id: string) => void;
  onNavigate?: (view: any) => void;
  onResetDemo?: () => void;
  onRefresh?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
  onSelectApplication,
  onSelectScenario,
  onNavigateToIntake,
  onRunVerification,
  onNavigate = () => {},
  onResetDemo = () => {},
  onRefresh = () => {},
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Role-Based Custom Dashboard Dispatcher
  if (user?.role === 'revenue_officer') {
    return (
      <RevenueOfficerDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'registration_officer') {
    return (
      <RegistrationOfficerDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'survey_officer') {
    return (
      <SurveyOfficerDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'municipal_officer') {
    return (
      <MunicipalOfficerDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'utility_officer') {
    return (
      <UtilityOfficerDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'reviewing_authority') {
    return (
      <ReviewingAuthorityDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
      />
    );
  }

  if (user?.role === 'auditor') {
    return (
      <AuditorDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
      />
    );
  }

  if (user?.role === 'system_administrator') {
    return (
      <SystemAdminDashboard
        onResetDemo={onResetDemo}
        onNavigate={onNavigate}
      />
    );
  }

  if (user?.role === 'applicant') {
    return (
      <ApplicantDashboard
        applications={applications}
        onSelectApplication={onSelectApplication}
        onNavigate={onNavigate}
      />
    );
  }

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesSearch =
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.pattaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCases = applications.length;
  const reviewRequired = applications.filter((a) => a.status === 'Review Required').length;
  const fieldVerifCount = applications.filter((a) => a.status === 'Field Verification Assigned').length;
  const recommendedCount = applications.filter((a) => a.status === 'Clearance Recommended').length;

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'Draft':
        return t('status_draft');
      case 'Submitted':
        return t('status_submitted');
      case 'Review Required':
        return t('status_review_required');
      case 'Field Verification Assigned':
        return t('status_field_verification');
      case 'Clearance Recommended':
        return t('status_recommended');
      case 'Department Clearance Pending':
        return t('status_dept_clearance');
      case 'Objections Recorded':
        return t('status_objections');
      case 'Closed':
        return t('status_closed');
      default:
        return st;
    }
  };

  const getScreeningBadge = (state: AutomatedScreeningState) => {
    switch (state) {
      case 'No discrepancy detected within checked evidence':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            {t('badge_no_discrepancy')}
          </span>
        );
      case 'Discrepancy detected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />
            {t('badge_discrepancy_flagged')}
          </span>
        );
      case 'Field verification required':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
            <MapPin className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
            {t('badge_field_req')}
          </span>
        );
      case 'Insufficient evidence':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
            <Clock className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400" />
            {t('badge_missing_evidence')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-tamil">
              {t('greeting_welcome')}, {user?.name || t('officer_fallback')}
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {user?.department}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('sub_engine_tagline')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToIntake}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>{t('nav_app_new')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('kpi_total_registered')}</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            {totalCases}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t('kpi_total_jurisdiction')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('kpi_discrepancies_flagged')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {reviewRequired}
          </div>
          <div className="text-[11px] text-rose-500 dark:text-rose-400/80 mt-1">
            {t('kpi_discrepancies_notice')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('kpi_field_inspections')}</span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
            {fieldVerifCount}
          </div>
          <div className="text-[11px] text-amber-500 dark:text-amber-400/80 mt-1">
            {t('kpi_field_tools')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('kpi_concordant_clearance')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2 font-mono">
            {totalCases > 0 ? `${Math.round((recommendedCount / totalCases) * 100)}%` : '0%'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">
            {t('kpi_zero_conflicts')}
          </div>
        </div>
      </div>

      {/* Prominent Section: The 5 Mandatory Walkthrough Scenarios */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('walkthrough_scenarios_title')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('walkthrough_scenarios_desc')}
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {t('walkthrough_preconfigured_badge')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Scenario 1 */}
          <div
            onClick={() => onSelectScenario(1)}
            className="group cursor-pointer p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Scenario 1
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {t('scenario_1_title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {t('scenario_1_desc')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
              <span>{t('inspect_case')}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Scenario 2 */}
          <div
            onClick={() => onSelectScenario(2)}
            className="group cursor-pointer p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Scenario 2
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {t('scenario_2_title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {t('scenario_2_desc')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-200/50 dark:border-rose-900/50 flex items-center justify-between text-[11px] font-semibold text-rose-700 dark:text-rose-400 group-hover:underline">
              <span>{t('inspect_case')}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Scenario 3 */}
          <div
            onClick={() => onSelectScenario(3)}
            className="group cursor-pointer p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Scenario 3
                </span>
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {t('scenario_3_title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {t('scenario_3_desc')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/50 flex items-center justify-between text-[11px] font-semibold text-amber-700 dark:text-amber-400 group-hover:underline">
              <span>{t('inspect_case')}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Scenario 4 */}
          <div
            onClick={() => onSelectScenario(4)}
            className="group cursor-pointer p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Scenario 4
                </span>
                <Clock className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {t('scenario_4_title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {t('scenario_4_desc')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-200/50 dark:border-purple-900/50 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-400 group-hover:underline">
              <span>{t('inspect_case')}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Scenario 5 */}
          <div
            onClick={() => onSelectScenario(5)}
            className="group cursor-pointer p-3.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 hover:border-red-500 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                  Scenario 5
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {t('scenario_5_title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                {t('scenario_5_desc')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-red-200/50 dark:border-red-900/50 flex items-center justify-between text-[11px] font-semibold text-red-700 dark:text-red-400 group-hover:underline">
              <span>{t('inspect_case')}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('work_queue_title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('work_queue_desc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('label_search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {[
                { id: 'All', label: t('filter_all') },
                { id: 'Review Required', label: t('filter_review_required') },
                { id: 'Field Verification Assigned', label: t('filter_field_assigned') },
                { id: 'Submitted', label: t('filter_submitted') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilterStatus(opt.id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    filterStatus === opt.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">{t('th_app_no')}</th>
                <th className="py-3 px-4">{t('th_applicant_loc')}</th>
                <th className="py-3 px-4">{t('th_survey_patta')}</th>
                <th className="py-3 px-4">{t('th_type')}</th>
                <th className="py-3 px-4">{t('th_screening')}</th>
                <th className="py-3 px-4">{t('th_status')}</th>
                <th className="py-3 px-4 text-right">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {app.applicationNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {app.applicantName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {app.village}, {app.taluk}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                      Sy. {app.surveyNumber}/{app.subdivision}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Patta #{app.pattaNumber}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {app.applicationType}
                    </span>
                    <div className="text-[11px] text-slate-400">{app.context}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getScreeningBadge(app.screeningState)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'Review Required'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : app.status === 'Field Verification Assigned'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onRunVerification(app.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Run Automated Rules Verification"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectApplication(app.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors flex items-center space-x-1"
                      >
                        <span>{t('btn_workspace')}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {t('no_matching_apps')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
