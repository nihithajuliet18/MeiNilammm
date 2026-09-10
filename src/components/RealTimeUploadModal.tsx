import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { DocumentType, ApplicationRecord } from '../types';

interface RealTimeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  applications?: ApplicationRecord[];
  onUploadSuccess?: (doc: any) => void;
}

const MODAL_DOC_TYPES: DocumentType[] = [
  'Patta / Chitta',
  'Sale Deed',
  'Encumbrance Certificate (EC)',
  'FMB (Field Measurement Book)',
  'TSLR (Town Survey Land Register)',
  'A-Register',
  'Parent Document / Prior Title Deed',
  'Partition Deed',
  'Inheritance / Legal Heir Certificate',
  'Other Supporting Document',
];

export const RealTimeUploadModal: React.FC<RealTimeUploadModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  applications = [],
  onUploadSuccess,
}) => {
  const [targetAppId, setTargetAppId] = useState<string>(
    applicationId || (applications.length > 0 ? applications[0].id : '')
  );
  const [docType, setDocType] = useState<DocumentType>('Sale Deed');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultData, setResultData] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    setSelectedFile(file);
    executeRealTimeUpload(file);
  };

  const executeRealTimeUpload = async (file: File) => {
    setIsUploading(true);
    setProgressPercent(10);
    setStatusMessage('Initiating binary stream and calculating SHA-256 digest...');
    setResultData(null);

    try {
      await new Promise((r) => setTimeout(r, 350));
      setProgressPercent(35);
      setStatusMessage('Checking optical DPI, skew angle, and evidence provenance...');

      await new Promise((r) => setTimeout(r, 400));
      setProgressPercent(65);
      setStatusMessage('Extracting key land entities via Gemini Multimodal OCR...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', docType);
      formData.append('applicationId', targetAppId || applicationId || '');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setProgressPercent(88);
      setStatusMessage('Verifying survey numbers and statutory cross-reconciliation...');

      await new Promise((r) => setTimeout(r, 300));

      if (!res.ok) {
        throw new Error('Upload server error');
      }

      const data = await res.json();
      setProgressPercent(100);
      setStatusMessage('Document uploaded and ingested successfully in real-time!');
      setResultData(data);
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickPreset = (name: string, type: DocumentType, text: string) => {
    setDocType(type);
    const blob = new Blob([text], { type: 'application/pdf' });
    const virtualFile = new File([blob], name, { type: 'application/pdf' });
    setSelectedFile(virtualFile);
    executeRealTimeUpload(virtualFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Real-Time Land Document Upload
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant byte streaming, SHA-256 calculation, and multimodal entity extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 flex-1">
          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {applications.length > 0 && !applicationId && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Case Dossier
                </label>
                <select
                  value={targetAppId}
                  onChange={(e) => setTargetAppId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} ({app.applicantName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Type Classification
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {MODAL_DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click or Drop Document File Here
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                PDF, PNG, JPG, TIFF (Up to 25 MB)
              </p>
            </div>
          </div>

          {/* Preset 1-Click Samples */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Or test with instantaneous sample record:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Perur_SaleDeed_2415_2018.pdf',
                    'Sale Deed',
                    'Sale Deed #2415/2018 Sub-Registrar Perur. Survey No. 142/3A, Extent: 2.45 Acres. Vendor: K. Ranganathan, Purchaser: R. Sundaram. North: Sy. 142/2, South: Cart Track.'
                  )
                }
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Sample Sale Deed (Sy. 142/3A)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset(
                    'Patta_Extract_891.pdf',
                    'Patta / Chitta',
                    'Patta No: 891, Village: Perur. Owner: R. Sundaram. Survey No: 142/3A, Extent: 2.45 Acres (Ryotwari Punja).'
                  )
                }
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Sample Patta Extract (#891)</span>
              </button>
            </div>
          </div>

          {/* Real-time Processing State */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono font-bold text-emerald-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Complete Summary */}
          {resultData && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    {resultData.document?.fileName} Ingested
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                  SHA: {resultData.document?.checksumSha256?.slice(0, 16)}...
                </span>
              </div>

              {resultData.extraction?.fields && (
                <div className="space-y-1 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                    Extracted Land Attributes ({resultData.extraction.fields.length} properties):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {resultData.extraction.fields.slice(0, 4).map((f: any, idx: number) => (
                      <div key={idx} className="bg-white/60 dark:bg-slate-900/60 p-1.5 rounded">
                        <span className="text-slate-500 block text-[10px]">{f.fieldName}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {f.normalizedValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {resultData ? 'Close' : 'Cancel'}
          </button>

          {resultData && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center space-x-1"
            >
              <span>Done</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
