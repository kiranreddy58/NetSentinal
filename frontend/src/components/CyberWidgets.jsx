import React from 'react';

// Semicircular Threat Severity Gauge matching reference image
export function ThreatSeverityGauge({ score = 92.4, status = 'CRITICAL', critical = 203, high = 10470, medium = 243, low = 13213 }) {
  const strokeWidth = 14;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between h-full pt-1 gap-3 sm:gap-2">
      {/* Semicircle SVG */}
      <div className="relative flex flex-col items-center justify-center shrink-0">
        <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible w-[180px] sm:w-[210px] md:w-[220px] h-auto">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D68F" />     {/* Green */}
              <stop offset="35%" stopColor="#FFD032" />    {/* Yellow */}
              <stop offset="65%" stopColor="#FFA33A" />    {/* Orange */}
              <stop offset="100%" stopColor="#FF475D" />   {/* Red */}
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
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
        <div className="absolute bottom-1 flex flex-col items-center pointer-events-none">
          <span className="text-lg sm:text-xl font-black tracking-wider text-[#FF475D] drop-shadow-[0_0_8px_rgba(255,71,93,0.5)]">
            {status}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#91A4BE] font-mono mt-0.5 font-medium">
            Risk Score: <strong className="text-white">{score}/100</strong>
          </span>
        </div>
      </div>

      {/* Legend Column on Right */}
      <div className="space-y-1.5 sm:space-y-2 pr-1 sm:pr-2 text-xs w-full sm:w-auto font-mono">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF475D] shadow-[0_0_6px_#FF475D]" />
            <span className="text-[#91A4BE]">Critical</span>
          </div>
          <span className="text-white font-semibold ml-auto">{critical.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFA33A] shadow-[0_0_6px_#FFA33A]" />
            <span className="text-[#91A4BE]">High</span>
          </div>
          <span className="text-white font-semibold ml-auto">{high.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD032] shadow-[0_0_6px_#FFD032]" />
            <span className="text-[#91A4BE]">Medium</span>
          </div>
          <span className="text-white font-semibold ml-auto">{medium.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F] shadow-[0_0_6px_#00D68F]" />
            <span className="text-[#91A4BE]">Low</span>
          </div>
          <span className="text-white font-semibold ml-auto">{low.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Donut Chart matching reference image
export function TrafficDonutWidget({ benign = 1582561, attack = 517410 }) {
  const total = benign + attack || 1;
  const benignPct = ((benign / total) * 100).toFixed(2);
  const strokeWidth = 16;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const benignStroke = (benign / total) * circumference;
  const attackStroke = (attack / total) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full pt-1">
      <div className="relative flex items-center justify-center my-auto">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90 w-[130px] sm:w-[145px] md:w-[150px] h-auto">
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
            className="transition-all duration-500 drop-shadow-[0_0_6px_rgba(0,200,255,0.4)]"
          />
          {/* Attack Arc (Red) */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#FF475D"
            strokeWidth={strokeWidth}
            strokeDasharray={`${attackStroke} ${circumference}`}
            strokeDashoffset={-benignStroke}
            className="transition-all duration-500 drop-shadow-[0_0_6px_rgba(255,71,93,0.4)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-base sm:text-lg lg:text-xl font-black text-white font-mono tracking-tight">{benignPct}%</span>
          <span className="text-[10px] sm:text-[11px] text-[#91A4BE] font-semibold tracking-wide">Benign</span>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 w-full pt-2 border-t border-[#20334D]/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF] shadow-[0_0_6px_#00C8FF]" />
          <span className="text-[#91A4BE]">Benign</span>
          <span className="text-white font-medium">{benign.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF475D] shadow-[0_0_6px_#FF475D]" />
          <span className="text-[#91A4BE]">Attack</span>
          <span className="text-white font-medium">{attack.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Dual Curve Model Performance Widget matching reference image
export function ModelPerformanceWidget({ rfAcc = "99.95%", gbtAcc = "99.97%", f1 = "99.96%", auc = "1.0000" }) {
  const width = 190;
  const height = 95;
  const padding = 16;

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
    <div className="flex flex-col sm:flex-row items-center justify-between h-full pt-1 gap-3 sm:gap-4">
      {/* Metric List on Left */}
      <div className="space-y-1.5 sm:space-y-2 flex-1 font-mono text-xs w-full sm:w-auto">
        <div className="flex items-center justify-between">
          <span className="text-[#91A4BE]">RF Accuracy</span>
          <span className="text-white font-semibold">{rfAcc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4BE]">GBT Accuracy</span>
          <span className="text-[#00D68F] font-bold">{gbtAcc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4BE]">F1-Score</span>
          <span className="text-[#00C8FF] font-bold">{f1}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#91A4BE]">AUC-ROC</span>
          <span className="text-[#00D68F] font-semibold">{auc}</span>
        </div>
      </div>

      {/* Mini Performance Curves on Right */}
      <div className="flex flex-col items-end shrink-0 w-full sm:w-auto">
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] mb-1 font-mono self-end">
          <span className="flex items-center gap-1.5 text-[#00C8FF]">
            <span className="w-2 h-2 rounded-full bg-[#00C8FF] shadow-[0_0_4px_#00C8FF]" /> RF
          </span>
          <span className="flex items-center gap-1.5 text-[#9565FF]">
            <span className="w-2 h-2 rounded-full bg-[#9565FF] shadow-[0_0_4px_#9565FF]" /> GBT
          </span>
        </div>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible w-[150px] sm:w-[170px] md:w-[190px] h-auto">
          {/* Axis lines */}
          <line x1={padding} y1={height - padding} x2={width} y2={height - padding} stroke="#20334D" strokeWidth="1" />
          <line x1={padding} y1={0} x2={padding} y2={height - padding} stroke="#20334D" strokeWidth="1" />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((f, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - f * (height - 2 * padding)}
              x2={width}
              y2={height - padding - f * (height - 2 * padding)}
              stroke="#13233B"
              strokeDasharray="2 2"
            />
          ))}

          {/* GBT Curve */}
          <polyline fill="none" stroke="#9565FF" strokeWidth="2.5" points={gbtPath} />
          {gbtPoints.map((p, idx) => {
            const [x, y] = toCoord(p).split(',');
            return <circle key={idx} cx={x} cy={y} r="2.5" fill="#9565FF" stroke="#101D31" strokeWidth="1" />;
          })}

          {/* RF Curve */}
          <polyline fill="none" stroke="#00C8FF" strokeWidth="2.5" points={rfPath} />
          {rfPoints.map((p, idx) => {
            const [x, y] = toCoord(p).split(',');
            return <circle key={idx} cx={x} cy={y} r="2.5" fill="#00C8FF" stroke="#101D31" strokeWidth="1" />;
          })}

          {/* X Axis ticks */}
          <text x={padding} y={height - 2} fill="#91A4BE" fontSize="8">0</text>
          <text x={padding + (width - 2 * padding) * 0.25} y={height - 2} fill="#91A4BE" fontSize="8">5k</text>
          <text x={padding + (width - 2 * padding) * 0.5} y={height - 2} fill="#91A4BE" fontSize="8">10k</text>
          <text x={padding + (width - 2 * padding) * 0.75} y={height - 2} fill="#91A4BE" fontSize="8">15k</text>
          <text x={width - 8} y={height - 2} fill="#91A4BE" fontSize="8">20k</text>

          {/* Y Axis ticks */}
          <text x={1} y={height - padding} fill="#91A4BE" fontSize="8">0.6</text>
          <text x={1} y={padding + 5} fill="#91A4BE" fontSize="8">1.0</text>
        </svg>
      </div>
    </div>
  );
}

// Top Attack Categories Bar Chart matching reference image
export function TopAttackCategoriesBar() {
  const categories = [
    { label: 'C (Web Attacks)', pct: 11.69, color: '#FF475D' },
    { label: 'DDoS', pct: 10.24, color: '#FFA33A' },
    { label: 'PortScan', pct: 8.72, color: '#FFD032' },
    { label: 'Brute Force', pct: 7.31, color: '#3185FF' },
    { label: 'Botnet', pct: 6.85, color: '#9565FF' }
  ];

  const maxPct = 14;

  return (
    <div className="flex items-end justify-between h-40 sm:h-44 pt-3 pb-2 px-1 sm:px-3 border-b border-[#20334D]/60 gap-1.5 sm:gap-2">
      {categories.map((c, i) => {
        const heightPct = (c.pct / maxPct) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group px-0.5 sm:px-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-white mb-1.5 transition-all group-hover:scale-110 truncate">
              {c.pct.toFixed(2)}%
            </span>
            <div 
              className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 min-h-[4px]"
              style={{
                height: `${heightPct}%`,
                backgroundColor: c.color,
                boxShadow: `0 0 10px -2px ${c.color}66`
              }}
            />
            <span className="text-[9px] sm:text-[10px] text-[#91A4BE] mt-2 truncate w-full text-center group-hover:text-white font-mono" title={c.label}>
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF] shadow-[0_0_6px_#00C8FF]" /> Normal
        </span>
        <span className="flex items-center gap-1.5 text-[#FF475D]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF475D] shadow-[0_0_6px_#FF475D]" /> Attack
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="temporalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.4" />
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
            stroke="#13233B"
            strokeDasharray="2 2"
          />
        ))}

        {/* Normal Area fill */}
        <path d={normalAreaD} fill="url(#temporalGrad)" />

        {/* Normal Line */}
        <path d={normalLineD} fill="none" stroke="#00C8FF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Attack Line */}
        <path d={attackLineD} fill="none" stroke="#FF475D" strokeWidth="2" strokeDasharray="3 3" />

        {/* Y Axis Labels */}
        <text x="0" y={height - pad} fill="#91A4BE" fontSize="8" fontMono="true">0k</text>
        <text x="0" y={height - pad - 0.33 * (height - 2 * pad)} fill="#91A4BE" fontSize="8">50k</text>
        <text x="0" y={height - pad - 0.66 * (height - 2 * pad)} fill="#91A4BE" fontSize="8">100k</text>
        <text x="0" y={pad + 8} fill="#91A4BE" fontSize="8">150k</text>

        {/* X Axis Labels */}
        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((label, i) => {
          const x = pad + (i / 5) * (width - 2 * pad);
          return (
            <text key={i} x={x} y={height - 2} fill="#91A4BE" fontSize="8" textAnchor="middle">
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
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[#91A4BE] text-[10px] uppercase border-b border-[#20334D]/60">
            <tr>
              <th className="pb-2 font-medium">Source IP</th>
              <th className="pb-2 font-medium text-center">Attack Flows</th>
              <th className="pb-2 font-medium text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#20334D]/40">
            {sources.map((s, i) => (
              <tr key={i} className="hover:bg-[#13233B]/50 transition-colors">
                <td className="py-2 text-[#EAF1FF] font-semibold">{s.ip}</td>
                <td className="py-2 text-center text-[#FFA33A] font-semibold">{s.flows}</td>
                <td className={`py-2 text-right font-bold ${
                  s.score >= 50 ? 'text-[#FF475D]' : s.score >= 40 ? 'text-[#FFA33A]' : 'text-[#FFD032]'
                }`}>
                  {s.score.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-right">
        <button
          onClick={onViewAll}
          className="text-xs text-[#00C8FF] hover:text-[#52d6ff] transition-colors font-semibold inline-flex items-center gap-1 hover:underline"
        >
          View All &rarr;
        </button>
      </div>
    </div>
  );
}
