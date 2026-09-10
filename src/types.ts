/**
 * Core Domain Types for மெய்நிலம் (MeiNilam)
 * AI-Assisted Land Document & Geospatial Verification System
 */

export type UserRole =
  | 'applicant'
  | 'revenue_officer'
  | 'registration_officer'
  | 'survey_officer'
  | 'municipal_officer'
  | 'utility_officer'
  | 'reviewing_authority'
  | 'auditor'
  | 'system_administrator';

export type Department =
  | 'Revenue'
  | 'Registration'
  | 'Survey and Land Records'
  | 'Town and Country Planning'
  | 'Public Works & Utilities'
  | 'General Administration';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: Department;
  jurisdiction: {
    district: string;
    taluk?: string;
    village?: string;
    town?: string;
    ward?: string;
  };
  phone?: string;
  createdAt: string;
}

export type ApplicationType =
  | 'Patta Transfer'
  | 'Subdivision & Patta'
  | 'Layout Regularization'
  | 'Title Verification for Planning Permission'
  | 'Natham Land Settlement'
  | 'Boundary Dispute Resolution'
  | 'Encumbrance & Transaction Clearance';

export type LandContext = 'Rural' | 'Natham' | 'Urban';
export type ApplicationContext = LandContext;

export type LandClassification =
  | 'Ryotwari Punja'
  | 'Ryotwari Nanja'
  | 'Government Poramboke'
  | 'Gramanatham'
  | 'Town Survey Land';

export type ApplicationStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'IN REVIEW'
  | 'CLARIFICATION REQUIRED'
  | 'FIELD VERIFICATION'
  | 'DEPARTMENT VERIFIED'
  | 'ESCALATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED'
  | 'Draft'
  | 'Submitted'
  | 'Processing'
  | 'Review Required'
  | 'Field Verification Assigned'
  | 'Department Clearance Pending'
  | 'Clearance Recommended'
  | 'Objections Recorded'
  | 'Closed';

export type AutomatedScreeningState =
  | 'No discrepancy detected within checked evidence'
  | 'Discrepancy detected'
  | 'Insufficient evidence'
  | 'Field verification required';

export type DocumentType =
  | 'Patta / Chitta'
  | 'A-Register'
  | 'FMB (Field Measurement Book)'
  | 'TSLR (Town Survey Land Register)'
  | 'Sale Deed'
  | 'Parent Document / Prior Title Deed'
  | 'Encumbrance Certificate (EC)'
  | 'Mutation Order'
  | 'Subdivision Order'
  | 'Partition Deed'
  | 'Settlement Deed'
  | 'Inheritance / Legal Heir Certificate'
  | 'Power of Attorney (PoA)'
  | 'Identity Evidence'
  | 'Property Tax Receipt'
  | 'Utility Bill (Electricity/Water)'
  | 'Field Inspection Report'
  | 'Court Order / Restriction Record'
  | 'Other Supporting Document';

export type DocumentStatus =
  | 'Received'
  | 'Missing'
  | 'Not applicable'
  | 'Unreadable'
  | 'Processing'
  | 'Extraction review required'
  | 'Source verification pending'
  | 'Source checked'
  | 'Failed';

export interface DocumentRecord {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  checksumSha256: string;
  status: DocumentStatus;
  uploadedAt: string;
  pageCount: number;
  unreadableReason?: string;
  isSyntheticDemo?: boolean;
  version: number;
}

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldCategory: 'identifier' | 'person' | 'extent' | 'boundary' | 'date' | 'classification' | 'prior_ref';
  originalText: string;
  normalizedValue: string | number;
  pageNumber: number;
  boundingBox?: { x1: number; y1: number; x2: number; y2: number };
  confidence: number;
  confidenceOrigin: 'rule_exact' | 'ocr_layout' | 'gemini_multimodal' | 'manual_officer_entry';
  reviewState: 'unreviewed' | 'accepted' | 'corrected' | 'flagged';
  officerCorrection?: string;
  officerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ParcelModel {
  id: string;
  applicationId: string;
  surveyNumber: string;
  subdivision: string;
  oldSurveyNumber?: string;
  pattaNumber: string;
  context: LandContext;
  district: string;
  taluk: string;
  village: string;
  town?: string;
  ward?: string;
  block?: string;
  extentDocumented: {
    value: number;
    unit: 'Acres' | 'Cents' | 'Sq.Ft' | 'Sq.M' | 'Ares' | 'Gunthas' | 'Ground';
    normalizedSqMeters: number;
  };
  extentMappedSqMeters?: number;
  classification: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  geometryGeoJson?: any;
  centroidCoordinates: [number, number]; // [lng, lat]
}

