import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Download,
  Eye,
  Layers,
  Sparkles,
  Info,
  Building2,
  FileCode,
  X,
} from 'lucide-react';
import { ApplicationRecord, DocumentType } from '../types';

interface RealTimeUploadCenterProps {
  applications: ApplicationRecord[];
  initialApplicationId?: string;
  onSelectApplication?: (id: string) => void;
  onNavigateToWorkspace?: (id: string) => void;
  onRunVerification?: (id: string) => void;
}

interface ExtractionField {
  id?: string;
  fieldName: string;
  fieldCategory: string;
  originalText: string;
  normalizedValue: string | number;
  pageNumber: number;
  confidence: number;
  reviewState?: 'accepted' | 'flagged';
}

interface UploadProgressState {
  step: 'idle' | 'uploading' | 'hashing' | 'optical_check' | 'extracting' | 'verifying' | 'completed' | 'error';
  percent: number;
  message: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  'Patta / Chitta',
  'Sale Deed',
  'Parent Document / Prior Title Deed',
  'Encumbrance Certificate (EC)',
  'FMB (Field Measurement Book)',
  'TSLR (Town Survey Land Register)',
  'A-Register',
  'Partition Deed',
  'Settlement Deed',
  'Inheritance / Legal Heir Certificate',
  'Property Tax Receipt',
  'Court Order / Restriction Record',
  'Other Supporting Document',
];

