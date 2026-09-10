import React, { useState } from 'react';
import {
  FmbTracedPoint,
  FmbTracedLine,
  FmbMeasurementItem,
  FmbParcelBreakdown,
} from '../../types';
import { Compass, Info, Maximize2, RotateCcw, ZoomIn, ZoomOut, Layers, Eye, EyeOff } from 'lucide-react';

interface FmbCadastralSketchProps {
  tracedPoints: FmbTracedPoint[];
  tracedLines: FmbTracedLine[];
  measurements: FmbMeasurementItem[];
  parcels: FmbParcelBreakdown[];
  selectedMeasurementId?: string | null;
  onSelectMeasurement?: (id: string) => void;
  onSelectPoint?: (pointLabel: string) => void;
  scaleNote?: string;
  className?: string;
}

export const FmbCadastralSketch: React.FC<FmbCadastralSketchProps> = ({
  tracedPoints,
  tracedLines,
  measurements,
  parcels,
  selectedMeasurementId,
  onSelectMeasurement,
  onSelectPoint,
  scaleNote = '1:2000 Metric',
  className = '',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<FmbTracedPoint | null>(null);
  const [hoveredLine, setHoveredLine] = useState<FmbTracedLine | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showBaselines, setShowBaselines] = useState(true);
  const [showOffsets, setShowOffsets] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Compute bounding box of points with padding
  const xs = tracedPoints.length > 0 ? tracedPoints.map(p => p.x) : [100, 900];
  const ys = tracedPoints.length > 0 ? tracedPoints.map(p => p.y) : [100, 900];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 120;
  const viewBoxWidth = Math.max(maxX - minX + padding * 2, 800);
  const viewBoxHeight = Math.max(maxY - minY + padding * 2, 650);
  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;

  // Build polygon path for boundary stations
  const boundaryPoints = tracedPoints.filter(p => p.isStation !== false);
  const polygonPointsStr = boundaryPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Look up measurement associated with a line
  const getMeasurementForLine = (line: FmbTracedLine): FmbMeasurementItem | undefined => {
    return measurements.find(
      m =>
        (m.fromPoint === line.fromPoint && m.toPoint === line.toPoint) ||
        (m.fromPoint === line.toPoint && m.toPoint === line.fromPoint)
    );
  };

  const getPointByLabel = (label: string): FmbTracedPoint | undefined => {
    return tracedPoints.find(p => p.label === label);
  };

  return (
    <div className={`relative flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 select-none ${className}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 z-10">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            AI-assisted tracing — requires review
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Scale: {scaleNote}
          </span>
        </div>

        {/* View toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Cadastral Grid"
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowBaselines(!showBaselines)}
            title="Toggle G-Line Baselines"
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${showBaselines ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            G-Line
          </button>
          <button
            onClick={() => setShowOffsets(!showOffsets)}
            title="Toggle F-Line Offsets"
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${showOffsets ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            F-Line
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle Labels"
            className={`p-1.5 rounded transition-colors ${showLabels ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Canvas */}
      <div className="relative flex-1 overflow-hidden cursor-crosshair">
        <svg
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="cadastralGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            {/* Arrowhead marker for North arrow */}
            <marker id="northArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Background Grid */}
          {showGrid && (
            <rect
              x={viewBoxX - 1000}
              y={viewBoxY - 1000}
              width={viewBoxWidth + 2000}
              height={viewBoxHeight + 2000}
              fill="url(#cadastralGrid)"
            />
          )}

          {/* Boundary Parcel Polygon Fill */}
          {boundaryPoints.length > 2 && (
            <polygon
              points={polygonPointsStr}
              fill="#10b981"
              fillOpacity="0.08"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all"
            />
          )}

          {/* Adjoining references annotations */}
          {parcels.length > 0 && parcels[0] && (
            <g className="text-slate-500 text-[13px] select-none font-medium">
              {/* North */}
              <text x={(minX + maxX) / 2} y={minY - 35} textAnchor="middle" fill="#94a3b8" fontSize="12">
                ↑ North: {parcels[0].adjoiningNorth || 'Adjacent Survey'}
              </text>
              {/* South */}
              <text x={(minX + maxX) / 2} y={maxY + 45} textAnchor="middle" fill="#94a3b8" fontSize="12">
                ↓ South: {parcels[0].adjoiningSouth || 'Adjacent Survey'}
              </text>
              {/* East */}
              <text x={maxX + 35} y={(minY + maxY) / 2} textAnchor="start" fill="#94a3b8" fontSize="12">
                East: {parcels[0].adjoiningEast || 'Adjacent Survey'} →
              </text>
              {/* West */}
              <text x={minX - 35} y={(minY + maxY) / 2} textAnchor="end" fill="#94a3b8" fontSize="12">
                ← West: {parcels[0].adjoiningWest || 'Adjacent Survey'}
              </text>
            </g>
          )}

          {/* Lines (Boundary, Baselines, Offsets, Physical Features) */}
          {tracedLines.map((line) => {
            const p1 = getPointByLabel(line.fromPoint);
            const p2 = getPointByLabel(line.toPoint);
            if (!p1 || !p2) return null;

            if (line.type === 'baseline' && !showBaselines) return null;
            if (line.type === 'offset' && !showOffsets) return null;

            const meas = getMeasurementForLine(line);
            const isSelected = selectedMeasurementId && meas?.id === selectedMeasurementId;
            const isHovered = hoveredLine?.id === line.id;

            let strokeColor = '#10b981'; // default boundary green
            let strokeWidth = 2.5;
            let strokeDash = 'none';

            if (line.type === 'baseline') {
              strokeColor = '#6366f1'; // Indigo for G-line
              strokeWidth = 2;
              strokeDash = '6 4';
            } else if (line.type === 'offset') {
              strokeColor = '#06b6d4'; // Cyan for F-line
              strokeWidth = 1.5;
              strokeDash = '3 3';
            } else if (line.type === 'feature') {
              strokeColor = '#f59e0b'; // Amber for road/track
              strokeWidth = 3;
              strokeDash = '8 4';
            }

            if (isSelected) {
              strokeColor = '#fbbf24'; // Bright amber gold
              strokeWidth = 4;
            } else if (isHovered) {
              strokeColor = '#38bdf8';
              strokeWidth = 3.5;
            }

            // Midpoint for dimension label
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g
                key={line.id}
                className="cursor-pointer group"
                onClick={() => {
                  if (meas && onSelectMeasurement) onSelectMeasurement(meas.id);
                }}
                onMouseEnter={() => setHoveredLine(line)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                {/* Wider transparent hit area */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="16"
                />
                {/* Visible line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                />

                {/* Dimension label tag */}
                {showLabels && (line.measurementLabel || meas?.rawNotation) && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-32"
                      y="-12"
                      width="64"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={isSelected ? '#fbbf24' : '#334155'}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? '#fbbf24' : '#e2e8f0'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {meas?.reviewerCorrection?.value
                        ? `${meas.reviewerCorrection.value} ${meas.reviewerCorrection.unit}`
                        : line.measurementLabel || meas?.rawNotation}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Stations / Vertex Nodes */}
          {tracedPoints.map((pt) => {
            const isHovered = hoveredPoint?.id === pt.id;
            const isStation = pt.isStation !== false;

            return (
              <g
                key={pt.id}
                className="cursor-pointer"
                onClick={() => onSelectPoint && onSelectPoint(pt.label)}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Station circle outer glow */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 14 : 9}
                  fill={isStation ? '#10b981' : '#06b6d4'}
                  fillOpacity={isHovered ? 0.3 : 0.15}
                  className="transition-all"
                />
                {/* Station marker stone icon */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill={isStation ? '#10b981' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Node Label (A, B, C, D) */}
                {showLabels && (
                  <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                    <circle cx="0" cy="0" r="10" fill="#020617" stroke="#10b981" strokeWidth="1.2" />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {pt.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* North Arrow Rosette at Top Right */}
          <g transform={`translate(${viewBoxX + viewBoxWidth - 70}, ${viewBoxY + 60})`}>
            <circle cx="0" cy="0" r="22" fill="#0f172a" fillOpacity="0.8" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="14" x2="0" y2="-14" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#northArrow)" />
            <text x="0" y="-18" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
              N
            </text>
            <text x="0" y="28" textAnchor="middle" fill="#64748b" fontSize="8">
              North 0°
            </text>
          </g>

          {/* Cadastral Scale Bar at Bottom Left */}
          <g transform={`translate(${viewBoxX + 40}, ${viewBoxY + viewBoxHeight - 35})`}>
            <rect x="0" y="0" width="100" height="4" fill="#64748b" />
            <rect x="0" y="0" width="50" height="4" fill="#ffffff" />
            <line x1="0" y1="-3" x2="0" y2="7" stroke="#94a3b8" strokeWidth="1" />
            <line x1="50" y1="-3" x2="50" y2="7" stroke="#94a3b8" strokeWidth="1" />
            <line x1="100" y1="-3" x2="100" y2="7" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="-6" textAnchor="start" fill="#94a3b8" fontSize="9">0</text>
            <text x="50" y="-6" textAnchor="middle" fill="#94a3b8" fontSize="9">25m</text>
            <text x="100" y="-6" textAnchor="end" fill="#94a3b8" fontSize="9">50m</text>
            <text x="50" y="16" textAnchor="middle" fill="#64748b" fontSize="8 font-mono">
              Scale {scaleNote}
            </text>
          </g>
        </svg>

        {/* Hover Information Tooltip */}
        {hoveredPoint && (
          <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-700 text-white px-3 py-2 rounded-lg shadow-xl text-xs space-y-1 z-20 pointer-events-none">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
              <span>Station Point: {hoveredPoint.label}</span>
              {hoveredPoint.isStation && <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded">Stone</span>}
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              Canvas Coords: X={Math.round(hoveredPoint.x)}, Y={Math.round(hoveredPoint.y)}
            </div>
            <div className="text-[10px] text-slate-400">Click to focus measurements originating here</div>
          </div>
        )}

        {hoveredLine && (
          <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-700 text-white px-3 py-2 rounded-lg shadow-xl text-xs space-y-1 z-20 pointer-events-none">
            <div className="font-bold text-amber-400">
              Line {hoveredLine.fromPoint} → {hoveredLine.toPoint} ({hoveredLine.type})
            </div>
            {hoveredLine.measurementLabel && (
              <div className="text-[11px] text-slate-200 font-mono">
                Noted Measurement: {hoveredLine.measurementLabel}
              </div>
            )}
            <div className="text-[10px] text-slate-400">Click to highlight in measurements table</div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-xs" />
            <span>Boundary Line</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-indigo-500 rounded-xs border-dashed" />
            <span>G-Line Baseline</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-cyan-400 rounded-xs" />
            <span>F-Line Offset</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
            <span>Survey Stone</span>
          </div>
        </div>
        <div className="text-slate-500 text-[10px]">
          {boundaryPoints.length} Stations • {tracedLines.length} Lines Traced
        </div>
      </div>
    </div>
  );
};
