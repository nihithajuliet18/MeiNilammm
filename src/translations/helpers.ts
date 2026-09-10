/**
 * Centralized Translation Helpers for MeiNilam Domain Concepts
 * Standardized across Revenue, Registration, Survey, Municipal, and Utility workflows
 */

import { UserRole, Department } from '../types';

export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

export function translateRole(role: string | UserRole | undefined, t: TranslationFunction): string {
  if (!role) return t('officer_fallback');
  const normalized = role.toLowerCase().trim();
  switch (normalized) {
    case 'revenue_officer':
      return t('role_revenue_officer');
    case 'registration_officer':
      return t('role_registration_officer');
    case 'survey_officer':
      return t('role_survey_officer');
    case 'municipal_officer':
      return t('role_municipal_officer');
    case 'utility_officer':
      return t('role_utility_officer');
    case 'reviewing_authority':
      return t('role_reviewing_authority');
    case 'auditor':
      return t('role_auditor');
    case 'system_admin':
      return t('role_system_admin');
    case 'applicant':
      return t('role_applicant');
    default:
      return role.replace(/_/g, ' ');
  }
}

export function translateDepartment(dept: string | Department | undefined, t: TranslationFunction): string {
  if (!dept) return '—';
  const normalized = dept.toLowerCase().trim();
  if (normalized.includes('revenue')) return t('dept_revenue');
  if (normalized.includes('registration')) return t('dept_registration');
  if (normalized.includes('survey') || normalized.includes('land records')) return t('dept_survey');
  if (normalized.includes('town') || normalized.includes('municipal')) return t('dept_municipal');
  if (normalized.includes('utility') || normalized.includes('public works') || normalized.includes('tneb')) return t('dept_utility');
  return dept;
}

export function translateStatus(status: string | undefined, t: TranslationFunction): string {
  if (!status) return '—';
  const s = status.toUpperCase().trim();
  switch (s) {
    case 'DRAFT':
      return t('status_draft');
    case 'SUBMITTED':
      return t('status_submitted');
    case 'PROCESSING':
    case 'IN PROGRESS':
      return t('status_processing');
    case 'REVIEW REQUIRED':
    case 'IN REVIEW':
      return t('status_review_required');
    case 'FIELD VERIFICATION ASSIGNED':
    case 'FIELD_VERIFICATION':
    case 'FIELD VERIFICATION':
      return t('status_field_verification');
    case 'DEPARTMENT CLEARANCE PENDING':
    case 'DEPARTMENT VERIFIED':
      return t('status_dept_clearance');
    case 'RECOMMENDED FOR APPROVAL':
    case 'APPROVED':
      return t('status_recommended');
    case 'OBJECTIONS RECORDED':
    case 'REJECTED':
      return t('status_objections');
    case 'CLOSED':
    case 'COMPLETED':
      return t('status_closed');
    default:
      return status;
  }
}

export function translateScreening(screening: string | undefined, t: TranslationFunction): string {
  if (!screening) return '—';
  const s = screening.toLowerCase().trim();
  if (s.includes('no discrepancy')) return t('screen_no_discrepancy');
  if (s.includes('discrepancy')) return t('screen_discrepancy');
  if (s.includes('insufficient')) return t('screen_insufficient');
  if (s.includes('field verification') || s.includes('field required')) return t('screen_field_required');
  return screening;
}

export function translateSeverity(severity: string | undefined, t: TranslationFunction): string {
  if (!severity) return '—';
  const s = severity.toUpperCase().trim();
  switch (s) {
    case 'CRITICAL':
      return t('severity_critical');
    case 'MAJOR':
      return t('severity_major');
    case 'MINOR':
      return t('severity_minor');
    case 'INFORMATIONAL':
    case 'INFO':
      return t('severity_info');
    default:
      return severity;
  }
}

export function translateDocType(docType: string | undefined, t: TranslationFunction): string {
  if (!docType) return '—';
  const s = docType.toUpperCase().trim();
  switch (s) {
    case 'SALE_DEED':
    case 'SALE DEED':
      return t('doc_sale_deed');
    case 'PATTA':
      return t('doc_patta');
    case 'ENCUMBRANCE_CERTIFICATE':
    case 'ENCUMBRANCE CERTIFICATE':
    case 'EC':
      return t('doc_ec');
    case 'FMB_SKETCH':
    case 'FMB SKETCH':
    case 'FMB':
      return t('doc_fmb');
    case 'TSLR_EXTRACT':
    case 'TSLR EXTRACT':
    case 'TSLR':
      return t('doc_tslr');
    case 'ADANGAL':
    case 'A_REGISTER':
    case 'A REGISTER':
      return t('doc_adangal');
    case 'LEGAL_HEIR_CERTIFICATE':
    case 'LEGAL HEIR':
      return t('doc_legal_heir');
    case 'DEATH_CERTIFICATE':
      return t('doc_death_cert');
    case 'PARENT_DEED':
      return t('doc_parent_deed');
    default:
      return docType.replace(/_/g, ' ');
  }
}

export function translateUnit(unit: string | undefined, t: TranslationFunction): string {
  if (!unit) return '';
  const u = unit.toLowerCase().trim();
  switch (u) {
    case 'sq ft':
    case 'sq_ft':
    case 'sqft':
      return t('unit_sq_ft');
    case 'sq m':
    case 'sq_m':
    case 'sqm':
      return t('unit_sq_m');
    case 'cents':
    case 'cent':
      return t('unit_cents');
    case 'acres':
    case 'acre':
      return t('unit_acres');
    case 'links':
    case 'link':
      return t('unit_links');
    case 'metres':
    case 'meters':
    case 'm':
      return t('unit_metres');
    case 'feet':
    case 'ft':
      return t('unit_feet');
    case 'chain':
      return t('unit_chains');
    default:
      return unit;
  }
}

export function translateLandClass(classification: string | undefined, t: TranslationFunction): string {
  if (!classification) return '—';
  const c = classification.toLowerCase().trim();
  if (c.includes('natham') || c.includes('நத்தம்')) return t('land_class_natham');
  if (c.includes('nansei') || c.includes('wet') || c.includes('நன்செய்')) return t('land_class_nansei');
  if (c.includes('punsei') || c.includes('dry') || c.includes('புன்செய்')) return t('land_class_punsei');
  if (c.includes('poramboke') || c.includes('government') || c.includes('புறம்போக்கு')) return t('land_class_poramboke');
  return classification;
}