const PRESET_SAMPLES = [
  {
    title: 'Registered Sale Deed (Doc #2415/2018)',
    type: 'Sale Deed' as DocumentType,
    fileName: 'Sale_Deed_Perur_2415_2018.pdf',
    size: 2451000,
    text: `GOVERNMENT OF TAMIL NADU REGISTRATION DEPARTMENT
Sub-Registrar Office, Perur, Coimbatore South
Book 1, Document No: 2415 of 2018
Date of Execution: 14-06-2018
Vendor: Thiru. K. Ranganathan, S/o Late Krishnasamy, No. 14, Raja Street, Perur.
Purchaser: Thiru. R. Sundaram, S/o Ramasamy, No. 42, Gandhi Road, Coimbatore.
PROPERTY SCHEDULE:
Registration District: Coimbatore, Sub-District: Perur
Taluk: Coimbatore South, Revenue Village: Perur
Re-Survey No: 142, Subdivision: 3A
Total Extent: 2.45 Acres (equivalent to 106,722 Sq.Ft)
Classification: Ryotwari Punja (Dry Land)
Patta No: 891
BOUNDARIES:
North: Lands belonging to M. Palanisamy in Survey No. 142/2
South: Panchayat Cart Track (Vandi Paathai)
East: Odai Poramboke (Drainage Channel) in Survey No. 143
West: Lands of S. Marimuthu in Survey No. 142/3B
Consideration Amount: Rs. 48,50,000/- (Rupees Forty Eight Lakhs Fifty Thousand only)
Stamp Duty Paid: Rs. 3,39,500/- Registration Fee Paid: Rs. 1,94,000/-`,
  },
  {
    title: 'Tamil Nadu Patta Passbook (#891)',
    type: 'Patta / Chitta' as DocumentType,
    fileName: 'Patta_Extract_Perur_891.pdf',
    size: 512000,
    text: `TAMIL NADU REVENUE DEPARTMENT - ANYWHERE E-SERVICES
Patta Copy (தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா நகல்)
District: Coimbatore (கோயம்புத்தூர்), Taluk: Coimbatore South (கோயம்புத்தூர் தெற்கு)
Village: Perur (பேரூர்), Patta Number: 891
Owner Name: R. Sundaram (ஆர். சுந்தரம்)
Father / Husband: Ramasamy (ராமசாமி)
Survey No: 142, Subdivision: 3A
Wet/Dry: Punja (புஞ்சை), Soil Classification: III-1
Extent: 0.99.15 Hectares (2.45 Acres)
Kist / Land Tax: Rs. 14.50 per annum
Remarks: Direct succession transfer via Registered Sale Deed 2415/2018. No encumbrances recorded in Chitta register.`,
  },
  {
    title: 'FMB Cadastral Sketch (Survey 142)',
    type: 'FMB (Field Measurement Book)' as DocumentType,
    fileName: 'FMB_Cadastral_Perur_142.png',
    size: 1420000,
    text: `SURVEY AND LAND RECORDS DEPARTMENT - FIELD MEASUREMENT BOOK
Village: Perur, Taluk: Coimbatore South, Survey Number: 142
Subdivisions: 1, 2, 3A, 3B, 4
G-Line Ladder Measurements:
Baseline A-B: 240.5 Links, Offset to Triangulation Point C: 42.0 Links
Subdivision 3A Area Computation: 2.45 Acres
Ladder Offsets:
Station 1: 0.0, Offset: 0.0
Station 2: 65.2, Offset: +38.4 (Odai boundary)
Station 3: 145.0, Offset: +41.2
Station 4: 220.8, Offset: -12.5 (Cart Track)
Adjoining Survey Numbers: North: Sy. 141, South: Sy. 148, East: Sy. 143 (Water Body), West: Sy. 139.`,
  },
  {
    title: '30-Year Encumbrance Certificate (EC)',
    type: 'Encumbrance Certificate (EC)' as DocumentType,
    fileName: 'EC_Search_1994_2024_Perur.pdf',
    size: 890000,
    text: `REGISTRATION DEPARTMENT TAMIL NADU - CERTIFICATE OF ENCUMBRANCE ON PROPERTY
Search Period: 01-Jan-1994 to 01-Jan-2024 (30 Years Comprehensive Search)
Village: Perur, Survey Number: 142/3A, Extent: 2.45 Acres
Transaction 1:
Date: 12-03-1996, Doc No: 812/1996, Type: Partition Deed
Parties: Krishnasamy Gounder and sons
Transaction 2:
Date: 14-06-2018, Doc No: 2415/2018, Type: Sale Deed
Executant: K. Ranganathan -> Claimant: R. Sundaram
Consideration: Rs. 48,50,000/-
Transaction 3: NIL
No subsequent mortgages, lis pendens, court attachments, or bank liens indexed.`,
  },
  {
    title: '⚠️ Mismatched Subdivision Sample (Sy. 84/2B Discrepancy)',
    type: 'Sale Deed' as DocumentType,
    fileName: 'Discrepant_Deed_84_2B.pdf',
    size: 1100000,
    text: `REGISTERED SALE DEED SAMPLE WITH DISCREPANCY
Document No: 5412 of 2021
Survey Number claimed: 84/2A
Document body mentions: "Lands situate in Survey No. 84/2B with an extent of 1.10 Acres"
Boundary North: Survey No. 84/1 (Disputed government road poramboke)
Notice: Discrepancy between application survey 84/2A and deed survey 84/2B detected by spatial concordance engine.`,
  },
];

