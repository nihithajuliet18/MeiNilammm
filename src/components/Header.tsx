import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole, Department } from '../types';
import {
  Shield,
  Globe,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Zap,
  Play,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenAuthModal?: () => void;
  onResetDemo?: () => void;
  activeScenarioId?: number;
  onSelectScenario?: (id: number) => void;
  onOpenRealTimeUpload?: () => void;
  onOpenLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenAuthModal,
  onResetDemo,
  activeScenarioId,
  onSelectScenario,
  onOpenRealTimeUpload,
  onOpenLanding,
}) => {
  const handleOpenAuth = onOpenAuthModal || onOpenAuth || (() => {});
  const { user, logout, switchRole } = useAuth();
  const { currentLanguage, setLanguageCode, languages, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const scenarioTitles: Record<number, string> = {
    1: 'Scenario 1: Consistent Evidence (Clean Rural Parcel)',
    2: 'Scenario 2: Subdivision Mismatch (84/2B vs 84/2A)',
    3: 'Scenario 3: Extent Deficit (54,450 sq ft vs 40,946 sq ft)',
    4: 'Scenario 4: Incomplete EC & Unreadable FMB Scan',
    5: 'Scenario 5: Identity Ambiguity & Competing Filing',
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Statutory Human Review Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/50 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 max-w-5xl truncate">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold">{t('label_statutory_disclaimer')}</span>
          <span className="hidden md:inline text-amber-700 dark:text-amber-300">
            • {t('label_human_review_notice')}
          </span>
        </div>
        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-300 shrink-0 ml-2">
          BENNITTA AI Lab • v2.4
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div
          id="header-brand-identity"
          className={`flex items-center space-x-3 shrink-0 text-left justify-start ${onOpenLanding ? 'cursor-pointer group' : ''}`}
          onClick={onOpenLanding}
          title={onOpenLanding ? t('title_landing_video') : undefined}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm font-tamil text-xl transition-colors shrink-0">
            {t('app_name_short')}
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tamil tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                {t('app_name')}
              </span>
              <span className="text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide whitespace-nowrap">
                {t('app_english_name')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls: Walkthrough Scenarios, Role Switcher, Language, Theme, User */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Landing Video Page Button */}
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
              title={t('title_landing_video')}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">{t('btn_landing_video')}</span>
            </button>
          )}

          {/* 1-Click Walkthrough Scenarios Quick Selector */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              title="Select one of 5 walkthrough demonstration cases"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">
                {activeScenarioId ? `Demo #${activeScenarioId}` : t('header_walkthrough_scenarios')}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('header_demo_test_cases')}
                </div>
                {[1, 2, 3, 4, 5].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      onSelectScenario(id);
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      activeScenarioId === id
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {id}
                    </span>
                    <span className="leading-snug">{scenarioTitles[id]}</span>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                  <button
                    onClick={() => {
                      onResetDemo();
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-center text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center space-x-1 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('header_reset_all_scenarios')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher for Institutional Testing */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Switch role perspective (Revenue, Registration, Survey, Municipal, Applicant, etc.)"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="capitalize max-w-[120px] truncate hidden sm:inline">
                {user ? user.role.replace(/_/g, ' ') : t('header_select_role')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('header_select_role')}
                </div>
                {(Object.keys(DEMO_PERSONAS) as UserRole[]).map((r) => {
                  const persona = DEMO_PERSONAS[r];
                  const isActive = user?.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r, persona.department);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800/90 font-semibold text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="capitalize">{r.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {persona.name} • {persona.department}
                        </div>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 30-Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Select Language (English + 29 Regional Languages)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold">{currentLanguage.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('header_supported_languages')}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">100% (30)</span>
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguageCode(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      currentLanguage.code === l.code
                        ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-emerald-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-medium mr-2">{l.nativeName}</span>
                      <span className="text-[11px] text-slate-400">({l.name})</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {l.direction === 'rtl' && <span className="mr-1 text-purple-600 font-bold">RTL</span>}
                      {l.completenessPercent}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Upload Quick Trigger */}
          {onOpenRealTimeUpload && (
            <button
              onClick={onOpenRealTimeUpload}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
              title="Open Real-time Document Upload & Ingestion Studio"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Upload Live</span>
            </button>
          )}

          {/* Light/Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden md:inline font-medium">Dark</span>
              </>
            )}
          </button>

          {/* User Profile / Sign in */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="hidden xl:block text-right">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {user.department}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('btn_sign_in')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
