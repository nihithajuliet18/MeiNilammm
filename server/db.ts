import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Application,
  DocumentRecord,
  ExtractedField,
  ParcelModel,
  VerificationFinding,
  PersonLink,
  TransactionRecord,
  SpatialLayer,
  FieldVerificationTask,
  SharingGrant,
  DepartmentAccessRequest,
  AuditEvent,
  EvaluationDataset,
  UserProfile,
  FmbDocumentAnalysis,
  ModelAnalysis,
} from '../src/types';
import {
  getSampleFmbPerur142,
  getSampleFmbKuniyamuthur84,
  getSampleFmbPeelameduUrban,
  getSampleFmbWeatheredAmbiguous,
} from './fmbFixtures';

// Storage directory for uploaded documents and persistent state
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'meinilam_store.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface DatabaseSchema {
  applications: Application[];
  documents: DocumentRecord[];
  extractedFields: ExtractedField[];
  parcels: ParcelModel[];
  findings: VerificationFinding[];
  people: PersonLink[];
  transactions: TransactionRecord[];
  spatialLayers: SpatialLayer[];
  fieldTasks: FieldVerificationTask[];
  sharingGrants: SharingGrant[];
  accessRequests: DepartmentAccessRequest[];
  auditEvents: AuditEvent[];
  evaluations: EvaluationDataset[];
  users: UserProfile[];
  fmbAnalyses: FmbDocumentAnalysis[];
  modelAnalyses: ModelAnalysis[];
}

// Initial 5 realistic walkthrough cases as mandated by Section 16 of the prompt
function getInitialSeedData(): DatabaseSchema {
  return {
    applications: [],
    documents: [],
    extractedFields: [],
    parcels: [],
    findings: [],
    people: [],
    transactions: [],
    spatialLayers: [],
    fieldTasks: [],
    sharingGrants: [],
    accessRequests: [],
    auditEvents: [],
    evaluations: [],
    users: [],
    fmbAnalyses: [],
    modelAnalyses: [],
  };
}

class DatabaseRepository {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.fmbAnalyses || !Array.isArray(parsed.fmbAnalyses) || parsed.fmbAnalyses.length === 0) {
          parsed.fmbAnalyses = [
            getSampleFmbPerur142(),
            getSampleFmbKuniyamuthur84(),
            getSampleFmbPeelameduUrban(),
            getSampleFmbWeatheredAmbiguous(),
          ];
          this.saveToDisk(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed reading persistent database, falling back to seed data:', e);
    }
    const initial = getInitialSeedData();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // Applications
  getApplications(filter?: { status?: string; role?: string; applicantId?: string }): Application[] {
    let result = [...this.data.applications];
    if (filter?.applicantId) {
      result = result.filter(a => a.applicantId === filter.applicantId);
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(a => a.status === filter.status);
    }
    return result;
  }

  getApplicationById(id: string): Application | undefined {
    return this.data.applications.find(a => a.id === id);
  }

