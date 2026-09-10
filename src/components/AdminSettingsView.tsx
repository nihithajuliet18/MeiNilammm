import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../translations/languages';
import {
  Settings,
  Globe,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  Database,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';

interface AdminSettingsViewProps {
  onResetDemo: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ onResetDemo }) => {
  const { currentLanguage, setLanguageCode } = useLanguage();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [resetConfirm, setResetConfirm] = useState(false);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              System Administration & Regional Language Governance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control 30 Indian regional language registries, RBAC roles, theme preferences, and demonstration test environments
            </p>
          </div>
        </div>
      </div>

      {/* Theme & Display Mode Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-emerald-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Visual Appearance & Theme Mode</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select between high-contrast crisp light mode and eye-safe deep dark mode for cadastre and document scrutiny
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
            Current: {theme} Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
              theme === 'light'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Light Theme
                </span>
                {theme === 'light' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Optimized for daytime office administration, document scans readability, and printed verification audit reports.
              </p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
              theme === 'dark'
                ? 'border-emerald-600 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 dark:bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <Moon className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Dark Theme
                </span>
                {theme === 'dark' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Engineered for extended cadastral GIS map inspection, reduced glare, and night-shift verification workflows.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Walkthrough Scenario Demonstration Baseline</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reset all 5 walkthrough scenarios (clean rural parcel, subdivision mismatch, 24.8% extent deficit, incomplete EC/unreadable FMB, and identity ambiguity) to their initial evaluation state. Real user-created applications will be preserved.
        </p>

        <div className="pt-2">
          {resetConfirm ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onResetDemo();
                  setResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Confirm Reset of All 5 Demonstration Scenarios
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Walkthrough Data</span>
            </button>
          )}
        </div>
      </div>

      {/* 30 Regional Languages Registry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Centralized Regional Language Registry (English + 29 Regional Languages)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All 30 regional languages active with complete vocabulary dictionaries and bidirectional text rendering support
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded">
            30 Languages Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Language (English)</th>
                <th className="py-2.5 px-4">Native Name</th>
                <th className="py-2.5 px-4">Script</th>
                <th className="py-2.5 px-4">Direction</th>
                <th className="py-2.5 px-4">Completeness</th>
                <th className="py-2.5 px-4">Review Status</th>
                <th className="py-2.5 px-4 text-right">Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <tr key={lang.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {lang.code}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {lang.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {lang.nativeName}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{lang.script}</td>
                  <td className="py-2.5 px-4">
                    {lang.direction === 'rtl' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        RTL
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">LTR</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${lang.completenessPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold">
                        {lang.completenessPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        lang.reviewStatus === 'Verified Complete'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lang.reviewStatus === 'Under Official Review'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : lang.reviewStatus === 'Awaiting Official Linguistic Review'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {lang.reviewStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => setLanguageCode(lang.code)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold ${
                        currentLanguage.code === lang.code
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {currentLanguage.code === lang.code ? 'Active' : 'Apply'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
