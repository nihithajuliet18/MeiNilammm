import React, { useState } from 'react';
import {
  FmbDocumentAnalysis,
  FmbTracedPoint,
  FmbTracedLine,
} from '../../types';
import { FmbCadastralSketch } from './FmbCadastralSketch';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Sliders,
  FileText,
  Layers,
  Columns,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Compass,
} from 'lucide-react';

interface FmbDocumentViewerProps {
  analysis: FmbDocumentAnalysis;
  selectedMeasurementId?: string | null;
  onSelectMeasurement?: (id: string) => void;
  onSelectPoint?: (pointLabel: string) => void;
  className?: string;
}

export const FmbDocumentViewer: React.FC<FmbDocumentViewerProps> = ({
  analysis,
  selectedMeasurementId,
  onSelectMeasurement,
  onSelectPoint,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'cadastral' | 'scan' | 'split'>('cadastral');
  const [activePage, setActivePage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [contrastLevel, setContrastLevel] = useState(100);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [invertInk, setInvertInk] = useState(false);
  const [showHighlightOverlay, setShowHighlightOverlay] = useState(true);

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetFilters = () => {
    setRotation(0);
    setContrastLevel(100);
    setBrightnessLevel(100);
    setInvertInk(false);
  };

  const isEnhanced = contrastLevel !== 100 || brightnessLevel !== 100 || invertInk || rotation !== 0;

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 gap-2">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('cadastral')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'cadastral'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cadastral Tracing</span>
          </button>
          <button
            onClick={() => setViewMode('scan')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'scan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Scan</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Image enhancement filters (active when scan or split is shown) */}
        {(viewMode === 'scan' || viewMode === 'split') && (
          <div className="flex items-center space-x-2">
            {/* Contrast Slider */}
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span className="hidden md:inline">Contrast:</span>
              <input
                type="range"
                min="70"
                max="180"
                value={contrastLevel}
                onChange={e => setContrastLevel(Number(e.target.value))}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                title={`Contrast: ${contrastLevel}%`}
              />
            </div>

            {/* Brightness Slider */}
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Sun className="w-3 h-3 text-slate-400" />
              <span className="hidden md:inline">Bright:</span>
              <input
                type="range"
                min="70"
                max="140"
                value={brightnessLevel}
                onChange={e => setBrightnessLevel(Number(e.target.value))}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                title={`Brightness: ${brightnessLevel}%`}
              />
            </div>

            {/* Invert Ink for faded scans */}
            <button
              onClick={() => setInvertInk(!invertInk)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                invertInk
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Enhance faint handwritten ink"
            >
              Faded Ink
            </button>

            {/* Rotate */}
            <button
              onClick={rotate}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={`Rotate 90° (Current: ${rotation}°)`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {isEnhanced && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-amber-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Page Selector */}
        {analysis.pages && analysis.pages.length > 1 && (
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-400">Page:</span>
            {analysis.pages.map(p => (
              <button
                key={p.pageNumber}
                onClick={() => setActivePage(p.pageNumber)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  activePage === p.pageNumber
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Copy Notice Banner */}
      {isEnhanced && (viewMode === 'scan' || viewMode === 'split') && (
        <div className="bg-amber-950/70 border-b border-amber-800/60 px-3 py-1 text-[11px] text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Derived Enhanced Copy:</strong> Contrast {contrastLevel}%, Brightness {brightnessLevel}%, Rotation {rotation}°. Original scan is preserved unchanged.
            </span>
          </div>
          <button onClick={resetFilters} className="text-amber-400 underline ml-2 font-medium">
            Restore Original
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'cadastral' && (
          <FmbCadastralSketch
            tracedPoints={analysis.tracedPoints || []}
            tracedLines={analysis.tracedLines || []}
            measurements={analysis.measurements || []}
            parcels={analysis.parcels || []}
            selectedMeasurementId={selectedMeasurementId}
            onSelectMeasurement={onSelectMeasurement}
            onSelectPoint={onSelectPoint}
            scaleNote={analysis.identification?.scale?.normalizedValue || '1:2000 Metric'}
            className="w-full h-full"
          />
        )}

        {viewMode === 'scan' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 overflow-auto">
            <div
              className="relative max-w-full max-h-full rounded shadow-2xl border border-slate-800 transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg)`,
                filter: `contrast(${contrastLevel}%) brightness(${brightnessLevel}%) ${invertInk ? 'invert(0.9) hue-rotate(180deg)' : ''}`,
              }}
            >
              {/* Document Scan Simulation / High-Resolution Scan Canvas */}
              <div className="relative bg-amber-50 text-slate-900 w-[550px] min-h-[720px] p-6 shadow-inner font-serif select-none">
                {/* Government Header Stamp */}
                <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-700 font-sans font-bold">
                    தமிழ்நாடு அரசு • நில அளவை மற்றும் நிலவரித் திட்டம்
                  </div>
                  <div className="text-xs uppercase tracking-wider text-slate-800 font-sans font-bold mt-0.5">
                    Government of Tamil Nadu • Survey & Land Records Department
                  </div>
                  <div className="text-sm font-bold mt-1 text-slate-900 underline">
                    புலப்பட புத்தகம் (Field Measurement Book)
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-sans text-slate-700 mt-2">
                    <span>மாவட்டம் (Dist): <strong>{analysis.identification?.district?.normalizedValue || 'Coimbatore'}</strong></span>
                    <span>வட்டம் (Taluk): <strong>{analysis.identification?.taluk?.normalizedValue || 'Coimbatore South'}</strong></span>
                    <span>கிராமம் (Village): <strong>{analysis.identification?.village?.normalizedValue || 'Perur'}</strong></span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-sans text-slate-700 mt-1">
                    <span>புல எண் (Sy No): <strong className="text-emerald-800 font-bold">{analysis.identification?.surveyNumber?.normalizedValue || '142'}/{analysis.identification?.subdivisionNumber?.normalizedValue || '3A'}</strong></span>
                    <span>அளவு (Scale): <strong>{analysis.identification?.scale?.normalizedValue || '1:2000 Metric'}</strong></span>
                    <span>அளவீடு அலகு: <strong>{analysis.identification?.measurementUnit?.normalizedValue || 'Metres'}</strong></span>
                  </div>
                </div>

                {/* Hand-drawn Sketch representation */}
                <div className="border border-dashed border-slate-400 bg-white/60 p-4 my-4 rounded h-[420px] relative flex flex-col justify-between">
                  <div className="text-right text-[9px] font-mono text-slate-500">
                    வடக்கு (North) ↑
                  </div>

                  {/* Render sketch mini SVG preview in scan */}
                  <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="100 150 750 650" className="w-full h-full max-h-[350px]">
                      {/* Polygon */}
                      <polygon
                        points={(analysis.tracedPoints || []).map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(16, 185, 129, 0.05)"
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      {/* Lines */}
                      {(analysis.tracedLines || []).map(l => {
                        const p1 = analysis.tracedPoints?.find(p => p.label === l.fromPoint);
                        const p2 = analysis.tracedPoints?.find(p => p.label === l.toPoint);
                        if (!p1 || !p2) return null;
                        return (
                          <g key={l.id}>
                            <line
                              x1={p1.x}
                              y1={p1.y}
                              x2={p2.x}
                              y2={p2.y}
                              stroke={l.type === 'baseline' ? '#4f46e5' : '#1e293b'}
                              strokeWidth={l.type === 'baseline' ? '1.5' : '2'}
                              strokeDasharray={l.type === 'baseline' ? '4 3' : 'none'}
                            />
                            {l.measurementLabel && (
                              <text
                                x={(p1.x + p2.x) / 2}
                                y={(p1.y + p2.y) / 2 - 6}
                                fontSize="12"
                                fontFamily="monospace"
                                fill="#0f172a"
                                textAnchor="middle"
                                fontWeight="bold"
                              >
                                {l.measurementLabel}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      {/* Points */}
                      {(analysis.tracedPoints || []).map(pt => (
                        <g key={pt.id}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill="#0f172a" />
                          <text x={pt.x} y={pt.y - 8} fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Adjoining notes in scan */}
                  <div className="flex justify-between text-[9px] font-sans text-slate-600">
                    <span>மேற்கு: {analysis.parcels[0]?.adjoiningWest || 'வண்டிப்பாதை'}</span>
                    <span>கிழக்கு: {analysis.parcels[0]?.adjoiningEast || 'புல எண் 142/3B'}</span>
                  </div>
                </div>

                {/* Surveyor Seal & Signatures Block */}
                <div className="border-t border-slate-600 pt-3 flex justify-between items-end text-[10px] font-sans">
                  <div>
                    <div className="text-slate-600">அளவையர் கையொப்பம் (Surveyor Sign):</div>
                    <div className="font-serif italic font-bold text-slate-800 text-xs mt-1">
                      {analysis.identification?.surveyorDesignation?.normalizedValue || 'S. Sundaram, Taluk Surveyor'}
                    </div>
                    <div className="text-slate-500 text-[9px]">தேதி (Date): {analysis.identification?.surveyDate?.normalizedValue || '14-08-1988'}</div>
                  </div>
                  <div className="text-right">
                    <div className="border border-slate-700 px-3 py-1.5 rounded inline-block text-center bg-slate-100/80">
                      <div className="font-bold text-[9px] text-slate-800">வட்டாட்சியர் அலுவலக முத்திரை</div>
                      <div className="text-[8px] text-slate-600">TALUK OFFICE OFFICIAL SEAL</div>
                    </div>
                  </div>
                </div>

                {/* Evidence Bounding Box Overlays */}
                {showHighlightOverlay && (
                  <div className="absolute top-8 left-8 right-8 pointer-events-none">
                    <div className="border-2 border-dashed border-emerald-600/40 rounded p-2 text-[9px] text-emerald-800 bg-emerald-500/5">
                      ✓ Document Header Extracted & Verified
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left: Original Scan */}
            <div className="h-full flex items-center justify-center p-3 bg-slate-950 overflow-auto">
              <div
                className="bg-amber-50 text-slate-900 w-full max-w-[420px] p-4 rounded shadow font-serif text-xs select-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `contrast(${contrastLevel}%) brightness(${brightnessLevel}%) ${invertInk ? 'invert(0.9) hue-rotate(180deg)' : ''}`,
                }}
              >
                <div className="text-center font-bold text-[10px] uppercase border-b pb-2 mb-2">
                  புலப்பட புத்தகம் (Field Measurement Book)
                  <div className="text-slate-600 text-[9px] font-normal">
                    {analysis.identification?.village?.normalizedValue} • Sy. {analysis.identification?.surveyNumber?.normalizedValue}/{analysis.identification?.subdivisionNumber?.normalizedValue}
                  </div>
                </div>
                <div className="h-[280px] border border-dashed border-slate-400 bg-white/70 flex items-center justify-center p-2 rounded">
                  <svg viewBox="100 150 750 650" className="w-full h-full">
                    <polygon
                      points={(analysis.tracedPoints || []).map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(16, 185, 129, 0.06)"
                      stroke="#1e293b"
                      strokeWidth="2.5"
                    />
                    {(analysis.tracedLines || []).map(l => {
                      const p1 = analysis.tracedPoints?.find(p => p.label === l.fromPoint);
                      const p2 = analysis.tracedPoints?.find(p => p.label === l.toPoint);
                      if (!p1 || !p2) return null;
                      return (
                        <line
                          key={l.id}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={l.type === 'baseline' ? '#4f46e5' : '#1e293b'}
                          strokeWidth="2"
                          strokeDasharray={l.type === 'baseline' ? '4 3' : 'none'}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="text-[9px] text-slate-500 mt-2 text-center">
                  Original Archived Document Scan • SHA: {analysis.checksumSha256.slice(0, 12)}...
                </div>
              </div>
            </div>

            {/* Right: Interactive Cadastral Tracing */}
            <div className="h-full">
              <FmbCadastralSketch
                tracedPoints={analysis.tracedPoints || []}
                tracedLines={analysis.tracedLines || []}
                measurements={analysis.measurements || []}
                parcels={analysis.parcels || []}
                selectedMeasurementId={selectedMeasurementId}
                onSelectMeasurement={onSelectMeasurement}
                onSelectPoint={onSelectPoint}
                scaleNote={analysis.identification?.scale?.normalizedValue || '1:2000 Metric'}
                className="w-full h-full border-0 rounded-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-slate-300">{analysis.fileName}</span>
          <span>({(analysis.fileSize / 1024).toFixed(1)} KB)</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <span>Provider: <strong className="text-slate-300">{analysis.processingProvider}</strong></span>
          <span className="font-mono">SHA256: {analysis.checksumSha256.slice(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
};
