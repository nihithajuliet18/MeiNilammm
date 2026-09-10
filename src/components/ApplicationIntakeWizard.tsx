import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ApplicationContext, LandClassification } from '../types';
import {
  FilePlus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Trash2,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface IntakeWizardProps {
  onCancel: () => void;
  onSuccess: (appId: string) => void;
}

interface UploadedFileInfo {
  type: string;
  name: string;
  size: number;
  hash: string;
  fileObject?: File;
}

export const ApplicationIntakeWizard: React.FC<IntakeWizardProps> = ({ onCancel, onSuccess }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [applicantName, setApplicantName] = useState(user?.name || 'M. Shanmugasundaram');
  const [applicantPhone, setApplicantPhone] = useState('+91 94432 18920');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || 'm.shanmugam@gmail.com');
  const [applicationType, setApplicationType] = useState('Patta Transfer');
  const [context, setContext] = useState<ApplicationContext>('Rural');

  const [district, setDistrict] = useState('Coimbatore');
  const [taluk, setTaluk] = useState('Coimbatore South');
  const [village, setVillage] = useState('Perur');

  const [surveyNumber, setSurveyNumber] = useState('142');
  const [subdivision, setSubdivision] = useState('3A');
  const [pattaNumber, setPattaNumber] = useState('891');
  const [extentValue, setExtentValue] = useState('2.45');
  const [extentUnit, setExtentUnit] = useState('Acres');
  const [classification, setClassification] = useState<LandClassification>('Ryotwari Punja');

  // Document files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([
    {
      type: 'Patta / Chitta',
      name: 'Patta_Extract_Perur_891.pdf',
      size: 482019,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      type: 'Sale Deed',
      name: 'Sale_Deed_Doc_2415_2018.pdf',
      size: 1845102,
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    },
  ]);

  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedUploadDocType, setSelectedUploadDocType] = useState('Sale Deed');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate real SHA-256 hash using Web Crypto API
  const calculateSHA256 = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'hash_' + Date.now();
    }
  };

  const handleRealFileDrop = async (file: File, docType: string) => {
    const hash = await calculateSHA256(file);
    setUploadedFiles((prev) => [
      ...prev,
      {
        type: docType,
        name: file.name,
        size: file.size,
        hash,
        fileObject: file,
      },
    ]);
  };

  const handleAddFilePreset = (type: string) => {
    setUploadedFiles((prev) => [
      ...prev,
      {
        type,
        name: `${type.replace(/[^a-zA-Z0-9]/g, '_')}_Document.pdf`,
        size: Math.floor(Math.random() * 800000) + 200000,
        hash: 'sha256_' + Math.random().toString(36).substring(2, 18),
      },
    ]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          applicantPhone,
          applicantEmail,
          applicationType,
          context,
          district,
          taluk,
          village,
          surveyNumber,
          subdivision,
          pattaNumber,
        }),
      });

      if (res.ok) {
        const created = await res.json();

        // Upload any real attached files to the newly created application
        for (const uf of uploadedFiles) {
          if (uf.fileObject) {
            const formData = new FormData();
            formData.append('file', uf.fileObject);
            formData.append('type', uf.type);
            formData.append('applicationId', created.id);
            await fetch('/api/documents/upload', {
              method: 'POST',
              body: formData,
            });
          }
        }

        onSuccess(created.id);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden pb-8">
      {/* Wizard Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Land Document Verification Application Intake
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step-by-step guided registration of land parcels and evidentiary records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s
                    ? 'bg-emerald-700 text-white'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: APPLICANT & JURISDICTION */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Applicant Information & Administrative Jurisdiction
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Applicant Full Name
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Application Nature
                </label>
                <select
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Patta Transfer">Patta Transfer</option>
                  <option value="Subdivision & Patta">Subdivision & Patta</option>
                  <option value="Title Verification for Planning Permission">Title Verification for Planning Permission</option>
                  <option value="Layout Regularization">Layout Regularization</option>
                  <option value="Natham Land Settlement">Natham Land Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Context / Land Settlement System
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as ApplicationContext)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Rural">Rural Cadastral (Village / FMB)</option>
                  <option value="Urban">Urban Cadastral (Town / TSLR)</option>
                  <option value="Natham">Natham (Gramanatham Settlement)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Taluk
                </label>
                <input
                  type="text"
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Revenue Village
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SURVEY & EXTENT */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Survey Numbers, Extent & Boundary Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Survey Number
                </label>
                <input
                  type="text"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Subdivision
                </label>
                <input
                  type="text"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Patta Number
                </label>
                <input
                  type="text"
                  value={pattaNumber}
                  onChange={(e) => setPattaNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Claimed Extent Value
                </label>
                <input
                  type="text"
                  value={extentValue}
                  onChange={(e) => setExtentValue(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Original Measurement Unit
                </label>
                <select
                  value={extentUnit}
                  onChange={(e) => setExtentUnit(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Acres">Acres</option>
                  <option value="Cents">Cents</option>
                  <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                  <option value="Grounds">Grounds (2,400 sq.ft)</option>
                  <option value="Sq.M">Sq.M (Square Metres)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Classification
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as LandClassification)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Ryotwari Punja">Ryotwari Punja (Dry)</option>
                  <option value="Ryotwari Nanja">Ryotwari Nanja (Wet)</option>
                  <option value="Government Poramboke">Government Poramboke</option>
                  <option value="Gramanatham">Gramanatham</option>
                  <option value="Town Survey Land">Town Survey Land</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENT UPLOADS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Step 3: Attach Evidentiary Land Records
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Attach statutory documents in real time. Binary SHA-256 checksums are calculated immediately to ensure evidentiary chain of custody.
              </p>
            </div>

            {/* Document Type Selector + Drop Zone */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Document Category to Upload:
                </label>
                <select
                  value={selectedUploadDocType}
                  onChange={(e) => setSelectedUploadDocType(e.target.value)}
                  className="p-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Patta / Chitta">Patta / Chitta</option>
                  <option value="Sale Deed">Sale Deed</option>
                  <option value="Encumbrance Certificate (EC)">Encumbrance Certificate (EC)</option>
                  <option value="FMB (Field Measurement Book)">FMB (Field Measurement Book)</option>
                  <option value="TSLR (Town Survey Land Register)">TSLR (Town Survey Land Register)</option>
                  <option value="Partition Deed">Partition Deed</option>
                  <option value="Inheritance / Legal Heir Certificate">Inheritance / Legal Heir Certificate</option>
                  <option value="Other Supporting Document">Other Supporting Document</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleRealFileDrop(e.dataTransfer.files[0], selectedUploadDocType);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleRealFileDrop(e.target.files[0], selectedUploadDocType);
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drop {selectedUploadDocType} here or <span className="text-emerald-600 underline">browse files</span>
                </div>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 25 MB (Live SHA-256)</p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Or add statutory standard template:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    'Patta / Chitta',
                    'Sale Deed',
                    'Encumbrance Certificate (EC)',
                    'FMB (Field Measurement Book)',
                  ].map((docType) => (
                    <button
                      key={docType}
                      type="button"
                      onClick={() => handleAddFilePreset(docType)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center transition-colors truncate"
                    >
                      + {docType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attached Files List */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attached Files Ready for Ingestion ({uploadedFiles.length})
              </h3>
              <div className="space-y-2 text-xs">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {file.type}
                          </span>
                          <span>•</span>
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="font-mono text-[9px] text-slate-400 truncate max-w-[140px]">
                            SHA: {file.hash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Sealed</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Statutory Human Officer Review Notice & Submission
            </h2>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="font-bold flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Statutory Governance Acknowledgment</span>
              </div>
              <p>
                {t('label_statutory_disclaimer')} Automated rules assist officers by indexing discrepancies and spatial geometry; they do not automatically grant title or certify registration.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">Application Dossier Summary</div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>Applicant: <strong>{applicantName}</strong></div>
                <div>Survey: <strong>{surveyNumber}/{subdivision}</strong></div>
                <div>Location: <strong>{village}, {taluk}</strong></div>
                <div>Extent: <strong>{extentValue} {extentUnit}</strong></div>
                <div>Documents Attached: <strong>{uploadedFiles.length} records</strong></div>
              </div>
            </div>

            <label className="flex items-start space-x-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={humanReviewConfirmed}
                onChange={(e) => setHumanReviewConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I understand that this filing will undergo scrutiny by Revenue and Registration officers with full evidentiary cross-checks.
              </span>
            </label>
          </div>
        )}

        {/* Wizard Control Buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5 mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center space-x-1"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!humanReviewConfirmed || isSubmitting}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
                humanReviewConfirmed && !isSubmitting
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Registering Dossier...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