export const RealTimeUploadCenter: React.FC<RealTimeUploadCenterProps> = ({
  applications,
  initialApplicationId,
  onSelectApplication,
  onNavigateToWorkspace,
  onRunVerification,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialApplicationId || (applications.length > 0 ? applications[0].id : '')
  );
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Patta / Chitta');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    step: 'idle',
    percent: 0,
    message: '',
  });

  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [simulatedText, setSimulatedText] = useState<string>('');
  const [uploadedResult, setUploadedResult] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialApplicationId if passed or changed
  useEffect(() => {
    if (initialApplicationId) {
      setSelectedAppId(initialApplicationId);
    } else if (!selectedAppId && applications.length > 0) {
      setSelectedAppId(applications[0].id);
    }
  }, [initialApplicationId, applications]);

  const activeApp = applications.find((a) => a.id === selectedAppId);

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setActiveFile(file);
    setSimulatedText('');
    setUploadedResult(null);
    startRealTimeUpload(file, selectedDocType, undefined);
  };

  const handleSelectPreset = (preset: (typeof PRESET_SAMPLES)[0]) => {
    setSelectedDocType(preset.type);
    setSimulatedText(preset.text);
    setActiveFile(null);
    setUploadedResult(null);

    // Create a virtual file to simulate real upload
    const blob = new Blob([preset.text], { type: 'application/pdf' });
    const virtualFile = new File([blob], preset.fileName, { type: 'application/pdf' });
    startRealTimeUpload(virtualFile, preset.type, preset.text);
  };

  // Real-time Upload & Processing pipeline execution
  const startRealTimeUpload = async (
    fileToUpload: File,
    docType: DocumentType,
    customText?: string
  ) => {
    setUploadProgress({
      step: 'uploading',
      percent: 15,
      message: 'Streaming binary payload & computing SHA-256 cryptographic digest...',
    });

    try {
      // Step 1 & 2: Local hashing simulation / progress
      await new Promise((r) => setTimeout(r, 450));
      setUploadProgress({
        step: 'hashing',
        percent: 35,
        message: 'Binary digest computed. Performing optical DPI and skew layout audit...',
      });

      await new Promise((r) => setTimeout(r, 500));
      setUploadProgress({
        step: 'optical_check',
        percent: 60,
        message: 'Running Gemini Multimodal OCR and structured land entity tokenization...',
      });

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('type', docType);
      formData.append('applicationId', selectedAppId);
      if (customText) {
        formData.append('simulatedText', customText);
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress({
        step: 'extracting',
        percent: 85,
        message: 'Synthesizing bounding boxes and cross-reconciling with statutory registry...',
      });

      await new Promise((r) => setTimeout(r, 400));

      if (!res.ok) {
        throw new Error('Upload failed on server');
      }

      const data = await res.json();

      setUploadProgress({
        step: 'completed',
        percent: 100,
        message: 'Document ingestion, cryptographic seal, and multimodal extraction complete!',
      });

      setUploadedResult(data);
    } catch (err: any) {
      console.error('Real-time upload error:', err);
      setUploadProgress({
        step: 'error',
        percent: 100,
        message: err.message || 'Failed to complete real-time document upload pipeline.',
      });
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadExtractionJson = () => {
    if (!uploadedResult) return;
    const blob = new Blob([JSON.stringify(uploadedResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Extraction_${uploadedResult.document?.fileName || 'document'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Real-Time Document Ingestion & Multimodal Intelligence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                LIVE OCR & STREAM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl">
              Upload statutory deeds, Patta records, FMB sketches, and Encumbrance Certificates. Stream binary payloads with instant SHA-256 provenance hashing, optical geometry validation, and Gemini multimodal entity extraction in real time.
            </p>
          </div>

          {/* Application Association Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                Attach to Case Dossier:
              </span>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="mt-0.5 p-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.applicationNumber} — {app.applicantName} (Sy. {app.surveyNumber}/{app.subdivision})
                  </option>
                ))}
              </select>
            </div>

            {activeApp && onNavigateToWorkspace && (
              <button
                onClick={() => onNavigateToWorkspace(activeApp.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors"
                title="Open this application's case dossier"
              >
                <span>Open Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Upload Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-Time Drop Zone & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Document Type Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statutory Document Classification</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Select Category</span>
            </div>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3.5 min-h-[260px] ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 shadow-2xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp,.json,.geojson,.txt"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Drag & Drop Land Document Here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                or <span className="text-emerald-700 dark:text-emerald-400 font-semibold underline">browse from your computer</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {['PDF', 'PNG', 'JPEG', 'TIFF', 'GEOJSON'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-[10px] text-slate-400 ml-1">Up to 25 MB</span>
            </div>

            {activeFile && (
              <div className="w-full mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeFile.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                  {(activeFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          {/* Quick-Test Preset Evidentiary Samples */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant 1-Click Test Samples</span>
              </h3>
              <span className="text-[10px] text-slate-400">Click to run real-time ingest</span>
            </div>

            <div className="space-y-2">
              {PRESET_SAMPLES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-start justify-between group"
                >
                  <div className="flex items-start space-x-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {preset.type} • {(preset.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                    Run Ingest →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-Time Stream Status & Ingested Document Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Real-time Progress Pipeline Tracker */}
          {uploadProgress.step !== 'idle' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {uploadProgress.step === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : uploadProgress.step === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  )}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {uploadProgress.step === 'completed'
                      ? 'Ingestion Pipeline Succeeded'
                      : uploadProgress.step === 'error'
                      ? 'Pipeline Error'
                      : 'Real-Time Streaming & AI Parsing'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {uploadProgress.percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadProgress.step === 'error'
                      ? 'bg-rose-600'
                      : uploadProgress.step === 'completed'
                      ? 'bg-emerald-600'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{uploadProgress.message}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                  Stage: {uploadProgress.step}
                </span>
              </div>
            </div>
          )}

          {/* Results Panel */}
          {uploadedResult ? (
            <div className="space-y-5">
              {/* Provenance & Cryptographic Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Evidentiary Record Sealed
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {uploadedResult.document?.fileName || 'Uploaded_Document.pdf'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {uploadedResult.document?.type || selectedDocType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {(uploadedResult.document?.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cryptographic SHA-256 Binary Hash</span>
                    </span>
                    <button
                      onClick={() => handleCopyHash(uploadedResult.document?.checksumSha256 || '')}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all">
                    {uploadedResult.document?.checksumSha256 || 'N/A'}
                  </div>
                </div>

                {/* Optical & Extraction Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Processing Engine</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize text-[11px]">
                      {uploadedResult.extraction?.processingSource === 'gemini_multimodal'
                        ? 'Gemini Multimodal'
                        : 'OCR Deterministic'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Optical Resolution</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {uploadedResult.qualityReport?.resolutionDpi || 300} DPI
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Skew Detection</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {uploadedResult.qualityReport?.skewAngleDegrees || 0.0}° (Aligned)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Quality Assessment</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                      {uploadedResult.qualityReport?.readabilityGrade || 'Grade A'}
                    </span>
                  </div>
                </div>

                {/* Discrepancy Alerts against Active Application */}
                {uploadedResult.discrepancies && uploadedResult.discrepancies.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                    <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Real-Time Statutory Concordance Observations:</span>
                    </div>
                    {uploadedResult.discrepancies.map((msg: string, i: number) => (
                      <p key={i} className="text-amber-800 dark:text-amber-200 text-[11px] pl-5">
                        • {msg}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Structured Properties Table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        Structured Metadata Properties (
                        {uploadedResult.extraction?.fields?.length || 0})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Extracted values preserved in native script and normalized for algorithmic cross-checks
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadExtractionJson}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">Field Name</th>
                        <th className="py-2.5 px-3">Original Extracted Text</th>
                        <th className="py-2.5 px-3">Normalized Value</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3 text-right">Review State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {uploadedResult.extraction?.fields?.map((f: ExtractionField, i: number) => {
                        const isHigh = f.confidence >= 0.85;
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              <div>{f.fieldName}</div>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {f.fieldCategory}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-tamil max-w-xs truncate">
                              {f.originalText}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                              {String(f.normalizedValue)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isHigh
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {(f.confidence * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {isHigh ? 'Auto Verified' : 'Flagged for Officer'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Action Callouts */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Saved directly to dossier <strong className="text-slate-800 dark:text-slate-200">{activeApp?.applicationNumber}</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onRunVerification && activeApp && (
                      <button
                        onClick={() => onRunVerification(activeApp.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run 14-Rule Verification Now</span>
                      </button>
                    )}

                    {onNavigateToWorkspace && activeApp && (
                      <button
                        onClick={() => onNavigateToWorkspace(activeApp.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <span>Open Case Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center flex flex-col items-center justify-center space-y-3 min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Ingestion Console Ready
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  Select a document file or click any preset sample on the left to initiate real-time byte streaming, optical quality checks, and multimodal extraction.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
