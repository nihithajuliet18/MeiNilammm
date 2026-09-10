import React, { useState } from 'react';
import { useAuth, PERSONA_LIST } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Building2,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginAsPersona, loginCustom, logout } = useAuth();
  const { t } = useLanguage();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName && customEmail) {
      // Public signup is strictly applicant role
      loginCustom(customName, customEmail, 'applicant', 'Revenue');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('modal_auth_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Pill */}
        {user && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                Current Active Session: {user.name}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {user.department} • Role: {user.role.replace(/_/g, ' ')}
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-100"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
              !isCustomMode
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('tab_personas')}
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
              isCustomMode
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('tab_custom_login')}
          </button>
        </div>

        {/* Persona Switcher List */}
        {!isCustomMode ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {PERSONA_LIST.map((p) => {
              const isSelected = user?.role === p.role;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    loginAsPersona(p.role);
                    onClose();
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{p.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {p.department} ({p.jurisdiction})
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {p.role.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Citizen Signup / Login */
          <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. S. Arumugam"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="applicant@example.com"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Public self-registration automatically assigns the <strong>Applicant</strong> role. Departmental officer roles require institutional provisioning.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Continue as Citizen Applicant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
