import React, { useState } from 'react';

// Semicircular Threat Severity Gauge matching reference image
export function ThreatSeverityGauge({ score = 92.4, status = 'CRITICAL', critical = 203, high = 10470, medium = 243, low = 13213 }) {
  // Semicircle arc angles from 180 to 360 deg
  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 105;

  return (
    <div className="flex items-center justify-between h-full pt-1">
      {/* Semicircle SVG */}
      <div className="relative flex flex-col items-center justify-center">
        <svg width="220" height="125" viewBox="0 0 220 125" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D68F" />     {/* Green */}
              <stop offset="40%" stopColor="#FF9F32" />    {/* Orange */}
              <stop offset="75%" stopColor="#FF405B" />    {/* Red */}
              <stop offset="100%" stopColor="#FF2A4D" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track arc */}
          <path
            d="M 25 105 A 85 85 0 0 1 195 105"
            fill="none"
            stroke="#122543"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored gradient arc */}
          <path
            d="M 25 105 A 85 85 0 0 1 195 105"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-xl font-black tracking-wider text-[#FF405B] drop-shadow-md">
            {status}
          </span>
          <span className="text-[11px] text-[#91A4C2] font-mono mt-0.5">
            Risk Score: <strong className="text-white">{score}/100</strong>
          </span>
        </div>
      </div>

      {/* Legend Column on Right */}
      <div className="space-y-2 pr-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF405B]" />
          <span className="text-[#91A4C2]">Critical</span>
          <span className="text-white font-mono ml-auto font-semibold">{critical.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F32]" />
          <span className="text-[#91A4C2]">High</span>
          <span className="text-white font-mono ml-auto font-semibold">{high.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD032]" />
          <span className="text-[#91A4C2]">Medium</span>
          <span className="text-white font-mono ml-auto font-semibold">{medium.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F]" />
          <span className="text-[#91A4C2]">Low</span>
          <span className="text-white font-mono ml-auto font-semibold">{low.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Donut Chart matching reference image
export function TrafficDonutWidget({ benign = 1582561, attack = 517410 }) {
  const total = benign + attack || 1;
  const benignPct = ((benign / total) * 100).toFixed(2);
  const strokeWidth = 14;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const benignStroke = (benign / total) * circumference;
  const attackStroke = (attack / total) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full pt-1">
      <div className="relative flex items-center justify-center my-auto">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          {/* Benign Arc (Blue/Cyan) */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#00C8FF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${benignStroke} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Attack Arc (Red) */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#FF405B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${attackStroke} ${circumference}`}
            strokeDashoffset={-benignStroke}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-lg font-bold text-white font-mono">{benignPct}%</span>
          <span className="text-[10px] text-[#91A4C2] uppercase font-semibold tracking-wider">Benign</span>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-center gap-5 w-full pt-2 border-t border-[#1A3558]/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF]" />
          <span className="text-[#91A4C2]">Benign</span>
          <span className="text-white font-mono font-medium">{benign.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF405B]" />
          <span className="text-[#91A4C2]">Attack</span>
          <span className="text-white font-mono font-medium">{attack.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Dual Curve Model Performance Widget matching reference image
export function ModelPerformanceWidget({ rfAcc = "99.95%", gbtAcc = "99.97%", f1 = "99.96%", auc = "1.0000" }) {
  // SVG points for curves
  const width = 180;
  const height = 95;
  const padding = 15;

  // RF curve points (cyan)
  const rfPoints = [
    { x: 0, y: 0.68 }, { x: 5, y: 0.88 }, { x: 10, y: 0.94 }, { x: 15, y: 0.98 }, { x: 20, y: 0.9995 }
  ];
  // GBT curve points (purple)
  const gbtPoints = [
    { x: 0, y: 0.72 }, { x: 5, y: 0.92 }, { x: 10, y: 0.97 }, { x: 15, y: 0.99 }, { x: 20, y: 0.9997 }
  ];

  const toCoord = (pt) => {
    const x = padding + (pt.x / 20) * (width - 2 * padding);
    const y = height - padding - ((pt.y - 0.6) / 0.4) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const rfPath = rfPoints.map(toCoord).join(' ');
  const gbtPath = gbtPoints.map(toCoord).join(' ');

  return (
    <div className="flex items-center justify-between h-full pt-1 gap-4">
      {/* Metric List on Left */}
      <div className="space-y-2.5 flex-1 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#91A4C2]">RF Accuracy</span>
          <span className="text-white font-semibold">{rfAcc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4C2]">GBT Accuracy</span>
          <span className="text-[#00D68F] font-bold">{gbtAcc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4C2]">F1-Score</span>
          <span className="text-[#00C8FF] font-bold">{f1}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4C2]">AUC-ROC</span>
          <span className="text-[#00D68F] font-semibold">{auc}</span>
        </div>
      </div>

      {/* Mini Performance Curves on Right */}
      <div className="flex flex-col items-end">
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] mb-1 font-mono">
          <span className="flex items-center gap-1 text-[#00C8FF]">
            <span className="w-2 h-2 rounded-full bg-[#00C8FF]" /> RF
          </span>
          <span className="flex items-center gap-1 text-[#925CFF]">
            <span className="w-2 h-2 rounded-full bg-[#925CFF]" /> GBT
          </span>
        </div>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Axis lines */}
          <line x1={padding} y1={height - padding} x2={width} y2={height - padding} stroke="#1A3558" strokeWidth="1" />
          <line x1={padding} y1={0} x2={padding} y2={height - padding} stroke="#1A3558" strokeWidth="1" />

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - f * (height - 2 * padding)}
              x2={width}
              y2={height - padding - f * (height - 2 * padding)}
              stroke="#132742"
              strokeDasharray="2 2"
            />
          ))}

          {/* GBT Curve */}
          <polyline fill="none" stroke="#925CFF" strokeWidth="2.5" points={gbtPath} />
          {gbtPoints.map((p, idx) => {
            const [x, y] = toCoord(p).split(',');
            return <circle key={idx} cx={x} cy={y} r="2.5" fill="#925CFF" stroke="#0D1B32" strokeWidth="1" />;
          })}

          {/* RF Curve */}
          <polyline fill="none" stroke="#00C8FF" strokeWidth="2.5" points={rfPath} />
          {rfPoints.map((p, idx) => {
            const [x, y] = toCoord(p).split(',');
            return <circle key={idx} cx={x} cy={y} r="2.5" fill="#00C8FF" stroke="#0D1B32" strokeWidth="1" />;
          })}

          {/* X Axis ticks */}
          <text x={padding} y={height - 2} fill="#627794" fontSize="8">0</text>
          <text x={padding + (width - 2 * padding) * 0.25} y={height - 2} fill="#627794" fontSize="8">5k</text>
          <text x={padding + (width - 2 * padding) * 0.5} y={height - 2} fill="#627794" fontSize="8">10k</text>
          <text x={padding + (width - 2 * padding) * 0.75} y={height - 2} fill="#627794" fontSize="8">15k</text>
          <text x={width - 10} y={height - 2} fill="#627794" fontSize="8">20k</text>

          {/* Y Axis ticks */}
          <text x={2} y={height - padding} fill="#627794" fontSize="8">0.6</text>
          <text x={2} y={padding + 5} fill="#627794" fontSize="8">1.0</text>
        </svg>
      </div>
    </div>
  );
}

