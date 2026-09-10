import React from 'react';
import { FmbDocumentAnalysis } from '../../types';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';

interface FmbReportViewProps {
  analysis: FmbDocumentAnalysis;
  onClose?: () => void;
}

export const FmbReportView: React.FC<FmbReportViewProps> = ({ analysis }) => {
  const downloadCsv = () => {
    window.location.href = `/api/fmb/${analysis.id}/export/csv`;
  };

  const downloadJson = () => {
    window.location.href = `/api/fmb/${analysis.id}/export/json`;
  };

  const criticalFindings = analysis.findings.filter(f => f.severity === 'Critical');
  const majorFindings = analysis.findings.filter(f => f.severity === 'Major');
  const passedChecks = analysis.measurementChecks.filter(c => c.status === 'Pass');

  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-8 max-w-5xl mx-auto space-y-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            REPORT ID: REP-FMB-{analysis.id.slice(-8).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Formal FMB Cadastral Analysis Dossier
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={downloadJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileJson className="w-4 h-4 text-sky-600" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Official State Header */}
      <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 text-center space-y-1">
        <div className="text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold">
          தமிழ்நாடு அரசு • நில அளவை மற்றும் நிலவரித் திட்டம்
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
          Government of Tamil Nadu • Department of Survey and Land Records
        </div>
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-1">
          Field Measurement Book (புலப்பட புத்தகம்) Technical Analysis Dossier
        </h1>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Automated Ingestion, Multilateral Triangulation, Boundary Verification & Discrepancy Screening
        </div>
      </div>

      {/* Statutory Disclaimer Badge */}
      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 text-xs space-y-1">
        <div className="font-bold flex items-center space-x-2 text-amber-900 dark:text-amber-300 uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Statutory Disclaimer & Non-Authenticative Guidance Notice</span>
        </div>
        <p className="leading-relaxed opacity-95">
          This FMB analysis report assists document interpretation and review. It does not certify ownership, legal boundaries, or government approval. Authoritative cadastral decisions require physical field demarcation by a licensed Taluk Surveyor under the Tamil Nadu Survey and Boundaries Act.
        </p>
      </div>

      {/* 1. Document Identification Roster */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          1. Document Identification & Cadastral Hierarchy
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">District (மாவட்டம்)</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.district?.normalizedValue || 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Taluk (வட்டம்)</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.taluk?.normalizedValue || 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Village (வருவாய் கிராமம்)</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.village?.normalizedValue || 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-emerald-700 dark:text-emerald-400 text-[10px]">Survey / Subdivision</div>
            <div className="font-bold font-mono text-emerald-900 dark:text-emerald-200 text-sm mt-0.5">
              {analysis.identification?.surveyNumber?.normalizedValue || 'N/A'}/{analysis.identification?.subdivisionNumber?.normalizedValue || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Scale of Sketch</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.scale?.normalizedValue || '1:2000 Metric'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Measurement Unit</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.measurementUnit?.normalizedValue || 'Metres'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Survey Date</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.surveyDate?.normalizedValue || 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400 text-[10px]">Surveyor Attestation</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {analysis.identification?.sealSignatureStatus?.normalizedValue || 'Verified'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Plain-Language Explanation */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          2. Plain-Language Cadastral Assessment (புலப்பட வரைபட விளக்கம்)
        </h3>
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
              English Synopsis:
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              {analysis.sketchInterpretation.plainEnglishExplanation}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 font-serif">
              தமிழ் சுருக்கம் (Tamil Synopsis):
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-serif">
              {analysis.sketchInterpretation.plainTamilExplanation}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Deterministic Calculations Table */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          3. Deterministic Geometric & Cadastral Calculations
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
              <tr>
                <th className="p-3">Calculation Target</th>
                <th className="p-3">Result Value</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Formula / Method</th>
                <th className="p-3">Limitations & Assumptions</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {analysis.geometryCalculations.map(calc => (
                <tr key={calc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {calc.target}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {calc.resultValue !== undefined ? calc.resultValue.toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {calc.resultUnit}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {calc.methodFormula}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {calc.limitations || calc.assumptions.join(' ')}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {calc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Complete Measurements Roster */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          4. Read Measurements Roster ({analysis.measurements.length} Line Segments)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
              <tr>
                <th className="p-2.5">Subdivision</th>
                <th className="p-2.5">From → To</th>
                <th className="p-2.5">Raw Written Notation</th>
                <th className="p-2.5">Parsed Numeric</th>
                <th className="p-2.5">Unit</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Page</th>
                <th className="p-2.5">Interpretation Status</th>
                <th className="p-2.5">Officer Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              {analysis.measurements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-2.5">{m.parcelSubdivision}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {m.fromPoint} → {m.toPoint}
                  </td>
                  <td className="p-2.5">{m.rawNotation}</td>
                  <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                    {m.reviewerCorrection?.value ?? m.parsedNumericValue}
                  </td>
                  <td className="p-2.5">{m.reviewerCorrection?.unit ?? m.unit}</td>
                  <td className="p-2.5">
                    <span className="capitalize">{m.type}</span>
                  </td>
                  <td className="p-2.5">{m.pageNumber}</td>
                  <td className="p-2.5 font-sans">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      m.interpretationStatus === 'Verified'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {m.interpretationStatus}
                    </span>
                  </td>
                  <td className="p-2.5 font-sans text-slate-500">
                    {m.reviewerCorrection ? `${m.reviewerCorrection.value} ${m.reviewerCorrection.unit} (${m.reviewerCorrection.note})` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Deterministic Rule Checks (9 Checks) */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          5. Deterministic Cadastral & Geometric Verification Suite ({passedChecks.length}/{analysis.measurementChecks.length} Passed)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {analysis.measurementChecks.map(chk => {
            const isPass = chk.status === 'Pass';
            const isCaution = chk.status === 'Caution';
            const isReview = chk.status === 'Review Required';

            return (
              <div
                key={chk.checkId}
                className={`p-3.5 rounded-xl border ${
                  isPass
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20'
                    : isReview
                    ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20'
                    : 'border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20'
                } space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {chk.checkId} • {chk.category}
                  </span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    isPass
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : isReview
                      ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                  }`}>
                    {isPass ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{chk.status}</span>
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {chk.checkName}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {chk.explanation}
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  Evaluated: {chk.evaluatedAgainst}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Human Corrections & Audit Trail */}
      {analysis.humanReviews && analysis.humanReviews.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            6. Human Review & Officer Correction Trail ({analysis.humanReviews.length} Actions Recorded)
          </h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            {analysis.humanReviews.map(r => (
              <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {r.targetType.toUpperCase()} [{r.targetId}]: "{r.originalValue}" → "{r.correctedValue}"
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Reason: {r.reason}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>{r.reviewedBy}</div>
                  <div>{new Date(r.reviewedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Official Sign-off Block */}
      <div className="pt-8 border-t-2 border-slate-900 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs">
        <div className="space-y-6">
          <div>
            <div className="text-slate-500 text-[11px]">Examined & Prepared By:</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">
              {analysis.identification?.surveyorDesignation?.normalizedValue || 'Taluk Surveyor'}
            </div>
            <div className="text-[10px] text-slate-400">Survey and Land Records Department</div>
          </div>
          <div className="h-10 border-b border-dashed border-slate-400 w-48" />
          <div className="text-[10px] text-slate-500">Official Surveyor Signature & Date</div>
        </div>

        <div className="space-y-6 text-right">
          <div>
            <div className="text-slate-500 text-[11px]">Statutory Verification Officer:</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">
              Tahisildar / Revenue Divisional Officer (RDO)
            </div>
            <div className="text-[10px] text-slate-400">Revenue Administration Department</div>
          </div>
          <div className="h-10 border-b border-dashed border-slate-400 w-48 ml-auto" />
          <div className="text-[10px] text-slate-500">Official Seal & Approval Stamp</div>
        </div>
      </div>
    </div>
  );
};
