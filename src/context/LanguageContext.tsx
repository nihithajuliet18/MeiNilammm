import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../translations/languages';
import {
  getTranslation,
  TranslationKey,
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatCurrency as fmtCurrency,
  formatArea as fmtArea,
  translateRole as trRole,
  translateDepartment as trDept,
  translateStatus as trStatus,
  translateScreening as trScreening,
  translateSeverity as trSeverity,
  translateDocType as trDocType,
  translateUnit as trUnit,
  translateLandClass as trLandClass,
} from '../translations';

interface LanguageContextType {
  currentLanguage: LanguageMeta;
  setLanguageCode: (code: string) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  languages: LanguageMeta[];
  formatDate: (date: string | Date | number | undefined | null, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number | string | undefined | null, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number | string | undefined | null, currency?: string) => string;
  formatArea: (extent: number | string | undefined | null, unit?: string) => string;
  translateRole: (role: string | undefined) => string;
  translateDepartment: (dept: string | undefined) => string;
  translateStatus: (status: string | undefined) => string;
  translateScreening: (screening: string | undefined) => string;
  translateSeverity: (severity: string | undefined) => string;
  translateDocType: (docType: string | undefined) => string;
  translateUnit: (unit: string | undefined) => string;
  translateLandClass: (classification: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCodeState] = useState<string>(() => {
    return localStorage.getItem('meinilam_lang') || 'en'; // English is authoritative default
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  }, [langCode]);

  const isRtl = currentLanguage.direction === 'rtl';

  const setLanguageCode = useCallback((code: string) => {
    setLangCodeState(code);
    localStorage.setItem('meinilam_lang', code);

    // Sync preferred language to server profile if user is authenticated
    try {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage: code }),
      }).catch(() => {
        // Silently continue if offline or guest
      });
    } catch (e) {
      // Ignored
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('meinilam_lang', langCode);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
  }, [langCode, isRtl]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return getTranslation(key, langCode, params);
    },
    [langCode]
  );

  const formatDate = useCallback(
    (date: string | Date | number | undefined | null, options?: Intl.DateTimeFormatOptions) => {
      return fmtDate(date, langCode, options);
    },
    [langCode]
  );

  const formatNumber = useCallback(
    (num: number | string | undefined | null, options?: Intl.NumberFormatOptions) => {
      return fmtNumber(num, langCode, options);
    },
    [langCode]
  );

  const formatCurrency = useCallback(
    (amount: number | string | undefined | null, currency?: string) => {
      return fmtCurrency(amount, langCode, currency);
    },
    [langCode]
  );

  const formatArea = useCallback(
    (extent: number | string | undefined | null, unit?: string) => {
      return fmtArea(extent, unit, langCode);
    },
    [langCode]
  );

  const translateRole = useCallback(
    (role: string | undefined) => trRole(role, t),
    [t]
  );

  const translateDepartment = useCallback(
    (dept: string | undefined) => trDept(dept, t),
    [t]
  );

  const translateStatus = useCallback(
    (status: string | undefined) => trStatus(status, t),
    [t]
  );

  const translateScreening = useCallback(
    (screening: string | undefined) => trScreening(screening, t),
    [t]
  );

  const translateSeverity = useCallback(
    (severity: string | undefined) => trSeverity(severity, t),
    [t]
  );

  const translateDocType = useCallback(
    (docType: string | undefined) => trDocType(docType, t),
    [t]
  );

  const translateUnit = useCallback(
    (unit: string | undefined) => trUnit(unit, t),
    [t]
  );

  const translateLandClass = useCallback(
    (classification: string | undefined) => trLandClass(classification, t),
    [t]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageCode,
        t,
        isRtl,
        languages: SUPPORTED_LANGUAGES,
        formatDate,
        formatNumber,
        formatCurrency,
        formatArea,
        translateRole,
        translateDepartment,
        translateStatus,
        translateScreening,
        translateSeverity,
        translateDocType,
        translateUnit,
        translateLandClass,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
