/**
 * Locale-Aware Formatters for Dates, Numbers, Currency, and Extents
 * Ensures culturally authentic formatting while preserving exact evidentiary values
 */

const LOCALE_MAP: Record<string, string> = {
  ta: 'ta-IN',
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-IN',
  sa: 'sa-IN',
  ks: 'ks-IN',
  kok: 'kok-IN',
  mni: 'mni-IN',
  ne: 'ne-NP',
  sd: 'sd-IN',
  doi: 'doi-IN',
  brx: 'brx-IN',
  sat: 'sat-IN',
  mai: 'mai-IN',
  bho: 'bho-IN',
  raj: 'raj-IN',
  tcy: 'tcy-IN',
  kfa: 'kfa-IN',
  kha: 'en-IN',
  grt: 'en-IN',
  lus: 'en-IN',
};

export function getIntlLocale(langCode: string): string {
  return LOCALE_MAP[langCode] || 'en-IN';
}

export function formatDate(
  dateInput: string | Date | number | undefined | null,
  langCode: string = 'ta',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const locale = getIntlLocale(langCode);
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function formatNumber(
  numInput: number | string | undefined | null,
  langCode: string = 'ta',
  options?: Intl.NumberFormatOptions
): string {
  if (numInput === undefined || numInput === null || numInput === '') return '—';
  const num = typeof numInput === 'string' ? parseFloat(numInput) : numInput;
  if (isNaN(num)) return String(numInput);

  try {
    const locale = getIntlLocale(langCode);
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (e) {
    return num.toLocaleString();
  }
}

export function formatCurrency(
  amount: number | string | undefined | null,
  langCode: string = 'ta',
  currency: string = 'INR'
): string {
  if (amount === undefined || amount === null || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);

  try {
    const locale = getIntlLocale(langCode);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch (e) {
    return `₹${num.toLocaleString()}`;
  }
}

export function formatArea(
  extent: number | string | undefined | null,
  unit: string = 'sq ft',
  langCode: string = 'ta'
): string {
  if (extent === undefined || extent === null || extent === '') return '—';
  const formattedNum = formatNumber(extent, langCode, { maximumFractionDigits: 2 });
  return `${formattedNum} ${unit}`;
}