export interface PersonLink {
  id: string;
  applicationId: string;
  nameInRecord: string;
  relationshipName?: string;
  roleInRecord: 'Applicant' | 'Executant (Vendor)' | 'Claimant (Purchaser)' | 'Parent Owner' | 'Power Agent' | 'Witness';
  matchedApplicantId?: string;
  linkageType: 'Applicant Self' | 'Direct Purchaser' | 'Inherited / Legal Heir' | 'Power of Attorney' | 'Unlinked Party';
  linkageStatus: 'Text Similarity' | 'Proposed Linkage' | 'Officer Confirmed' | 'Unresolved Mismatch';
  identityEvidenceDocId?: string;
  idNumberMasked?: string;
}

export interface TransactionRecord {
  id: string;
  applicationId: string;
  documentNumber: string;
  documentYear: number;
  registrationOffice: string;
  registrationDate: string;
  executant: string;
  claimant: string;
  extentDesc: string;
  surveyNumbersCovered: string[];
  reconciledWithPrior: boolean;
  notes?: string;
}

export type FindingSeverity = 'Critical' | 'Major' | 'Moderate' | 'Advisory' | 'Info';
export type FindingOutcome = 'Discrepancy' | 'Verified Consistent' | 'Not Evaluated' | 'Prerequisite Missing';

export interface VerificationFinding {
  id: string;
  applicationId: string;
  ruleId: string;
  ruleCategory:
    | 'Survey & Subdivision'
    | 'Administrative Location'
    | 'Extent & Unit Reconciliation'
    | 'Document Completeness'
    | 'Party & Identity Linkage'
    | 'File Integrity & Duplication'
    | 'Prior Title Chain'
    | 'EC Coverage'
    | 'Transaction Reconciliation'
    | 'Record Dates & Versions'
    | 'Mutation & Subdivision Orders'
    | 'Boundary Descriptions'
    | 'Cadastral & Spatial Alignment'
    | 'Inter-departmental Discrepancy';
  title: string;
  outcome: FindingOutcome;
  severity: FindingSeverity;
  explanation: string;
  evidenceReferences: {
    documentId?: string;
    documentType?: DocumentType;
    pageNumber?: number;
    fieldId?: string;
    coordinates?: [number, number];
    label: string;
  }[];
  missingPrerequisites?: string[];
  suggestedAction: string;
  officerDecision?: 'Pending' | 'Accepted' | 'Disputed' | 'Overridden' | 'Waived';
  officerJustification?: string;
  officerComment?: string;
  officerId?: string;
  updatedAt: string;
}

export interface SpatialLayer {
  id: string;
  applicationId?: string;
  name: string;
  sourceType: 'GeoJSON' | 'Shapefile' | 'KML' | 'GeoTIFF' | 'FMB Scan' | 'GCP Survey';
  crs: string; // e.g., 'EPSG:4326', 'EPSG:32644'
  captureDate: string;
  resolutionMeters?: number;
  accuracyMetadata: string;
  geojson?: any;
  tileUrl?: string;
  visible: boolean;
  opacity: number;
}

