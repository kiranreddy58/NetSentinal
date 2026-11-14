import React, { useState } from 'react';

// Responsive SVG Bar Chart
export function BarChart({ data, xKey, yKey, color = '#38bdf8', height = 240 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  if (!data || data.length === 0) return <div className="text-slate-500 text-xs py-8 text-center">No chart data available</div>;

  const maxVal = Math.max(...data.map(d => Number(d[yKey]) || 0), 1);
  const chartHeight = height - 40;

  return (
    <div className="w-full relative">
      <div className="flex items-end gap-2 w-full pt-4 pb-2 border-b border-slate-800" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const val = Number(item[yKey]) || 0;
          const pct = Math.max(4, (val / maxVal) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-9 z-20 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none">
                  <span className="font-semibold text-cyan-400">{item[xKey]}: </span>
                  <span>{val.toLocaleString()}</span>
                </div>
              )}
              <div 
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: `${pct}%`,
                  backgroundColor: item.color || (isHovered ? '#06b6d4' : color),
                  opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1
                }}
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center group-hover:text-cyan-300">
                {String(item[xKey]).length > 10 ? String(item[xKey]).slice(0, 9) + '…' : item[xKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Responsive SVG Area / Trend Chart
export function AreaChart({ data, xKey, yKey, color = '#10b981', height = 220 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  if (!data || data.length === 0) return <div className="text-slate-500 text-xs py-8 text-center">No trend data available</div>;

  const width = 600;
  const padding = 20;
  const maxVal = Math.max(...data.map(d => Number(d[yKey]) || 0), 1);

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - 2 * padding);
    const val = Number(d[yKey]) || 0;
    const y = height - padding - (val / maxVal) * (height - 2 * padding);
    return { x, y, data: d, val };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaD = `${pathD} L ${(width - padding).toFixed(1)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full relative">
      {hoveredPoint && (
        <div className="absolute top-2 right-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none">
          <span className="text-emerald-400 font-semibold">{hoveredPoint.data[xKey]}: </span>
          <span>{Number(hoveredPoint.val).toLocaleString()} flows</span>
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={`areaGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={height - padding - frac * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - frac * (height - 2 * padding)}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
        ))}
        {/* Area fill */}
        <path d={areaD} fill={`url(#areaGrad-${color})`} />
        {/* Stroke line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Interactive Points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint === p ? 5 : 2.5}
            fill={hoveredPoint === p ? '#ffffff' : color}
            stroke="#0f172a"
            strokeWidth="1.5"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>
    </div>
  );
}

// Donut / Pie Breakdown Chart
export function DonutChart({ data, labelKey = 'label', valueKey = 'count', size = 180 }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0);
  if (total === 0) return null;

  const defaultColors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
  let currentAngle = 0;

  const slices = data.map((item, idx) => {
    const val = Number(item[valueKey]) || 0;
    const sliceAngle = (val / total) * 360;
    const startAngle = currentAngle;
    currentAngle += sliceAngle;
    const color = item.color || defaultColors[idx % defaultColors.length];
    return { ...item, val, sliceAngle, startAngle, color, pct: ((val / total) * 100).toFixed(1) };
  });

  // SVG arc calculation helper
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((slice, i) => {
            if (slice.sliceAngle >= 359.9) {
              return <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={slice.color} strokeWidth="16" />;
            }
            return (
              <path
                key={i}
                d={describeArc(50, 50, 38, slice.startAngle, slice.startAngle + slice.sliceAngle)}
                fill="none"
                stroke={slice.color}
                strokeWidth="16"
                className="transition-all hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400">Total</span>
          <span className="text-sm font-bold text-slate-100">{total > 1000000 ? `${(total/1000000).toFixed(1)}M` : total.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-300 font-medium">{slice[labelKey]}</span>
            </div>
            <span className="text-slate-400 font-mono">{slice.pct}% ({slice.val.toLocaleString()})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2x2 Confusion Matrix Card
export function ConfusionMatrixCard({ matrix, modelName = 'Classifier' }) {
  if (!matrix) return <div className="text-slate-500 text-xs py-4 text-center">No matrix data</div>;
  const tn = matrix.true_negative || 0;
  const fp = matrix.false_positive || 0;
  const fn = matrix.false_negative || 0;
  const tp = matrix.true_positive || 0;
  const total = tn + fp + fn + tp || 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-200">{modelName} Confusion Matrix</h4>
        <span className="text-xs text-slate-400 font-mono">N = {total.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded p-4">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">True Negative (TN)</span>
          <p className="text-xl font-bold font-mono text-emerald-200 mt-1">{tn.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Benign correctly identified ({((tn/total)*100).toFixed(2)}%)</span>
        </div>
        <div className="bg-rose-950/40 border border-rose-800/60 rounded p-4">
          <span className="text-[11px] uppercase tracking-wider text-rose-400 font-medium">False Positive (FP)</span>
          <p className="text-xl font-bold font-mono text-rose-200 mt-1">{fp.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Benign mistaken for attack ({((fp/total)*100).toFixed(3)}%)</span>
        </div>
        <div className="bg-amber-950/40 border border-amber-800/60 rounded p-4">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">False Negative (FN)</span>
          <p className="text-xl font-bold font-mono text-amber-200 mt-1">{fn.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Attack missed ({((fn/total)*100).toFixed(3)}%)</span>
        </div>
        <div className="bg-cyan-950/40 border border-cyan-800/60 rounded p-4">
          <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-medium">True Positive (TP)</span>
          <p className="text-xl font-bold font-mono text-cyan-200 mt-1">{tp.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Attack correctly detected ({((tp/total)*100).toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
}

// ROC / PR Curve Plot
export function CurvePlot({ points, xKey = 'fpr', yKey = 'tpr', title = 'ROC Curve', auc = 1.0, color = '#06b6d4' }) {
  if (!points || points.length === 0) return <div className="text-slate-500 text-xs py-8 text-center">No curve data</div>;

  const width = 360;
  const height = 240;
  const pad = 28;

  const svgPoints = points.map(p => {
    const x = pad + (Number(p[xKey]) || 0) * (width - 2 * pad);
    const y = height - pad - (Number(p[yKey]) || 0) * (height - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <span className="text-xs font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded">
          AUC = {Number(auc).toFixed(4)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#334155" strokeWidth="1" />
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#334155" strokeWidth="1" />
        {/* Diagonal Baseline for ROC */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={pad} stroke="#475569" strokeDasharray="3 3" />
        {/* Curve line */}
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={svgPoints} />
        {/* Axis Labels */}
        <text x={width / 2} y={height - 6} fill="#94a3b8" fontSize="10" textAnchor="middle">{xKey.toUpperCase()}</text>
        <text x={10} y={height / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90, 10, ${height/2})`}>{yKey.toUpperCase()}</text>
      </svg>
    </div>
  );
}

// Horizontal Feature Importance Ranking
export function FeatureImportanceBars({ features = [], maxDisplay = 10 }) {
  if (!features || features.length === 0) return null;
  const list = features.slice(0, maxDisplay);
  const maxImp = Math.max(...list.map(f => f.importance || f.f1_drop || 0), 0.001);

  return (
    <div className="space-y-2.5">
      {list.map((item, idx) => {
        const val = item.importance || item.f1_drop || 0;
        const pct = Math.min(100, Math.max(3, (val / maxImp) * 100));

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-300 truncate max-w-[260px]">{idx + 1}. {item.feature}</span>
              <span className="font-mono text-cyan-400 font-semibold">{val.toFixed(4)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