// Top Attack Categories Bar Chart matching reference image
export function TopAttackCategoriesBar() {
  const categories = [
    { label: 'C (Web Attacks)', pct: 11.69, color: '#FF405B' },
    { label: 'DDoS', pct: 10.24, color: '#FF9F32' },
    { label: 'PortScan', pct: 8.72, color: '#FFD032' },
    { label: 'Brute Force', pct: 7.31, color: '#2585FF' },
    { label: 'Botnet', pct: 6.85, color: '#925CFF' }
  ];

  const maxPct = 14;

  return (
    <div className="flex items-end justify-between h-44 pt-5 pb-2 px-3 border-b border-[#1A3558]/60">
      {categories.map((c, i) => {
        const heightPct = (c.pct / maxPct) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group px-2">
            <span className="text-[11px] font-mono font-bold text-white mb-1.5 transition-all group-hover:scale-110">
              {c.pct.toFixed(2)}%
            </span>
            <div 
              className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
              style={{
                height: `${heightPct}%`,
                backgroundColor: c.color,
                boxShadow: `0 0 12px -2px ${c.color}66`
              }}
            />
            <span className="text-[10px] text-[#91A4C2] mt-2 truncate w-full text-center group-hover:text-white">
              {c.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Temporal Traffic Pattern Area Chart matching reference image
export function TemporalTrafficArea() {
  const width = 360;
  const height = 150;
  const pad = 20;

  // Realistic time data points
  const points = [
    { t: '00:00', normal: 60, attack: 15 },
    { t: '02:00', normal: 68, attack: 22 },
    { t: '04:00', normal: 62, attack: 18 },
    { t: '06:00', normal: 75, attack: 30 },
    { t: '08:00', normal: 110, attack: 45 },
    { t: '10:00', normal: 125, attack: 58 },
    { t: '12:00', normal: 95, attack: 40 },
    { t: '14:00', normal: 135, attack: 65 },
    { t: '16:00', normal: 115, attack: 52 },
    { t: '18:00', normal: 120, attack: 48 },
    { t: '20:00', normal: 85, attack: 28 },
    { t: '22:00', normal: 70, attack: 20 }
  ];

  const maxVal = 160;

  const toCoordNormal = (p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - 2 * pad);
    const y = height - pad - (p.normal / maxVal) * (height - 2 * pad);
    return { x, y };
  };

  const toCoordAttack = (p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - 2 * pad);
    const y = height - pad - (p.attack / maxVal) * (height - 2 * pad);
    return { x, y };
  };

  const normalCoords = points.map(toCoordNormal);
  const attackCoords = points.map(toCoordAttack);

  const normalLineD = normalCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`, '');
  const normalAreaD = `${normalLineD} L ${(width - pad).toFixed(1)} ${height - pad} L ${pad} ${height - pad} Z`;

  const attackLineD = attackCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`, '');

  return (
    <div className="w-full relative pt-1">
      {/* Legend on top right */}
      <div className="flex items-center justify-end gap-4 text-[10px] mb-1 font-mono">
        <span className="flex items-center gap-1.5 text-[#00C8FF]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF]" /> Normal
        </span>
        <span className="flex items-center gap-1.5 text-[#FF405B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF405B]" /> Attack
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="temporalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00C8FF" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid */}
        {[0.33, 0.66, 1.0].map((f, idx) => (
          <line
            key={idx}
            x1={pad}
            y1={height - pad - f * (height - 2 * pad)}
            x2={width - pad}
            y2={height - pad - f * (height - 2 * pad)}
            stroke="#132742"
            strokeDasharray="2 2"
          />
        ))}

        {/* Normal Area fill */}
        <path d={normalAreaD} fill="url(#temporalGrad)" />

        {/* Normal Line */}
        <path d={normalLineD} fill="none" stroke="#00C8FF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Attack Line */}
        <path d={attackLineD} fill="none" stroke="#FF405B" strokeWidth="2" strokeDasharray="3 3" />

        {/* Y Axis Labels */}
        <text x="0" y={height - pad} fill="#627794" fontSize="8" fontMono="true">0k</text>
        <text x="0" y={height - pad - 0.33 * (height - 2 * pad)} fill="#627794" fontSize="8">50k</text>
        <text x="0" y={height - pad - 0.66 * (height - 2 * pad)} fill="#627794" fontSize="8">100k</text>
        <text x="0" y={pad + 8} fill="#627794" fontSize="8">150k</text>

        {/* X Axis Labels */}
        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((label, i) => {
          const x = pad + (i / 5) * (width - 2 * pad);
          return (
            <text key={i} x={x} y={height - 2} fill="#627794" fontSize="8" textAnchor="middle">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Top Source IPs Table Widget matching reference image
export function TopSourceIPsTable({ onViewAll }) {
  const sources = [
    { ip: '172.16.0.1', flows: 862, score: 56.23 },
    { ip: '192.168.10.9', flows: 421, score: 48.17 },
    { ip: '10.0.0.5', flows: 318, score: 42.75 },
    { ip: '172.16.0.23', flows: 276, score: 38.90 },
    { ip: '192.168.1.12', flows: 243, score: 36.12 }
  ];

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[#627794] text-[10px] uppercase border-b border-[#1A3558]/60">
            <tr>
              <th className="pb-2 font-medium">Source IP</th>
              <th className="pb-2 font-medium text-center">Attack Flows</th>
              <th className="pb-2 font-medium text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A3558]/40">
            {sources.map((s, i) => (
              <tr key={i} className="hover:bg-[#11223F]/50 transition-colors">
                <td className="py-2 text-[#EAF2FF] font-semibold">{s.ip}</td>
                <td className="py-2 text-center text-[#FF9F32]">{s.flows}</td>
                <td className="py-2 text-right text-[#FF405B] font-bold">{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-right">
        <button
          onClick={onViewAll}
          className="text-xs text-[#00C8FF] hover:text-[#52d6ff] transition-colors font-medium inline-flex items-center gap-1"
        >
          View All &rarr;
        </button>
      </div>
    </div>
  );
}