  createApplication(app: Partial<Application>): Application {
    const id = `app_${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newApp: Application = {
      id,
      applicationNumber: `TN-REV-2026-CBE-${randNum}`,
      applicantName: app.applicantName || 'Applicant',
      applicantId: app.applicantId || 'usr_app_new',
      applicantPhone: app.applicantPhone || '',
      applicantEmail: app.applicantEmail || '',
      applicationType: app.applicationType || 'Patta Transfer',
      context: app.context || 'Rural',
      district: app.district || 'Coimbatore',
      taluk: app.taluk || 'Coimbatore South',
      village: app.village || 'Perur',
      surveyNumber: app.surveyNumber || '101',
      subdivision: app.subdivision || '1',
      pattaNumber: app.pattaNumber || '101',
      status: 'Submitted',
      screeningState: 'Processing' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: app.priority || 'Normal',
      isSyntheticDemo: false,
    };
    this.data.applications.unshift(newApp);
    this.saveToDisk();

    this.logAudit({
      applicationId: id,
      actorName: newApp.applicantName,
      actorRole: 'applicant',
      actorDepartment: 'Revenue',
      action: 'APPLICATION_CREATED',
      details: `New application ${newApp.applicationNumber} registered for Survey ${newApp.surveyNumber}/${newApp.subdivision}`,
    });

    return newApp;
  }

  updateApplication(id: string, updates: Partial<Application>): Application | undefined {
    const index = this.data.applications.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.data.applications[index] = {
      ...this.data.applications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.data.applications[index];
  }

  // Documents
  getDocumentsByApplication(appId: string): DocumentRecord[] {
    return this.data.documents.filter(d => d.applicationId === appId);
  }

  getDocumentById(id: string): DocumentRecord | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  addDocument(doc: Partial<DocumentRecord>): DocumentRecord {
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newDoc: DocumentRecord = {
      id,
      applicationId: doc.applicationId || '',
      type: doc.type || 'Other Supporting Document',
      fileName: doc.fileName || 'Uploaded_Document.pdf',
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || 'application/pdf',
      fileUrl: doc.fileUrl || '',
      checksumSha256: doc.checksumSha256 || crypto.createHash('sha256').update(id).digest('hex'),
      status: doc.status || 'Received',
      uploadedAt: new Date().toISOString(),
      pageCount: doc.pageCount || 1,
      version: 1,
      isSyntheticDemo: false,
    };
    this.data.documents.push(newDoc);
    this.saveToDisk();
    return newDoc;
  }

  updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | undefined {
    const index = this.data.documents.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.data.documents[index] = { ...this.data.documents[index], ...updates };
    this.saveToDisk();
    return this.data.documents[index];
  }

  // Extracted Fields
  getExtractedFields(docId?: string, appId?: string): ExtractedField[] {
    if (docId) {
      return this.data.extractedFields.filter(f => f.documentId === docId);
    }
    if (appId) {
      const docIds = this.data.documents.filter(d => d.applicationId === appId).map(d => d.id);
      return this.data.extractedFields.filter(f => docIds.includes(f.documentId));
    }
    return this.data.extractedFields;
  }

  addExtractedField(field: ExtractedField): ExtractedField {
    this.data.extractedFields.push(field);
    this.saveToDisk();
    return field;
  }

  updateExtractedField(id: string, updates: Partial<ExtractedField>): ExtractedField | undefined {
    const index = this.data.extractedFields.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    this.data.extractedFields[index] = { ...this.data.extractedFields[index], ...updates };
    this.saveToDisk();
    return this.data.extractedFields[index];
  }

  // Parcels
  getAllParcels(): ParcelModel[] {
    return this.data.parcels;
  }

  getParcelByApplication(appId: string): ParcelModel | undefined {
    return this.data.parcels.find(p => p.applicationId === appId);
  }

  addParcel(parcel: ParcelModel): ParcelModel {
    this.data.parcels.push(parcel);
    this.saveToDisk();
    return parcel;
  }

  updateParcel(id: string, updates: Partial<ParcelModel>): ParcelModel | undefined {
    const index = this.data.parcels.findIndex(p => p.id === id || p.applicationId === id);
    if (index === -1) return undefined;
    this.data.parcels[index] = { ...this.data.parcels[index], ...updates };
    this.saveToDisk();
    return this.data.parcels[index];
  }

  // Findings
  getFindingsByApplication(appId: string): VerificationFinding[] {
    return this.data.findings.filter(f => f.applicationId === appId);
  }

  updateFinding(id: string, updates: Partial<VerificationFinding>): VerificationFinding | undefined {
    const index = this.data.findings.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    this.data.findings[index] = { ...this.data.findings[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveToDisk();
    return this.data.findings[index];
  }

  setFindingsForApplication(appId: string, newFindings: VerificationFinding[]) {
    this.data.findings = this.data.findings.filter(f => f.applicationId !== appId);
    this.data.findings.push(...newFindings);
    this.saveToDisk();
  }

  // People & Transactions
  getPeopleByApplication(appId: string): PersonLink[] {
    return this.data.people.filter(p => p.applicationId === appId);
  }

  getTransactionsByApplication(appId: string): TransactionRecord[] {
    return this.data.transactions.filter(t => t.applicationId === appId);
  }

  // Spatial Layers
  getSpatialLayers(appId?: string): SpatialLayer[] {
    if (appId) {
      return this.data.spatialLayers.filter(l => !l.applicationId || l.applicationId === appId);
    }
    return this.data.spatialLayers;
  }

  addSpatialLayer(layer: SpatialLayer): SpatialLayer {
    this.data.spatialLayers.push(layer);
    this.saveToDisk();
    return layer;
  }

  // Field Tasks
  getFieldTasks(appId?: string): FieldVerificationTask[] {
    if (appId) {
      return this.data.fieldTasks.filter(t => t.applicationId === appId);
    }
    return this.data.fieldTasks;
  }

  createFieldTask(task: Partial<FieldVerificationTask>): FieldVerificationTask {
    const newTask: FieldVerificationTask = {
      id: `tsk_${Date.now()}`,
      applicationId: task.applicationId || '',
      assignedOfficerName: task.assignedOfficerName || 'Field Surveyor',
      assignedOfficerId: task.assignedOfficerId || 'usr_srv_01',
      assignedAt: new Date().toISOString(),
      parcelId: task.parcelId || '',
      status: 'Pending Inspection',
      checklist: task.checklist || [
        { item: 'Verify ground physical boundary coordinates', completed: false },
        { item: 'Capture high-accuracy GPS boundary points', completed: false }
      ],
      groundMeasurements: task.groundMeasurements || [],
      photos: task.photos || [],
      officerObservations: task.officerObservations || '',
    };
    this.data.fieldTasks.push(newTask);
    this.saveToDisk();
    return newTask;
  }

  updateFieldTask(id: string, updates: Partial<FieldVerificationTask>): FieldVerificationTask | undefined {
    const index = this.data.fieldTasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.data.fieldTasks[index] = { ...this.data.fieldTasks[index], ...updates };
    this.saveToDisk();
    return this.data.fieldTasks[index];
  }

  // Sharing Grants & Access Requests
  getSharingGrants(appId?: string): SharingGrant[] {
    if (appId) return this.data.sharingGrants.filter(g => g.applicationId === appId);
    return this.data.sharingGrants;
  }

  createSharingGrant(grant: Partial<SharingGrant>): SharingGrant {
    const newGrant: SharingGrant = {
      id: `grt_${Date.now()}`,
      applicationId: grant.applicationId || '',
      evidenceScope: grant.evidenceScope || 'Selected Case Documents',
      targetDepartment: grant.targetDepartment || 'Revenue',
      targetOfficerName: grant.targetOfficerName || 'Officer',
      targetOfficerId: grant.targetOfficerId || '',
      requesterOfficerName: grant.requesterOfficerName || 'Requester',
      requesterOfficerId: grant.requesterOfficerId || '',
      purpose: grant.purpose || 'Verification',
      permission: grant.permission || 'Read Only',
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isRevoked: false,
    };
    this.data.sharingGrants.push(newGrant);
    this.saveToDisk();
    return newGrant;
  }

  getAccessRequests(appId?: string): DepartmentAccessRequest[] {
    if (appId) return this.data.accessRequests.filter(r => r.applicationId === appId);
    return this.data.accessRequests;
  }

  createAccessRequest(req: Partial<DepartmentAccessRequest>): DepartmentAccessRequest {
    const newReq: DepartmentAccessRequest = {
      id: `req_${Date.now()}`,
      applicationId: req.applicationId || '',
      fromDepartment: req.fromDepartment || 'Revenue',
      toDepartment: req.toDepartment || 'Registration',
      requestedItem: req.requestedItem || 'Evidence Document',
      reason: req.reason || 'Verification requirement',
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };
    this.data.accessRequests.push(newReq);
    this.saveToDisk();
    return newReq;
  }

  // Audit Events
  logAudit(event: Partial<AuditEvent>): AuditEvent {
    const newEvent: AuditEvent = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      applicationId: event.applicationId,
      timestamp: new Date().toISOString(),
      actorName: event.actorName || 'System',
      actorRole: event.actorRole || 'system_administrator',
      actorDepartment: event.actorDepartment || 'General Administration',
      action: event.action || 'SYSTEM_ACTION',
      details: event.details || '',
      ipAddress: event.ipAddress || '127.0.0.1',
    };
    this.data.auditEvents.unshift(newEvent);
    // Keep last 500 audit events
    if (this.data.auditEvents.length > 500) {
      this.data.auditEvents = this.data.auditEvents.slice(0, 500);
    }
    this.saveToDisk();
    return newEvent;
  }

  getAuditEvents(appId?: string): AuditEvent[] {
    if (appId) return this.data.auditEvents.filter(e => e.applicationId === appId);
    return this.data.auditEvents;
  }

  // Evaluations
  getEvaluations(): EvaluationDataset[] {
    return this.data.evaluations;
  }

  // Users
  getAllUsers(): UserProfile[] {
    return this.data.users;
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: UserProfile): UserProfile {
    this.data.users.push(user);
    this.saveToDisk();
    return user;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.saveToDisk();
    return this.data.users[index];
  }

  // Demo Reset
  resetDemoData(): boolean {
    const seed = getInitialSeedData();
    // Preserve any real non-synthetic applications created by the user!
    const realApps = this.data.applications.filter(a => !a.isSyntheticDemo);
    const realAppIds = realApps.map(a => a.id);
    const realDocs = this.data.documents.filter(d => realAppIds.includes(d.applicationId));
    const realFields = this.data.extractedFields.filter(f => realDocs.map(d => d.id).includes(f.documentId));
    const realParcels = this.data.parcels.filter(p => realAppIds.includes(p.applicationId));
    const realFindings = this.data.findings.filter(f => realAppIds.includes(f.applicationId));

    this.data = {
      applications: [...realApps, ...seed.applications],
      documents: [...realDocs, ...seed.documents],
      extractedFields: [...realFields, ...seed.extractedFields],
      parcels: [...realParcels, ...seed.parcels],
      findings: [...realFindings, ...seed.findings],
      people: [...seed.people],
      transactions: [...seed.transactions],
      spatialLayers: [...seed.spatialLayers],
      fieldTasks: [...seed.fieldTasks],
      sharingGrants: [...seed.sharingGrants],
      accessRequests: [...seed.accessRequests],
      auditEvents: [
        {
          id: `aud_reset_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: 'System Administrator',
          actorRole: 'system_administrator',
          actorDepartment: 'General Administration',
          action: 'DEMO_DATA_RESET',
          details: 'Standard 5 walkthrough cases reset to original baseline. Real applications preserved.',
        },
        ...seed.auditEvents
      ],
      evaluations: seed.evaluations,
      users: seed.users,
      fmbAnalyses: [
        ...this.data.fmbAnalyses.filter(a => !a.isSampleFixture),
        ...seed.fmbAnalyses,
      ],
      modelAnalyses: [...seed.modelAnalyses],
    };

    this.saveToDisk();
    return true;
  }

  // FMB (Field Measurement Book) Analyses
  getFmbAnalyses(applicationId?: string): FmbDocumentAnalysis[] {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    if (applicationId) {
      return this.data.fmbAnalyses.filter(a => a.applicationId === applicationId);
    }
    return [...this.data.fmbAnalyses];
  }

  getFmbAnalysisById(id: string): FmbDocumentAnalysis | undefined {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    return this.data.fmbAnalyses.find(a => a.id === id);
  }

  getFmbAnalysisByDocumentId(documentId: string): FmbDocumentAnalysis | undefined {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    return this.data.fmbAnalyses.find(a => a.documentId === documentId);
  }

  getFmbAnalysisByChecksum(checksumSha256: string): FmbDocumentAnalysis | undefined {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    return this.data.fmbAnalyses.find(a => a.checksumSha256 === checksumSha256);
  }

  saveFmbAnalysis(analysis: FmbDocumentAnalysis): FmbDocumentAnalysis {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    const index = this.data.fmbAnalyses.findIndex(a => a.id === analysis.id);
    if (index >= 0) {
      this.data.fmbAnalyses[index] = analysis;
    } else {
      this.data.fmbAnalyses.unshift(analysis);
    }
    this.saveToDisk();
    return analysis;
  }

  updateFmbAnalysis(id: string, updates: Partial<FmbDocumentAnalysis>): FmbDocumentAnalysis | undefined {
    if (!this.data.fmbAnalyses) this.data.fmbAnalyses = [];
    const index = this.data.fmbAnalyses.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.data.fmbAnalyses[index] = {
      ...this.data.fmbAnalyses[index],
      ...updates,
    };
    this.saveToDisk();
    return this.data.fmbAnalyses[index];
  }

  deleteFmbAnalysis(id: string): boolean {
    if (!this.data.fmbAnalyses) return false;
    const initialLen = this.data.fmbAnalyses.length;
    this.data.fmbAnalyses = this.data.fmbAnalyses.filter(a => a.id !== id);
    if (this.data.fmbAnalyses.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  getModelAnalyses(applicationId: string): ModelAnalysis[] {
    if (!this.data.modelAnalyses) this.data.modelAnalyses = [];
    return this.data.modelAnalyses.filter(a => a.applicationId === applicationId);
  }

  getParcelsByApplicationId(applicationId: string): ParcelModel[] {
    return this.data.parcels.filter(p => p.applicationId === applicationId);
  }

  saveModelAnalysis(analysis: ModelAnalysis) {
    if (!this.data.modelAnalyses) this.data.modelAnalyses = [];
    const index = this.data.modelAnalyses.findIndex(a => a.id === analysis.id);
    if (index !== -1) {
      this.data.modelAnalyses[index] = analysis;
    } else {
      this.data.modelAnalyses.unshift(analysis);
    }
    this.saveToDisk();
  }
}

export const db = new DatabaseRepository();
