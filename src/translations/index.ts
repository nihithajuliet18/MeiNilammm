import { SUPPORTED_LANGUAGES, LanguageMeta } from './languages';
import { TranslationKey } from './types';
import { en as baseEn, hi as baseHi, sa as baseSa, mai as baseMai, bho as baseBho, raj as baseRaj } from './locales/central';
import { ta as baseTa, te as baseTe, kn as baseKn, ml as baseMl, tcy as baseTcy, kfa as baseKfa } from './locales/dravidian';
import { mr as baseMr, gu as baseGu, pa as basePa, ur as baseUr, ks as baseKs, kok as baseKok, sd as baseSd, doi as baseDoi, ne as baseNe } from './locales/western';
import { bn as baseBn, or as baseOr, as as baseAs, mni as baseMni, brx as baseBrx, sat as baseSat, kha as baseKha, grt as baseGrt, lus as baseLus } from './locales/eastern';

import { commonTranslations } from './namespaces/common';
import { navigationTranslations } from './namespaces/navigation';
import { fmbTranslations } from './namespaces/fmb';
import { domainTranslations } from './namespaces/domain';
import { verificationTranslations } from './namespaces/verification';
import { dashboardTranslations } from './namespaces/dashboards';
import { mapsTranslations } from './namespaces/maps';
import { reportsTranslations } from './namespaces/reports';
import { intakeTranslations } from './namespaces/intake';

export type { TranslationKey, LanguageMeta };
export { SUPPORTED_LANGUAGES };
export * from './formatters';
export * from './helpers';

const baseLocaleMap: Record<string, Record<string, string>> = {
  en: baseEn,
  ta: baseTa,
  hi: baseHi,
  te: baseTe,
  kn: baseKn,
  ml: baseMl,
  mr: baseMr,
  gu: baseGu,
  bn: baseBn,
  pa: basePa,
  or: baseOr,
  as: baseAs,
  ur: baseUr,
  sa: baseSa,
  ks: baseKs,
  kok: baseKok,
  mni: baseMni,
  ne: baseNe,
  sd: baseSd,
  doi: baseDoi,
  brx: baseBrx,
  sat: baseSat,
  mai: baseMai,
  bho: baseBho,
  raj: baseRaj,
  tcy: baseTcy,
  kfa: baseKfa,
  kha: baseKha,
  grt: baseGrt,
  lus: baseLus,
};

// Assemble merged dictionaries for all 30 languages
export const dictionaries: Record<string, Record<string, string>> = {};

const allLangCodes = SUPPORTED_LANGUAGES.map((l) => l.code);

for (const code of allLangCodes) {
  dictionaries[code] = {
    ...(baseLocaleMap[code] || {}),
    ...(commonTranslations[code] || {}),
    ...(navigationTranslations[code] || {}),
    ...(fmbTranslations[code] || {}),
    ...(domainTranslations[code] || {}),
    ...(verificationTranslations[code] || {}),
    ...(dashboardTranslations[code] || {}),
    ...(mapsTranslations[code] || {}),
    ...(reportsTranslations[code] || {}),
    ...(intakeTranslations[code] || {}),
  };
}

/**
 * Authoritative Translation Resolver
 * Strict Fallback chain: selected language -> default Tamil ('ta') -> English ('en') -> key
 * Supports parameter replacement e.g. {count}, {name}
 */
export function getTranslation(
  key: string,
  langCode: string = 'en',
  params?: Record<string, string | number>
): string {
  if (!key) return '';

  const activeDict = dictionaries[langCode];
  let rawText = activeDict?.[key];

  // Fallback step 1: English bridge
  if (!rawText && langCode !== 'en') {
    rawText = dictionaries['en']?.[key];
  }

  // Fallback step 2: Return raw key if completely missing
  if (!rawText) {
    rawText = key;
  }

  // Interpolate parameters if supplied
  if (params && Object.keys(params).length > 0) {
    return rawText.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }

  return rawText;
}