export interface FieldVerificationTask {
  id: string;
  applicationId: string;
  assignedOfficerName: string;
  assignedOfficerId: string;
  assignedAt: string;
  parcelId: string;
  status: 'Pending Inspection' | 'In Progress' | 'Report Submitted' | 'Verified & Closed';
  checklist: {
    item: string;
    completed: boolean;
    remark?: string;
  }[];
  groundMeasurements: {
    boundary: 'North' | 'South' | 'East' | 'West' | 'Diagonal';
    documentedMeters: number;
    groundMeasuredMeters: number;
    deviationMeters: number;
  }[];
  photos: {
    id: string;
    url: string;
    caption: string;
    timestamp: string;
    gpsCoordinates: [number, number];
    gpsAccuracyMeters: number;
  }[];
  officerObservations: string;
  submittedAt?: string;
  reviewerNotes?: string;
}

export interface SharingGrant {
  id: string;
  applicationId: string;
  evidenceScope: string;
  targetDepartment: Department;
  targetOfficerName: string;
  targetOfficerId: string;
  requesterOfficerName: string;
  requesterOfficerId: string;
  purpose: string;
  permission: 'Read Only' | 'Read & Comment';
  grantedAt: string;
  expiresAt: string;
  isRevoked: boolean;
  revokedReason?: string;
}

export interface DepartmentAccessRequest {
  id: string;
  applicationId: string;
  fromDepartment: Department;
  toDepartment: Department;
  requestedItem: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  respondedAt?: string;
  responseNote?: string;
}

