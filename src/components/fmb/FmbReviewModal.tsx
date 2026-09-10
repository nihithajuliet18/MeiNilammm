import React, { useState } from 'react';
import {
  FmbDocumentAnalysis,
  FmbMeasurementItem,
  FmbFieldEvidence,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, Edit3 } from 'lucide-react';

interface FmbReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FmbDocumentAnalysis;
  initialTargetType?: 'measurement' | 'field' | 'unit';
  initialTargetId?: string;
  onSaveSuccess: (updatedAnalysis: FmbDocumentAnalysis) => void;
}

export const FmbReviewModal: React.FC<FmbReviewModalProps> = ({
  isOpen,
  onClose,
  analysis,
  initialTargetType = 'measurement',
  initialTargetId = '',
  onSaveSuccess,
}) => {
  const { user } = useAuth();

  const [targetType, setTargetType] = useState<'measurement' | 'field' | 'unit'>(initialTargetType);
  const [selectedId, setSelectedId] = useState<string>(initialTargetId);
  const [correctedValue, setCorrectedValue] = useState<string>('');
  const [correctedUnit, setCorrectedUnit] = useState<string>('Metres');
  const [fromPoint, setFromPoint] = useState<string>('');
  const [toPoint, setToPoint] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prepopulate when selectedId changes
  React.useEffect(() => {
    if (targetType === 'measurement') {
      const m = analysis.measurements.find(meas => meas.id === selectedId) || analysis.measurements[0];
      if (m) {
        setSelectedId(m.id);
        setCorrectedValue(String(m.reviewerCorrection?.value ?? m.parsedNumericValue ?? ''));
        setCorrectedUnit(m.reviewerCorrection?.unit ?? m.unit);
        setFromPoint(m.reviewerCorrection?.fromPoint ?? m.fromPoint);
        setToPoint(m.reviewerCorrection?.toPoint ?? m.toPoint);
      }
    } else if (targetType === 'field') {
      const idMap: any = analysis.identification;
      if (idMap && selectedId && idMap[selectedId]) {
        setCorrectedValue(idMap[selectedId].officerCorrection || idMap[selectedId].normalizedValue);
      }
    } else if (targetType === 'unit') {
      setCorrectedUnit(analysis.identification.measurementUnit.normalizedValue || 'Metres');
    }
  }, [selectedId, targetType, analysis]);

  if (!isOpen) return null;

  const currentMeasurement = analysis.measurements.find(m => m.id === selectedId);
  const currentField: FmbFieldEvidence | undefined = (analysis.identification as any)?.[selectedId];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify an official reason or justification for this correction.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const originalVal =
        targetType === 'measurement'
          ? `${currentMeasurement?.parsedNumericValue} ${currentMeasurement?.unit}`
          : targetType === 'field'
          ? currentField?.normalizedValue
          : analysis.identification.measurementUnit.normalizedValue;

      const body = {
        targetType,
        targetId: selectedId,
        originalValue: originalVal,
        correctedValue: targetType === 'unit' ? correctedUnit : correctedValue,
        unit: correctedUnit,
        fromPoint,
        toPoint,
        reason,
        reviewerName: user?.name || 'Survey Officer',
        reviewerRole: user?.role || 'survey_officer',
      };

      const res = await fetch(`/api/fmb/${analysis.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || 'survey_officer',
          'x-user-name': user?.name || 'Survey Officer',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save correction');
      }

      const data = await res.json();
      onSaveSuccess(data.analysis);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error saving review correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-lg">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Officer Review & Cadastral Correction
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manual rectification of misread figures or ambiguous associations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Correction Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('measurement')}
                className={`py-2 px-3 rounded-lg font-semibold border text-center transition-all ${
                  targetType === 'measurement'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Measurement Line
              </button>
              <button
                type="button"
                onClick={() => setTargetType('field')}
                className={`py-2 px-3 rounded-lg font-semibold border text-center transition-all ${
                  targetType === 'field'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Document Header
              </button>
              <button
                type="button"
                onClick={() => setTargetType('unit')}
                className={`py-2 px-3 rounded-lg font-semibold border text-center transition-all ${
                  targetType === 'unit'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Global Unit
              </button>
            </div>
          </div>

          {/* If Target is Measurement */}
          {targetType === 'measurement' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Measurement
                </label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {analysis.measurements.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fromPoint} → {m.toPoint} ({m.rawNotation}) [{m.type}]
                    </option>
                  ))}
                </select>
              </div>

              {currentMeasurement && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <div className="text-slate-500 dark:text-slate-400">Original Notation in Scan:</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    "{currentMeasurement.rawNotation}" (Parsed as: {currentMeasurement.parsedNumericValue} {currentMeasurement.unit})
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Page {currentMeasurement.pageNumber} • Status: {currentMeasurement.interpretationStatus}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corrected Numeric Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={correctedValue}
                    onChange={e => setCorrectedValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={correctedUnit}
                    onChange={e => setCorrectedUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Metres">Metres (மீட்டர்)</option>
                    <option value="Links">Links (லிங்க்ஸ்)</option>
                    <option value="Chains">Chains (சங்கிலி)</option>
                    <option value="Feet">Feet (அடி)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    From Station Label
                  </label>
                  <input
                    type="text"
                    value={fromPoint}
                    onChange={e => setFromPoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    To Station Label
                  </label>
                  <input
                    type="text"
                    value={toPoint}
                    onChange={e => setToPoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* If Target is Field */}
          {targetType === 'field' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Field to Correct
                </label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {Object.entries(analysis.identification || {}).map(([key, f]: [string, any]) => (
                    <option key={key} value={key}>
                      {f.fieldName} ({f.normalizedValue})
                    </option>
                  ))}
                </select>
              </div>

              {currentField && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <div className="text-slate-500 dark:text-slate-400">Current Extracted Value:</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {currentField.normalizedValue}
                  </div>
                  {currentField.originalText && (
                    <div className="text-slate-500 font-serif">Original script: {currentField.originalText}</div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Corrected Value
                </label>
                <input
                  type="text"
                  value={correctedValue}
                  onChange={e => setCorrectedValue(e.target.value)}
                  required
                  placeholder="Enter confirmed official value"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </>
          )}

          {/* If Target is Global Unit */}
          {targetType === 'unit' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                <div className="font-bold">Global Measurement Unit Override</div>
                <p className="mt-1 opacity-90">
                  This will convert all {analysis.measurements.length} measurements to the selected unit and trigger a full deterministic perimeter and area re-calculation.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Authoritative Unit
                </label>
                <select
                  value={correctedUnit}
                  onChange={e => setCorrectedUnit(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Metres">Metres (மீட்டர்) - Modern Cadastral</option>
                  <option value="Links">Links (லிங்க்ஸ்) - 1 Link = 0.201168 m (Pre-1970 Survey)</option>
                  <option value="Chains">Chains (சங்கிலி) - 1 Chain = 66 Feet = 20.1168 m</option>
                  <option value="Feet">Feet (அடி) - 1 Foot = 0.3048 m</option>
                </select>
              </div>
            </div>
          )}

          {/* Statutory Reason */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Officer Justification / Reason for Rectification *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              rows={3}
              placeholder="E.g. Inverted ink scan verified against Taluk field register; handwriting confirmed as 124.5m by Survey Officer."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Re-calculating Geometry...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Correction & Re-run Checks</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
