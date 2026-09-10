import React, { useState, useEffect } from 'react';
import {
  FmbDocumentAnalysis,
  FmbMeasurementItem,
  FmbFieldEvidence,
  Application,
  UserRole,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FmbDocumentViewer } from './fmb/FmbDocumentViewer';
import { FmbReviewModal } from './fmb/FmbReviewModal';
import { FmbReportView } from './fmb/FmbReportView';
import {
  Upload,
  FileText,
  Compass,
  Ruler,
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Building2,
  Clock,
  Printer,
  FileSpreadsheet,
  FileJson,
  Edit3,
  RefreshCw,
  Info,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Check,
  X,
  Sliders,
  Sparkles,
  Columns,
} from 'lucide-react';

interface FmbStudioViewProps {
  initialApplicationId?: string;
  applications?: Application[];
  onNavigateToCase?: (appId: string) => void;
  className?: string;
}

export const FmbStudioView: React.FC<FmbStudioViewProps> = ({
  initialApplicationId,
  applications = [],
  onNavigateToCase,
  className = '',
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [selectedAppId, setSelectedAppId] = useState<string>(initialApplicationId || '');
  const [fmbAnalyses, setFmbAnalyses] = useState<FmbDocumentAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FmbDocumentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'details' | 'measurements' | 'parcels' | 'findings' | 'cross_doc' | 'reviews' | 'report'
  >('overview');

  // Interactive connection state: selected measurement or point
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);
  const [selectedPointLabel, setSelectedPointLabel] = useState<string | null>(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetType, setReviewTargetType] = useState<'measurement' | 'field' | 'unit'>('measurement');
  const [reviewTargetId, setReviewTargetId] = useState<string>('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStep, setUploadProgressStep] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<boolean>(false);

  // Measurements table filter & search
  const [measurementTypeFilter, setMeasurementTypeFilter] = useState<string>('all');
  const [measurementSearch, setMeasurementSearch] = useState<string>('');

  // Plain-language explanation language toggle
  const [explanationLang, setExplanationLang] = useState<'en' | 'ta'>('en');

  // Load existing FMB analyses from server
  const loadAnalyses = async () => {
    try {
      const url = selectedAppId ? `/api/fmb?applicationId=${selectedAppId}` : '/api/fmb';
      const res = await fetch(url);
      if (res.ok) {
        const data: FmbDocumentAnalysis[] = await res.json();
        setFmbAnalyses(data);
        if (data.length > 0 && (!selectedAnalysis || !data.some(a => a.id === selectedAnalysis.id))) {
          setSelectedAnalysis(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load FMB analyses:', e);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, [selectedAppId]);

  // Handle uploading FMB file
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setDuplicateNotice(false);

    // Progress simulation through mandatory pipeline steps
    setUploadProgressStep('Uploading & validating file format...');
    await new Promise(r => setTimeout(r, 400));
    setUploadProgressStep('Calculating SHA-256 vault checksum & detecting duplicates...');
    await new Promise(r => setTimeout(r, 400));
    setUploadProgressStep('Reading pages & calibrating high-contrast raster...');
    await new Promise(r => setTimeout(r, 500));
    setUploadProgressStep('Gemini Multimodal: Extracting title block, survey stones & notes...');
    await new Promise(r => setTimeout(r, 600));
    setUploadProgressStep('Cadastral Geometry: Ladder triangulation & perimeter closure...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedAppId) {
        formData.append('applicationId', selectedAppId);
      }

      const res = await fetch('/api/fmb/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload and analyze FMB');
      }

      const data = await res.json();
      setUploadProgressStep('Verification complete. Preparing analysis report...');
      await new Promise(r => setTimeout(r, 300));

      if (data.duplicateDetected) {
        setDuplicateNotice(true);
      }

      // Refresh list and select new analysis
      await loadAnalyses();
      setSelectedAnalysis(data.analysis);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      setUploadProgressStep('');
    }
  };

  // Load sample fixture
  const handleLoadSampleFixture = async (fixtureKey: string) => {
    setIsUploading(true);
    setUploadProgressStep(`Loading sample fixture: ${fixtureKey}...`);

    try {
      const res = await fetch(`/api/fmb/sample/${fixtureKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selectedAppId || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        await loadAnalyses();
        setSelectedAnalysis(data.analysis);
        setActiveTab('overview');
      }
    } catch (e) {
      console.error('Failed to load sample fixture:', e);
    } finally {
      setIsUploading(false);
      setUploadProgressStep('');
    }
  };

  // Trigger officer correction modal
  const openCorrectionModal = (type: 'measurement' | 'field' | 'unit', id: string) => {
    setReviewTargetType(type);
    setReviewTargetId(id);
    setIsReviewModalOpen(true);
  };

  const handleReviewSaved = (updated: FmbDocumentAnalysis) => {
    setSelectedAnalysis(updated);
    setFmbAnalyses(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  };

  // Filtered measurements
  const filteredMeasurements = (selectedAnalysis?.measurements || []).filter(m => {
    if (measurementTypeFilter !== 'all' && m.type !== measurementTypeFilter) return false;
    if (measurementSearch.trim()) {
      const q = measurementSearch.toLowerCase();
      return (
        m.fromPoint.toLowerCase().includes(q) ||
        m.toPoint.toLowerCase().includes(q) ||
        m.rawNotation.toLowerCase().includes(q) ||
        String(m.parsedNumericValue).includes(q) ||
        m.interpretationStatus.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={`space-y-4 select-none ${className}`}>
      {/* Top Application Bar & Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  புலப்பட புத்தகம் (Field Measurement Book) Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Cadastral Vision Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated sketch understanding, ladder triangulation, boundary closure & discrepancy verification
              </p>
            </div>
          </div>

          {/* Quick Actions & Fixture Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Case selector */}
            {applications.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Linked Case:</span>
                <select
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="">All / Standalone Documents</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} ({app.applicantName} - Sy {app.surveyNumber}/{app.subdivision})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Preloaded Sample Fixtures */}
            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Walkthrough Fixtures:</span>
              <button
                onClick={() => handleLoadSampleFixture('fmb_sample_perur_142_3a')}
                className="px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                title="Perur 142/3A: Rural G-line & Ladder Offsets"
              >
                Perur 142/3A
              </button>
              <button
                onClick={() => handleLoadSampleFixture('fmb_sample_kuniyamuthur_84_2b')}
                className="px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                title="Kuniyamuthur 84/2B: Subdivision with Channel"
              >
                Kuniyamuthur 84/2B
              </button>
              <button
                onClick={() => handleLoadSampleFixture('fmb_sample_peelamedu_urban_tslr')}
                className="px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                title="Peelamedu Block 12: Urban TSLR Metric"
              >
                Urban TSLR
              </button>
              <button
                onClick={() => handleLoadSampleFixture('fmb_sample_weathered_unreadable')}
                className="px-2 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-950 text-[11px] font-semibold text-amber-700 dark:text-amber-300 transition-colors"
                title="Kalangal 195: Weathered Faded Ink Scan"
              >
                Weathered Scan
              </button>
            </div>

            {/* Direct Upload Button */}
            <label className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer transition-all shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload FMB Scan</span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Upload Processing Progress Bar */}
        {isUploading && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{uploadProgressStep}</span>
              </div>
              <span className="font-mono">Processing...</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Duplicate Notice */}
        {duplicateNotice && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Duplicate File Detected:</strong> An exact cryptographic match (SHA-256) already exists in the system vault. Existing evidence has been linked.
              </span>
            </div>
            <button onClick={() => setDuplicateNotice(false)} className="p-1 text-amber-700 hover:bg-amber-100 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upload Error Notice */}
        {uploadError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button onClick={() => setUploadError(null)} className="p-1 text-rose-700 hover:bg-rose-100 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Document Selector Pills if multiple FMBs exist */}
        {fmbAnalyses.length > 1 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Archived FMBs ({fmbAnalyses.length}):</span>
            {fmbAnalyses.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAnalysis(a)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedAnalysis?.id === a.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="w-3 h-3 text-emerald-500" />
                <span>
                  {a.identification?.village?.normalizedValue || 'Village'} Sy {a.identification?.surveyNumber?.normalizedValue}/{a.identification?.subdivisionNumber?.normalizedValue}
                </span>
                {a.isSampleFixture && (
                  <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded">Fixture</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split-Screen Workspace */}
      {selectedAnalysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
          {/* Left Column: Interactive Document & Cadastral Vector Viewer (5 cols) */}
          <div className="lg:col-span-5 h-[620px] lg:h-[780px] sticky top-4">
            <FmbDocumentViewer
              analysis={selectedAnalysis}
              selectedMeasurementId={selectedMeasurementId}
              onSelectMeasurement={id => {
                setSelectedMeasurementId(id);
                setActiveTab('measurements');
              }}
              onSelectPoint={label => {
                setSelectedPointLabel(label);
                setMeasurementSearch(label);
                setActiveTab('measurements');
              }}
              className="h-full shadow-lg"
            />
          </div>

          {/* Right Column: 8 Tabbed Analysis Panels (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Tab Navigation Header */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center space-x-1 overflow-x-auto text-xs pb-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'details', label: 'Document Details', icon: FileText },
                  { id: 'measurements', label: `Measurements (${selectedAnalysis.measurements.length})`, icon: Ruler },
                  { id: 'parcels', label: 'Sketch & Parcels', icon: Compass },
                  { id: 'findings', label: `Findings (${selectedAnalysis.findings.length})`, icon: AlertTriangle },
                  { id: 'cross_doc', label: 'Cross-Doc Check', icon: ShieldCheck },
                  { id: 'reviews', label: `Officer Review (${selectedAnalysis.humanReviews?.length || 0})`, icon: Edit3 },
                  { id: 'report', label: 'Cadastral Report', icon: FileSpreadsheet },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
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

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Metric Cards Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      Pages Processed
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedAnalysis.pageCount} / {selectedAnalysis.pageCount}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ✓ 100% Ingested
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      Identified Survey
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 truncate">
                      {selectedAnalysis.identification?.surveyNumber?.normalizedValue}/{selectedAnalysis.identification?.subdivisionNumber?.normalizedValue}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {selectedAnalysis.identification?.village?.normalizedValue}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      Readable Dimensions
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedAnalysis.measurements.length}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedAnalysis.identification?.measurementUnit?.normalizedValue || 'Metres'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      Geometric Checks
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                      {selectedAnalysis.measurementChecks.filter(c => c.status === 'Pass').length}/{selectedAnalysis.measurementChecks.length}
                    </div>
                    <div className="text-[10px] text-slate-500">Passed Deterministic</div>
                  </div>
                </div>

                {/* Plain-Language Explanation Block ("Understand this FMB") */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Understand this FMB • புலப்பட வரைபட விளக்கம்
                      </h2>
                    </div>
                    <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                      <button
                        onClick={() => setExplanationLang('en')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          explanationLang === 'en' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setExplanationLang('ta')}
                        className={`px-2 py-0.5 rounded font-bold font-serif transition-all ${
                          explanationLang === 'ta' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        தமிழ்
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {explanationLang === 'en'
                      ? selectedAnalysis.sketchInterpretation.plainEnglishExplanation
                      : selectedAnalysis.sketchInterpretation.plainTamilExplanation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Communicated by Sketch:</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedAnalysis.sketchInterpretation.sketchCommunicates}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Physical Features Mapped:</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedAnalysis.sketchInterpretation.physicalFeaturesLabelled.join(', ') || 'Boundary stones'}
                      </div>
                    </div>
                  </div>

                  {selectedAnalysis.sketchInterpretation.uncertainDetails.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                      <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Uncertainties & Recommended Verification:</span>
                      </div>
                      <ul className="list-disc list-inside text-amber-800 dark:text-amber-300 text-[11px] space-y-0.5">
                        {selectedAnalysis.sketchInterpretation.uncertainDetails.map((unc, idx) => (
                          <li key={idx}>{unc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Deterministic Calculations Summary */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    <span>Deterministic Geometric & Cadastral Calculations</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {selectedAnalysis.geometryCalculations.slice(0, 3).map(calc => (
                      <div
                        key={calc.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1"
                      >
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {calc.target}
                        </div>
                        <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {calc.resultValue !== undefined ? calc.resultValue.toLocaleString() : 'N/A'}{' '}
                          <span className="text-xs font-normal text-slate-500">{calc.resultUnit}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate" title={calc.methodFormula}>
                          {calc.methodFormula}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    <strong>Statutory Rule:</strong> FMB analysis assists review and screening. It does not certify ownership, legal title, or boundary demarcations.
                  </span>
                  <button
                    onClick={() => setActiveTab('report')}
                    className="text-emerald-600 font-bold hover:underline shrink-0 ml-2"
                  >
                    View Official Report →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DOCUMENT DETAILS */}
            {activeTab === 'details' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Document Identification & Administrative Metadata
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Extracted title block, village identifiers, scale, unit, and surveyor designations
                    </p>
                  </div>
                  <button
                    onClick={() => openCorrectionModal('unit', 'measurementUnit')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Override Global Units</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedAnalysis.identification || {}).map(([key, f]: [string, FmbFieldEvidence]) => {
                    const isConfirmed = f.status === 'Officer-confirmed';
                    return (
                      <div
                        key={key}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-xs space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                            {f.fieldName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {f.status}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {f.officerCorrection || f.normalizedValue}
                          </div>
                          {f.originalText && f.originalText !== f.normalizedValue && (
                            <div className="text-[11px] text-slate-500 font-serif mt-0.5">
                              Written: "{f.originalText}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-400">
                          <span>Page {f.pageNumber} • {f.extractionProvider}</span>
                          <button
                            onClick={() => openCorrectionModal('field', key)}
                            className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                          >
                            Edit / Correct
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MEASUREMENTS */}
            {activeTab === 'measurements' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search points (A, B) or notation..."
                        value={measurementSearch}
                        onChange={e => setMeasurementSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-48 text-slate-900 dark:text-white"
                      />
                    </div>
                    <select
                      value={measurementTypeFilter}
                      onChange={e => setMeasurementTypeFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">All Types</option>
                      <option value="boundary">Boundary Lines</option>
                      <option value="baseline">Baselines (G-Line)</option>
                      <option value="offset">Offsets (F-Line)</option>
                    </select>
                  </div>

                  <div className="text-xs text-slate-500">
                    Showing {filteredMeasurements.length} of {selectedAnalysis.measurements.length} measurements
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="p-2.5">From → To</th>
                        <th className="p-2.5">Notation As Written</th>
                        <th className="p-2.5">Parsed Numeric</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Interpretation</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {filteredMeasurements.map(m => {
                        const isSelected = selectedMeasurementId === m.id;
                        return (
                          <tr
                            key={m.id}
                            onClick={() => setSelectedMeasurementId(m.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white font-bold'
                                : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="p-2.5">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                {m.fromPoint} → {m.toPoint}
                              </span>
                            </td>
                            <td className="p-2.5">{m.rawNotation}</td>
                            <td className="p-2.5 font-bold">
                              {m.reviewerCorrection?.value ?? m.parsedNumericValue}
                            </td>
                            <td className="p-2.5 text-slate-500">
                              {m.reviewerCorrection?.unit ?? m.unit}
                            </td>
                            <td className="p-2.5 font-sans">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  m.type === 'boundary'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : m.type === 'baseline'
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                    : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                                }`}
                              >
                                {m.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-sans">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  m.interpretationStatus === 'Verified'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : m.interpretationStatus === 'Officer corrected'
                                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {m.interpretationStatus}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-sans">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  openCorrectionModal('measurement', m.id);
                                }}
                                className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline text-[11px]"
                              >
                                Correct
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: SKETCH & PARCELS */}
            {activeTab === 'parcels' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Cadastral Parcels & Adjacent Adjoiners Breakdown
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Subdivisions identified within sheet, stated extents, and neighboring survey parcels
                  </p>
                </div>

                {selectedAnalysis.parcels.map((parcel, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                          Subdivision: {parcel.parcelNumber}/{parcel.subdivision}
                        </span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-medium">
                          {parcel.classificationShown || 'Ryotwari Punja'}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        Stated: {parcel.statedAreaRaw}
                      </div>
                    </div>

                    {/* Adjacent Boundaries Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold">North (வடக்கு):</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {parcel.adjoiningNorth}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold">South (தெற்கு):</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {parcel.adjoiningSouth}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold">East (கிழக்கு):</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {parcel.adjoiningEast}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold">West (மேற்கு):</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {parcel.adjoiningWest}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                      <span>Boundary Traverse Loop:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {parcel.boundaryPointLabels.join(' → ')} → {parcel.boundaryPointLabels[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: FINDINGS */}
            {activeTab === 'findings' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Verification Findings & Uncertainty Screening ({selectedAnalysis.findings.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Deterministic checks against boundary closure, self-intersection, and extent tolerances
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedAnalysis.findings.map(f => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border ${
                        f.severity === 'Critical'
                          ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900'
                          : f.severity === 'Major'
                          ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-800'
                      } space-y-2 text-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400">
                            {f.ruleId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : f.severity === 'Major'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">{f.category}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {f.title}
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                        {f.explanation}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Source: {f.sourceEvidence}</span>
                        {f.recommendedAction && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Action: {f.recommendedAction}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: CROSS-DOCUMENT COMPARISON */}
            {activeTab === 'cross_doc' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Cross-Document Concordance Matrix
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Reconciliation of FMB survey dimensions against Registered Sale Deed, Patta, EC, and A-Register
                  </p>
                </div>

                {selectedAnalysis.crossDocComparison ? (
                  <div className="space-y-3 text-xs">
                    {/* Location Match */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Administrative Hierarchy & Location
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {selectedAnalysis.crossDocComparison.details.locationMatch}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {selectedAnalysis.crossDocComparison.locationMatch}
                      </span>
                    </div>

                    {/* Survey Number Match */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Survey Number & Subdivision Concordance
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {selectedAnalysis.crossDocComparison.details.surveyNumberMatch}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {selectedAnalysis.crossDocComparison.surveyNumberMatch}
                      </span>
                    </div>

                    {/* Extent Comparison */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Extent & Area Reconciliation (0.5% Tolerance)
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {selectedAnalysis.crossDocComparison.details.extentComparison}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedAnalysis.crossDocComparison.extentMatch === 'Match'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {selectedAnalysis.crossDocComparison.extentMatch}
                      </span>
                    </div>

                    {/* Four Boundaries Comparison */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Four Boundaries (சதுர் எல்லை) Match
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {selectedAnalysis.crossDocComparison.details.boundariesMatch}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {selectedAnalysis.crossDocComparison.boundariesMatch}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Link this FMB to an active case above to run automated cross-document comparison.
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: OFFICER REVIEWS & CORRECTIONS */}
            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Officer Corrections & Statutory Rectification Audit Trail
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Every human edit records original value, rectified value, statutory justification, and officer designation
                    </p>
                  </div>
                  <button
                    onClick={() => openCorrectionModal('measurement', selectedAnalysis.measurements[0]?.id || '')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Submit Correction</span>
                  </button>
                </div>

                {selectedAnalysis.humanReviews && selectedAnalysis.humanReviews.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                    {selectedAnalysis.humanReviews.map(rev => (
                      <div key={rev.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {rev.targetType.toUpperCase()}: [{rev.targetId}]
                          </span>
                          <span className="text-[10px] text-slate-400">
                            v{rev.analysisVersion} • {new Date(rev.reviewedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="line-through text-slate-400">{rev.originalValue}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {rev.correctedValue}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          <strong>Justification:</strong> {rev.reason}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Reviewed By: <strong>{rev.reviewedBy}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      No manual officer corrections recorded yet.
                    </p>
                    <p className="text-[11px] max-w-sm mx-auto">
                      All measurements and identification parameters currently reflect the automated multimodal cadastral extraction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: FORMAL CADASTRAL REPORT */}
            {activeTab === 'report' && (
              <div className="animate-in fade-in duration-150">
                <FmbReportView analysis={selectedAnalysis} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Compass className="w-10 h-10 text-emerald-600 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Field Measurement Book Document Loaded
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload an FMB PDF or image scan, or pick one of the 4 pre-configured walkthrough sample fixtures above.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => handleLoadSampleFixture('fmb_sample_perur_142_3a')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Load Perur 142/3A Fixture
            </button>
          </div>
        </div>
      )}

      {/* Officer Review Modal */}
      {selectedAnalysis && (
        <FmbReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          analysis={selectedAnalysis}
          initialTargetType={reviewTargetType}
          initialTargetId={reviewTargetId}
          onSaveSuccess={handleReviewSaved}
        />
      )}
    </div>
  );
};