export interface AuditEvent {
  id: string;
  applicationId?: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actorDepartment: Department;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface CaseReport {
  generatedAt: string;
  applicationNumber: string;
  caseType: ApplicationType;
  applicantName: string;
  administrativeLocation: string;
  surveyIdentifiers: string;
  extentDocumented: string;
  extentMapped: string;
  screeningState: AutomatedScreeningState;
  officerReviewStatus: string;
  findingsCount: {
    critical: number;
    major: number;
    moderate: number;
    advisory: number;
    consistent: number;
  };
  executiveSummary: string;
  statutoryDisclaimer: string;
}

export interface EvaluationDataset {
  id: string;
  name: string;
  version: string;
  sampleSize: number;
  realOrSynthetic: 'Real Labelled Cases' | 'Controlled Synthetic Benchmark';
  heldOutPartition: string;
  lastRunDate?: string;
  metrics?: {
    fieldExactMatchAccuracy: number; // e.g. 0.942
    parcelMatchPrecision: number;
    parcelMatchRecall: number;
    personLinkPrecision: number;
    personLinkRecall: number;
    conflictF1Score: number;
    spatialRmseMeters: number;
    boundaryIoU: number;
    falseCleanRate: number; // cases incorrectly screened with no discrepancy
    abstentionRate: number;
    avgProcessingSeconds: number;
    avgOfficerReviewMinutes: number;
  };
}

export interface Application {
  id: string;
  applicationNumber: string;
  applicantName: string;
  applicantId: string;
  applicantPhone: string;
  applicantEmail: string;
  applicationType: ApplicationType;
  context: LandContext;
  district: string;
  taluk: string;
  village: string;
  town?: string;
  ward?: string;
  block?: string;
  surveyNumber: string;
  subdivision: string;
  pattaNumber: string;
  status: ApplicationStatus;
  screeningState: AutomatedScreeningState;
  createdAt: string;
  updatedAt: string;
  assignedOfficerName?: string;
  assignedOfficerId?: string;
  assignedDepartment?: Department;
  assignedTimestamp?: string;
  previousStatus?: string;
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
  sla?: string;
  lastAction?: string;
  nextRequiredAction?: string;
  departmentClearances?: Partial<Record<Department, { status: 'Pending' | 'Verified' | 'Flagged'; officerName?: string; verifiedAt?: string; remarks?: string }>>;
  officerDecisionNotes?: string;
  officerDecisionDate?: string;
  isSyntheticDemo?: boolean;
  demoScenarioId?: number;
  priority: 'High' | 'Normal' | 'Urgent';
}

export type ApplicationRecord = Application;

/**
 * Field Measurement Book (FMB) Analysis & Sketch Domain Types
 */

export type FmbProcessingStage =
  | 'Uploaded'
  | 'Validating'
  | 'Reading pages'
  | 'Extracting details'
  | 'Interpreting sketch'
  | 'Checking measurements'
  | 'Preparing report'
  | 'Completed'
  | 'Review required'
  | 'Failed';

export type FmbFieldStatus =
  | 'Not present'
  | 'Present but unreadable'
  | 'Ambiguous'
  | 'Extracted'
  | 'Officer-confirmed';

export interface FmbPageInfo {
  pageNumber: number;
  status: 'Success' | 'Partial' | 'Unreadable' | 'Blank' | 'Blurred' | 'Failed' | 'Password Protected';
  notes?: string;
  previewUrl?: string;
}

export interface FmbSourceRegion {
  ymin: number; // 0-1000 scale or percentage
  xmin: number;
  ymax: number;
  xmax: number;
  label?: string;
}

export interface FmbFieldEvidence {
  fieldName: string;
  category: 'document_id' | 'sketch_parcel' | 'measurement' | 'marginal_note' | 'official_seal';
  originalText: string;
  normalizedValue: string | number;
  originalLanguage: 'Tamil' | 'English' | 'Mixed' | 'Unknown';
  documentId: string;
  pageNumber: number;
  sourceRegion?: FmbSourceRegion;
  extractionProvider: string;
  timestamp: string;
  status: FmbFieldStatus;
  alternativeInterpretations?: string[];
  officerCorrection?: string;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export interface FmbIdentification {
  documentType: FmbFieldEvidence;
  fmbSheetId: FmbFieldEvidence;
  district: FmbFieldEvidence;
  taluk: FmbFieldEvidence;
  village: FmbFieldEvidence;
  villageCode: FmbFieldEvidence;
  surveyNumber: FmbFieldEvidence;
  subdivisionNumber: FmbFieldEvidence;
  oldSurveyRef: FmbFieldEvidence;
  surveyDate: FmbFieldEvidence;
  scale: FmbFieldEvidence;
  measurementUnit: FmbFieldEvidence;
  northOrientation: FmbFieldEvidence;
  adjoiningSheets: FmbFieldEvidence;
  surveyorDesignation: FmbFieldEvidence;
  sealSignatureStatus: FmbFieldEvidence;
  remarksNotes: FmbFieldEvidence;
}

export interface FmbMeasurementItem {
  id: string;
  parcelSubdivision: string;
  fromPoint: string;
  toPoint: string;
  rawNotation: string;
  parsedNumericValue?: number;
  unit: string;
  type: 'boundary' | 'baseline' | 'offset' | 'angle' | 'bearing' | 'ladder_gline' | 'unknown';
  pageNumber: number;
  sourceRegion?: FmbSourceRegion;
  interpretationStatus: 'Verified' | 'Ambiguous association' | 'Unclear notation' | 'Officer corrected';
  reviewerCorrection?: {
    value?: number;
    unit?: string;
    fromPoint?: string;
    toPoint?: string;
    note?: string;
  };
  lineAssociationSupported: boolean;
  alternativeAssociation?: string;
}

export interface FmbParcelInfo {
  parcelNumber: string;
  subdivision: string;
  statedAreaRaw?: string;
  statedAreaNormalizedSqMeters?: number;
  statedUnit?: string;
  boundaryPointLabels: string[];
  adjoiningNorth?: string;
  adjoiningSouth?: string;
  adjoiningEast?: string;
  adjoiningWest?: string;
  ownerNamesShown?: string;
  classificationShown?: string;
}

export type FmbParcelBreakdown = FmbParcelInfo;

export interface FmbSketchInterpretation {
  plainEnglishExplanation: string;
  plainTamilExplanation: string;
  landIdentifiersSummary: string;
  parcelsIdentifiedCount: number;
  readableMeasurementsCount: number;
  neighbouringReferences: string[];
  physicalFeaturesLabelled: string[];
  sketchCommunicates: string;
  uncertainDetails: string[];
  recommendedFollowUpDocs: string[];
}

export interface FmbGeometryCalculation {
  id: string;
  target: 'Perimeter' | 'Calculated Area (Traverse/Triangulation)' | 'Stated Area' | 'Calibrated Tracing Area';
  inputs: string[];
  sourceReferences: string[];
  methodFormula: string;
  unitsAndConversions: string;
  assumptions: string[];
  resultValue?: number;
  resultUnit?: string;
  limitations: string;
  status: 'Calculated' | 'Not evaluated — insufficient information' | 'Estimated';
}

export interface FmbMeasurementCheck {
  id: string;
  checkType:
    | 'missing_boundary_measurements'
    | 'unconnected_segments'
    | 'ambiguous_point_labels'
    | 'duplicate_point_labels'
    | 'self_intersections'
    | 'traverse_closure'
    | 'stated_vs_calculated_extent'
    | 'subdivision_totals_vs_parent'
    | 'inconsistent_shared_boundary';
  label: string;
  status: 'Passed' | 'Discrepancy' | 'Not evaluated — insufficient information';
  toleranceUsed?: string;
  toleranceSource?: string;
  discrepancyDelta?: string;
  details: string;
}

export interface FmbFinding {
  id: string;
  ruleId: string;
  category: 'Within FMB' | 'Cross-Document' | 'Spatial Ground' | 'Geometry & Measurements';
  severity: 'Critical' | 'Major' | 'Minor' | 'Advisory';
  explanation: string;
  sourceEvidence: string;
  missingPrerequisites?: string;
  recommendedNextAction: string;
}

export interface FmbCrossDocComparisonItem {
  fieldName: string;
  fmbValue: string;
  otherDocValue: string;
  sourceDocName: string;
  sourceDocType: string;
  matchStatus: 'Match' | 'Discrepancy' | 'Unit converted match' | 'Historical variation' | 'Not present';
  notes: string;
}

export interface FmbCrossDocComparison {
  status: 'Compared' | 'Comparison documents not uploaded' | 'Partial comparison';
  comparedDocumentNames: string[];
  items: FmbCrossDocComparisonItem[];
}

export interface FmbReviewItem {
  id: string;
  targetType: 'field' | 'measurement' | 'parcel' | 'unit';
  targetId: string;
  originalValue: string;
  correctedValue: string;
  reason: string;
  reviewedBy: string;
  reviewedAt: string;
  analysisVersion: number;
}

export interface FmbTracedPoint {
  id: string;
  label: string;
  x: number; // 0-1000 coordinate space
  y: number;
  isStation?: boolean;
}

export interface FmbTracedLine {
  id: string;
  fromPoint: string;
  toPoint: string;
  type: 'boundary' | 'baseline' | 'offset' | 'cart_track' | 'watercourse';
  measurementLabel?: string;
  length?: number;
}

export interface FmbDocumentAnalysis {
  id: string;
  documentId: string;
  applicationId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  checksumSha256: string;
  pageCount: number;
  processingStage: FmbProcessingStage;
  processingProvider: string;
  modelName: string;
  timestamp: string;
  pages: FmbPageInfo[];
  identification: FmbIdentification;
  parcels: FmbParcelInfo[];
  measurements: FmbMeasurementItem[];
  sketchInterpretation: FmbSketchInterpretation;
  geometryCalculations: FmbGeometryCalculation[];
  measurementChecks: FmbMeasurementCheck[];
  findings: FmbFinding[];
  crossDocComparison?: FmbCrossDocComparison;
  humanReviews: FmbReviewItem[];
  tracedPoints: FmbTracedPoint[];
  tracedLines: FmbTracedLine[];
  enhancedImageUrl?: string;
  isSampleFixture?: boolean;
}

export interface ModelAnalysis {
  id: string;
  applicationId: string;
  timestamp: string;
  modelVersion: string;
  inputSnapshot: any;
  result: {
    predicted_class: string;
    uncalibrated_model_probability: number;
    baseline_raw_score: number;
    predicted_raw_score: number;
    top_model_drivers: {
      feature: string;
      value: any;
      shap_raw_score: number;
    }[];
    unavailable_features: string[];
    scope: string;
  };
}
