import React, { useState, useEffect } from 'react';
import {
  Application,
  DocumentRecord,
  ExtractedField,
  ParcelModel,
  VerificationFinding,
  PersonLink,
  TransactionRecord,
  FieldVerificationTask,
  SharingGrant,
  AuditEvent,
  UserRole,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from './MapComponent';
import { RealTimeUploadModal } from './RealTimeUploadModal';
import { FmbStudioView } from './FmbStudioView';
import { ModelAnalysisDashboard } from './ModelAnalysisDashboard';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  ClipboardList,
  Upload,
  Download,
  Play,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Lock,
  Layers,
  ArrowLeft,
  Printer,
  FileCheck,
  Zap,
  Compass,
} from 'lucide-react';

interface CaseWorkspaceViewProps {
  applicationId: string;
  onBack: () => void;
  onRunVerification: (id: string) => void;
}

export const CaseWorkspaceView: React.FC<CaseWorkspaceViewProps> = ({
  applicationId,
  onBack,
  onRunVerification,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'verification' | 'fmb_analysis' | 'map' | 'field_task' | 'collaboration' | 'audit_report' | 'model_analysis'
  >('overview');

  const [caseData, setCaseData] = useState<{
    application: Application;
    documents: DocumentRecord[];
    parcel?: ParcelModel;
    findings: VerificationFinding[];
    people: PersonLink[];
    transactions: TransactionRecord[];
    fieldTasks: FieldVerificationTask[];
    auditTrail: AuditEvent[];
  } | null>(null);

  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [officerNote, setOfficerNote] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Load complete case bundle from server
  const loadCaseData = async () => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setCaseData(data);
        if (data.documents && data.documents.length > 0 && !selectedDocId) {
          setSelectedDocId(data.documents[0].id);
        }
      }

      const fieldsRes = await fetch(`/api/extracted-fields?applicationId=${applicationId}`);
      if (fieldsRes.ok) {
        const fields = await fieldsRes.json();
        setExtractedFields(fields);
      }
    } catch (e) {
      console.error('Failed to load case data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [applicationId]);

  if (isLoading || !caseData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading case records and geospatial geometry...</p>
        </div>
      </div>
    );
  }

  const { application, documents, parcel, findings, people, transactions, fieldTasks, auditTrail } =
    caseData;

  // Officer Finding Determination Handler
  const handleFindingDecision = async (
    findingId: string,
    decision: 'Accepted' | 'Overridden' | 'Pending',
    comment: string
  ) => {
    try {
      const res = await fetch(`/api/findings/${findingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerDecision: decision,
          officerComment: comment || `Decision recorded by ${user?.name}`,
          officerName: user?.name,
          officerRole: user?.role,
        }),
      });
      if (res.ok) {
        setSuccessToast(`Decision recorded: ${decision}`);
        setTimeout(() => setSuccessToast(null), 3000);
        loadCaseData();
      }
    } catch (err) {
      console.error('Failed to record decision:', err);
    }
  };

  // Field status update (e.g. accepted vs flagged)
  const handleFieldReview = async (fieldId: string, newState: 'accepted' | 'flagged') => {
    try {
      await fetch(`/api/extracted-fields/${fieldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewState: newState }),
      });
      setExtractedFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, reviewState: newState } : f))
      );
    } catch (e) {
      console.error('Failed to review field:', e);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const docFields = extractedFields.filter((f) => f.documentId === selectedDoc?.id);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Case Header & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="Return to Work Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {application.applicationNumber}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {application.applicationType}
                </span>
                {application.isSyntheticDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                    Demo Case #{application.demoScenarioId}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>
                  Applicant: <strong className="text-slate-800 dark:text-slate-200">{application.applicantName}</strong>
                </span>
                <span>
                  Survey: <strong className="text-slate-800 dark:text-slate-200">{application.surveyNumber}/{application.subdivision}</strong>
                </span>
                <span>
                  Patta: <strong className="text-slate-800 dark:text-slate-200">{application.pattaNumber}</strong>
                </span>
                <span>
                  Jurisdiction: <strong className="text-slate-800 dark:text-slate-200">{application.village}, {application.taluk}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Upload Document in Real Time</span>
            </button>
            <button
              onClick={() => {
                onRunVerification(application.id);
                loadCaseData();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Re-Run Automated Verification</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Case Dossier</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-200 dark:border-slate-800 mt-5 pt-3 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Case Overview', icon: FileText },
            { id: 'documents', label: `Documents (${documents.length})`, icon: Upload },
            { id: 'verification', label: `14-Rule Verification (${findings.length})`, icon: ShieldCheck },
            { id: 'fmb_analysis', label: 'FMB Sketch & Analysis', icon: Compass },
            { id: 'map', label: 'GIS & FMB Map Workspace', icon: MapPin },
            { id: 'field_task', label: `Field Inspection (${fieldTasks.length})`, icon: ClipboardList },
            { id: 'collaboration', label: 'Department Collaboration', icon: Building2 },
            { id: 'audit_report', label: 'Audit Trail & Certificate', icon: FileCheck },
            { id: 'model_analysis', label: 'Model Analysis', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB 1: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Summary Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Executive Assessment & Automated Screening Result</span>
              </h2>

              <div
                className={`p-4 rounded-lg border ${
                  application.screeningState === 'No discrepancy detected within checked evidence'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : application.screeningState === 'Discrepancy detected'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="font-bold text-sm flex items-center space-x-2">
                  <span>Screening Decision:</span>
                  <span>{application.screeningState}</span>
                </div>
                <p className="text-xs mt-1.5 opacity-90">
                  {findings.find((f) => f.severity === 'Critical')?.explanation ||
                    findings[0]?.explanation ||
                    'Evidence checked across registered sale deed, patta record, and cadastral spatial boundary.'}
                </p>
              </div>

              {/* Core Parcel Data Table */}
              {parcel && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Cadastral Parcel Attributes
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Survey / Subdiv</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {parcel.surveyNumber}/{parcel.subdivision}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Document Extent</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {parcel.extentDocumented.value} {parcel.extentDocumented.unit}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ({parcel.extentDocumented.normalizedSqMeters.toFixed(1)} sq.m)
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Mapped Geometry Extent</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {parcel.extentMappedSqMeters
                          ? `${parcel.extentMappedSqMeters.toFixed(1)} sq.m`
                          : 'Pending Digitization'}
                      </div>
                      {parcel.extentMappedSqMeters && (
                        <div
                          className={`text-[10px] font-bold ${
                            Math.abs(parcel.extentDocumented.normalizedSqMeters - parcel.extentMappedSqMeters) >
                            50
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          Dev:{' '}
                          {(
                            ((parcel.extentMappedSqMeters - parcel.extentDocumented.normalizedSqMeters) /
                              parcel.extentDocumented.normalizedSqMeters) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Land Classification</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {parcel.classification}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Settlement Context</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {parcel.context}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Centroid Coordinates</div>
                      <div className="font-mono text-slate-900 dark:text-white mt-0.5 text-[11px]">
                        {parcel.centroidCoordinates.map((c) => c.toFixed(4)).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boundary Descriptions */}
              {parcel && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">
                    Documented Boundary Descriptions:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">North:</strong>{' '}
                      {parcel.boundaryNorth || 'N/A'}
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">South:</strong>{' '}
                      {parcel.boundarySouth || 'N/A'}
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">East:</strong>{' '}
                      {parcel.boundaryEast || 'N/A'}
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">West:</strong>{' '}
                      {parcel.boundaryWest || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* People & Parties Linkage */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Parties & Identity Linkage Records ({people.length})</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {people.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {p.nameInRecord}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.relationshipName && `${p.relationshipName} • `}
                        Role: {p.roleInRecord}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.linkageStatus === 'Officer Confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.linkageStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.linkageType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Timeline, Officer Decision & Assignment */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Statutory Authority Action</span>
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p>
                  As an authorized officer ({user?.role.replace(/_/g, ' ')}), record your statutory order or requisition notice:
                </p>
                <textarea
                  rows={3}
                  placeholder="Enter official observation or requisition order..."
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleFindingDecision(findings[0]?.id || 'fnd_01', 'Accepted', officerNote);
                    setOfficerNote('');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Recommend Clearance</span>
                </button>

                <button
                  onClick={() => {
                    handleFindingDecision(findings[0]?.id || 'fnd_01', 'Pending', officerNote);
                    setOfficerNote('');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Call for Joint Field Verification</span>
                </button>
              </div>
            </div>

            {/* Quick Audit Timeline */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Immutable Event History
              </h3>
              <div className="space-y-3 text-xs">
                {auditTrail.slice(0, 4).map((a) => (
                  <div key={a.id} className="border-l-2 border-emerald-600 pl-3 py-1 space-y-0.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{a.action}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.details}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(a.timestamp).toLocaleString('en-IN')} • {a.actorName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: DOCUMENTS & EXTRACTION PROVENANCE --- */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document list selector */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Attached Documents ({documents.length})
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                title="Upload another evidentiary document in real-time"
              >
                <Upload className="w-3 h-3" />
                <span>+ Upload Live</span>
              </button>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                      {doc.type}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        doc.status === 'Source checked'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : doc.status === 'Unreadable'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">{doc.fileName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    SHA: {doc.checksumSha256.slice(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Document Provenance & Field Extraction Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Intelligence Extraction & Provenance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Extracted via Gemini multimodal intelligence & verified against source layout
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-600 dark:text-slate-400">
                {selectedDoc?.fileName}
              </span>
            </div>

            {selectedDoc?.status === 'Unreadable' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong>Document Unreadable Warning:</strong> {selectedDoc.unreadableReason}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Original Extracted Text</th>
                    <th className="py-2.5 px-3">Normalized Value</th>
                    <th className="py-2.5 px-3">Page / Box</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {docFields.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {f.fieldName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-tamil">
                        {f.originalText}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
                        {String(f.normalizedValue)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        P.{f.pageNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                            f.confidence >= 0.95
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {(f.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleFieldReview(f.id, 'accepted')}
                            className={`p-1 rounded ${
                              f.reviewState === 'accepted'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Accept Extracted Field"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFieldReview(f.id, 'flagged')}
                            className={`p-1 rounded ${
                              f.reviewState === 'flagged'
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title="Flag Discrepant Extraction"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {docFields.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No extracted fields found for this document.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: 14-RULE VERIFICATION MATRIX --- */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Comprehensive 14-Rule Verification Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ground-truth evidence citations across survey concordance, unit conversion, EC periods, and geometry
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Discrepancies Flagged:{' '}
              <strong className="text-rose-600">
                {findings.filter((f) => f.outcome === 'Discrepancy').length}
              </strong>
            </div>
          </div>

          <div className="space-y-3">
            {findings.map((f) => (
              <div
                key={f.id}
                className={`p-4 rounded-xl border shadow-2xs transition-all ${
                  f.outcome === 'Discrepancy'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : f.outcome === 'Verified Consistent'
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        f.severity === 'Critical'
                          ? 'bg-rose-600'
                          : f.severity === 'Major'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {f.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">({f.ruleId})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.outcome === 'Verified Consistent'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : f.outcome === 'Discrepancy'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {f.outcome}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {f.ruleCategory}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {f.explanation}
                </p>

                {/* Evidence Citations */}
                {f.evidenceReferences && f.evidenceReferences.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Evidence Cited:
                    </span>
                    {f.evidenceReferences.map((ev, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                      >
                        {ev.label || ev.documentType || 'Evidentiary Reference'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Action & Officer Override Control */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 italic">
                    <strong>Suggested Action:</strong> {f.suggestedAction}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] text-slate-400">Decision:</span>
                    <button
                      onClick={() => handleFindingDecision(f.id, 'Accepted', 'Finding confirmed')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        f.officerDecision === 'Accepted'
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleFindingDecision(f.id, 'Overridden', 'Permissible administrative tolerance')
                      }
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        f.officerDecision === 'Overridden'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Override with Rationale
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: FMB SKETCH & ANALYSIS --- */}
      {activeTab === 'fmb_analysis' && (
        <div className="space-y-4">
          <FmbStudioView initialApplicationId={application.id} />
        </div>
      )}

      {/* --- TAB: MODEL ANALYSIS --- */}
      {activeTab === 'model_analysis' && (
        <div className="space-y-4">
          <ModelAnalysisDashboard applicationId={application.id} />
        </div>
      )}

      {/* --- TAB 4: INTERACTIVE GIS & MAP WORKSPACE --- */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Geospatial Alignment & Cadastral Overlay Workspace</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                MapLibre GL JS • Vector FMB Boundary vs Satellite Imagery • Coordinate System EPSG:4326
              </p>
            </div>
            {parcel && (
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                Centroid: {parcel.centroidCoordinates[0].toFixed(5)}, {parcel.centroidCoordinates[1].toFixed(5)}
              </div>
            )}
          </div>

          <div className="h-[520px] relative">
            <MapComponent
              parcel={parcel}
              activeScenarioId={application.demoScenarioId}
            />
          </div>
        </div>
      )}

      {/* --- TAB 5: FIELD VERIFICATION & GROUND INSPECTIONS --- */}
      {activeTab === 'field_task' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>Field Surveyor Ground Verification Record</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Electronic Total Station measurements, RTK GNSS boundary coordinates, and geotagged photographic evidence
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {fieldTasks[0]?.status || 'Inspection Scheduled'}
              </span>
            </div>

            {fieldTasks.length > 0 ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px]">Assigned Officer</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {fieldTasks[0].assignedOfficerName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Inspection Date</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {new Date(fieldTasks[0].assignedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Station Baseline</span>
                    <div className="font-mono text-emerald-600 font-semibold mt-0.5">
                      Leica TS16 ± 1mm
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Geotagged Photos</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {fieldTasks[0].photos.length} photos verified
                    </div>
                  </div>
                </div>

                {/* Ground Boundary Deviation Table */}
                {fieldTasks[0].groundMeasurements.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      Physical Boundary Measurements vs Documented Extents
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2 px-3">Boundary Traverse</th>
                            <th className="py-2 px-3">Documented (m)</th>
                            <th className="py-2 px-3">Ground Measured (m)</th>
                            <th className="py-2 px-3">Spatial Deviation (m)</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {fieldTasks[0].groundMeasurements.map((m, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-semibold">{m.boundary} Boundary</td>
                              <td className="py-2 px-3 font-mono">{m.documentedMeters.toFixed(1)} m</td>
                              <td className="py-2 px-3 font-mono">{m.groundMeasuredMeters.toFixed(1)} m</td>
                              <td
                                className={`py-2 px-3 font-mono font-bold ${
                                  Math.abs(m.deviationMeters) > 1.0 ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                {m.deviationMeters > 0 ? `+${m.deviationMeters}` : m.deviationMeters} m
                              </td>
                              <td className="py-2 px-3">
                                {Math.abs(m.deviationMeters) > 1.0 ? (
                                  <span className="text-rose-600 font-semibold">Encroachment Suspected</span>
                                ) : (
                                  <span className="text-emerald-600">Within Cadastral Tolerance</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Photos Gallery */}
                {fieldTasks[0].photos.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      Geotagged Field Photographs (RTK GNSS Timestamped)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fieldTasks[0].photos.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40"
                        >
                          <img
                            src={p.url}
                            alt={p.caption}
                            className="w-full h-44 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-3 space-y-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{p.caption}</p>
                            <div className="text-[10px] text-slate-400 font-mono">
                              GPS: {p.gpsCoordinates[0].toFixed(5)}, {p.gpsCoordinates[1].toFixed(5)} • Acc: ±
                              {p.gpsAccuracyMeters}m
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No field tasks currently assigned for this case.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 6: DEPARTMENT COLLABORATION --- */}
      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Inter-Departmental Scrutiny & Evidence Sharing Grants</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Facilitates secure sharing between Revenue, Registration (SRO), Survey & Land Records, Town & Country Planning (DTCP), and Utility Boards
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Active Sharing Grants for this Case:
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Town & Country Planning (DTCP) Regularization Check
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Scope: Registered Sale Deed Schedule & TSLR Map Vector • Granted by DRO
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    Active Read-Only Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 7: AUDIT TRAIL & STATUTORY REPORT --- */}
      {activeTab === 'audit_report' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Statutory Land Document Verification Certificate & Immutable Audit Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cryptographically verifiable record of all automated screening rules, officer determinations, and provenance hashes
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Statutory Certificate (PDF)</span>
            </button>
          </div>

          <div className="p-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg space-y-4 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <div className="text-center space-y-1">
              <div className="text-base font-bold font-tamil text-slate-900 dark:text-white">
                மெய்நிலம் (MeiNilam) • AI-Assisted Land Document Verification
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Verification Certificate Ref: VERIF-2026-CBE-{application.id.slice(-6)}
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300">
                Official human officer validation is mandatory prior to recording any revenue or registration determination.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <strong>Application No:</strong> {application.applicationNumber}
              </div>
              <div>
                <strong>Screening Result:</strong> {application.screeningState}
              </div>
              <div>
                <strong>Applicant:</strong> {application.applicantName}
              </div>
              <div>
                <strong>Survey / Patta:</strong> Sy. {application.surveyNumber}/{application.subdivision} (Patta #{application.pattaNumber})
              </div>
              <div>
                <strong>District & Taluk:</strong> {application.district}, {application.taluk}
              </div>
              <div>
                <strong>Verification Timestamp:</strong> {new Date().toISOString()}
              </div>
            </div>

            {/* Audit event list */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Chronological Event Trail</h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                {auditTrail.map((ev) => (
                  <div key={ev.id} className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ev.action}</span>: {ev.details}
                    </div>
                    <span className="text-slate-400 shrink-0 ml-4">
                      {new Date(ev.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Document Upload Modal */}
      <RealTimeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        applicationId={application.id}
        onUploadSuccess={(data) => {
          loadCaseData();
          if (data.document?.id) {
            setSelectedDocId(data.document.id);
            setActiveTab('documents');
          }
          setSuccessToast(`Document "${data.document?.fileName}" uploaded & parsed in real-time!`);
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />
    </div>
  );
};
