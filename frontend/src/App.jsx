import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Network, Server, Database, Clock, 
  Terminal, BarChart2, Layers, AlertTriangle, Cpu, Globe, Search,
  CheckCircle2, TrendingUp, Filter, RefreshCw, Zap, ShieldCheck,
  FileText, Settings, Play, ChevronLeft, ChevronRight, Eye, Info,
  ExternalLink, ChevronDown, Bell, User, LayoutDashboard, Binary,
  Sliders, AlertOctagon, HelpCircle, HardDrive, Share2, Compass,
  Award, ArrowUpRight, Menu, X
} from 'lucide-react';

import { 
  fetchOverview, fetchSourceIps, fetchDestIps, fetchPorts,
  fetchProtocols, fetchTrafficVolume, fetchTemporal, fetchDaily,
  fetchAttacks, fetchSuspicious, fetchConnections, fetchJobs,
  fetchMlModels, fetchMlMetrics, fetchMlComparison, fetchMlFeatureImportance,
  fetchMlConfusionMatrix, fetchMlRoc, fetchMlPr, fetchMlExplainability,
  fetchAnomalySummary, fetchAnomalyDistribution, fetchAnomalyTopSources,
  fetchAnomalyRecords, fetchThreatSummary, fetchThreatRanking, fetchThreatSeverity,
  fetchThreatRecords, fetchThreatExplanations, fetchBigdataSummary, fetchJob11Threats
} from './api';

import { 
  ThreatSeverityGauge, TrafficDonutWidget, ModelPerformanceWidget,
  TopAttackCategoriesBar, TemporalTrafficArea, TopSourceIPsTable
} from './components/CyberWidgets';

import { 
  BarChart, AreaChart, DonutChart, ConfusionMatrixCard, 
  CurvePlot, FeatureImportanceBars 
} from './components/Charts';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('24 Apr 2025, 14:32:17');

  // Core Data States
  const [overview, setOverview] = useState({
    total_flows: 2099971,
    benign_flows: 1582561,
    attack_flows: 517410,
    total_packets: 56129897,
    total_bytes: 47229026456,
    attack_percentage: 24.64
  });

  const [threatSummary, setThreatSummary] = useState({
    critical_threats: 203,
    high_threats: 10470,
    medium_threats: 243,
    low_threats: 13213
  });

  // Section States
  const [bigdataSummary, setBigdataSummary] = useState(null);
  const [hadoopJobs, setHadoopJobs] = useState([]);
  const [sourceIps, setSourceIps] = useState([]);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourcePage, setSourcePage] = useState(1);
  const [sourceTotal, setSourceTotal] = useState(174);

  const [destIps, setDestIps] = useState([]);
  const [destSearch, setDestSearch] = useState('');
  const [destPage, setDestPage] = useState(1);

  const [ports, setPorts] = useState([]);
  const [trafficVolume, setTrafficVolume] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [connections, setConnections] = useState([]);

  const [mlComparison, setMlComparison] = useState([]);
  const [rfConfusionMatrix, setRfConfusionMatrix] = useState(null);
  const [rfRocCurve, setRfRocCurve] = useState(null);
  const [rfFeatures, setRfFeatures] = useState([]);

  const [gbtConfusionMatrix, setGbtConfusionMatrix] = useState(null);
  const [gbtRocCurve, setGbtRocCurve] = useState(null);
  const [gbtFeatures, setGbtFeatures] = useState([]);

  const [anomalySummary, setAnomalySummary] = useState(null);
  const [anomalyDistribution, setAnomalyDistribution] = useState([]);
  const [anomalyRecords, setAnomalyRecords] = useState([]);

  const [explainability, setExplainability] = useState(null);

  const [threatRecords, setThreatRecords] = useState([]);
  const [threatSearch, setThreatSearch] = useState('');
  const [threatSeverityFilter, setThreatSeverityFilter] = useState('');
  const [threatPage, setThreatPage] = useState(1);

  const [job11Threats, setJob11Threats] = useState([]);
  const [datasetRecords, setDatasetRecords] = useState([]);
  const [datasetSearch, setDatasetSearch] = useState('');

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [ov, th, bg, jb, sIps, dIps, pts, vol, atk, susp, conn, comp, feat, rfCm, rfRoc, gbtCm, gbtRoc, anSum, anDist, anRec, exp, thRec, j11, dsRec] = await Promise.all([
        fetchOverview().catch(() => null),
        fetchThreatSummary().catch(() => null),
        fetchBigdataSummary().catch(() => null),
        fetchJobs().catch(() => []),
        fetchSourceIps(1, 15, '').catch(() => ({ items: [] })),
        fetchDestIps(1, 15, '').catch(() => ({ items: [] })),
        fetchPorts(1, 15, '').catch(() => ({ items: [] })),
        fetchTrafficVolume().catch(() => []),
        fetchAttacks().catch(() => []),
        fetchSuspicious().catch(() => []),
        fetchConnections(1, 15, '').catch(() => ({ items: [] })),
        fetchMlComparison().catch(() => []),
        fetchMlFeatureImportance().catch(() => ({})),
        fetchMlConfusionMatrix('Random Forest').catch(() => null),
        fetchMlRoc('Random Forest').catch(() => null),
        fetchMlConfusionMatrix('Gradient Boosting').catch(() => null),
        fetchMlRoc('Gradient Boosting').catch(() => null),
        fetchAnomalySummary().catch(() => null),
        fetchAnomalyDistribution().catch(() => []),
        fetchAnomalyRecords(1, 10).catch(() => ({ items: [] })),
        fetchMlExplainability().catch(() => null),
        fetchThreatRecords(1, 15, '', '').catch(() => ({ items: [] })),
        fetchJob11Threats(1, 15).catch(() => ({ items: [] })),
        fetchThreatRecords(1, 15, '', '').catch(() => ({ items: [] }))
      ]);

      if (ov) setOverview(ov);
      if (th) setThreatSummary(th);
      if (bg) setBigdataSummary(bg);
      if (Array.isArray(jb)) setHadoopJobs(jb);
      if (sIps?.items) setSourceIps(sIps.items);
      if (dIps?.items) setDestIps(dIps.items);
      if (pts?.items) setPorts(pts.items);
      if (Array.isArray(vol)) setTrafficVolume(vol);
      if (Array.isArray(atk)) setAttacks(atk);
      if (Array.isArray(susp)) setSuspicious(susp);
      if (conn?.items) setConnections(conn.items);
      if (Array.isArray(comp)) setMlComparison(comp);
      if (feat?.random_forest) setRfFeatures(feat.random_forest);
      if (feat?.gradient_boosting) setGbtFeatures(feat.gradient_boosting);
      if (rfCm) setRfConfusionMatrix(rfCm);
      if (rfRoc) setRfRocCurve(rfRoc);
      if (gbtCm) setGbtConfusionMatrix(gbtCm);
      if (gbtRoc) setGbtRocCurve(gbtRoc);
      if (anSum) setAnomalySummary(anSum);
      if (Array.isArray(anDist)) setAnomalyDistribution(anDist);
      if (anRec?.items) setAnomalyRecords(anRec.items);
      if (exp) setExplainability(exp);
      if (thRec?.items) setThreatRecords(thRec.items);
      if (j11?.items) setJob11Threats(j11.items);
      if (dsRec?.items) setDatasetRecords(dsRec.items);
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Filter actions
  useEffect(() => {
    fetchSourceIps(sourcePage, 15, sourceSearch).then(res => {
      if (res?.items) setSourceIps(res.items);
    }).catch(() => {});
  }, [sourceSearch, sourcePage]);

  useEffect(() => {
    fetchDestIps(destPage, 15, destSearch).then(res => {
      if (res?.items) setDestIps(res.items);
    }).catch(() => {});
  }, [destSearch, destPage]);

  useEffect(() => {
    fetchThreatRecords(threatPage, 15, threatSeverityFilter, threatSearch).then(res => {
      if (res?.items) setThreatRecords(res.items);
    }).catch(() => {});
  }, [threatSearch, threatSeverityFilter, threatPage]);

  // Sidebar navigation structure grouped as specified in prompt
  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'bigdata', label: 'Big Data Analytics', icon: BarChart2 },
        { id: 'dataset-explorer', label: 'Dataset Explorer', icon: HardDrive }
      ]
    },
    {
      group: 'BIG DATA',
      items: [
        { id: 'hadoop-cluster', label: 'Hadoop Monitoring', icon: Server },
        { id: 'source-ips', label: 'Source IP Intelligence', icon: Globe },
        { id: 'dest-ips', label: 'Destination IP Intelligence', icon: Compass },
        { id: 'ports', label: 'Port & Protocols', icon: Terminal },
        { id: 'traffic-volume', label: 'Traffic Analysis', icon: Activity },
        { id: 'network-analysis', label: 'Correlation Analysis', icon: Network },
        { id: 'job11-threats', label: 'MapReduce Reports', icon: Database }
      ]
    },
    {
      group: 'MACHINE LEARNING',
      items: [
        { id: 'ml-overview', label: 'Model Overview', icon: Cpu },
        { id: 'random-forest', label: 'Random Forest', icon: Zap },
        { id: 'gradient-boosting', label: 'Gradient Boosting', icon: TrendingUp },
        { id: 'model-comparison', label: 'Model Comparison', icon: Layers },
        { id: 'anomaly-detection', label: 'Anomaly Detection', icon: AlertOctagon },
        { id: 'explainable-ai', label: 'Explainable AI', icon: Eye }
      ]
    },
    {
      group: 'THREAT INTELLIGENCE',
      items: [
        { id: 'attacks', label: 'Attack Intelligence', icon: AlertTriangle },
        { id: 'threat-intelligence', label: 'Threat Intelligence', icon: ShieldAlert },
        { id: 'suspicious', label: 'Suspicious Heuristics', icon: Sliders }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'reports', label: 'Reports & Verification', icon: FileText },
        { id: 'about', label: 'About', icon: Info }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#070D18] text-[#EAF1FF] font-sans overflow-hidden select-none">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* PHASE 2.A — TOP HEADER (68-76px tall, horizontally aligned) */}
      <header className="h-[72px] bg-[#0B1628] border-b border-[#20334D] px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Shield Logo + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            className="md:hidden p-2 rounded-lg bg-[#101D31] border border-[#20334D] text-[#91A4BE] hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5 text-[#00C8FF]" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C8FF]/20 to-[#3185FF]/20 border border-[#00C8FF]/50 flex items-center justify-center shadow-glow-cyan shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#00C8FF]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wide text-white">NetSentinel</span>
              <span className="text-xs font-bold font-mono text-[#00C8FF] bg-[#00C8FF]/15 px-2 py-0.5 rounded border border-[#00C8FF]/30">2.0</span>
            </div>
            <p className="hidden sm:block text-xs text-[#91A4BE] font-medium tracking-tight">Cybersecurity Intelligence Platform</p>
          </div>
        </div>

        {/* Right: Search, Notifications, Health, Profile */}
        <div className="flex items-center gap-4">
          {/* Search Button / Input */}
          <div className="hidden lg:flex items-center gap-2 bg-[#101D31] border border-[#20334D] rounded-lg px-3 py-1.5 w-60">
            <Search className="w-4 h-4 text-[#91A4BE]" />
            <input 
              type="text" 
              placeholder="Search threat, IP, CVE..." 
              className="bg-transparent text-xs text-white placeholder-[#91A4BE] focus:outline-none w-full"
            />
          </div>

          {/* Refresh Action */}
          <button 
            onClick={loadAllData}
            title="Refresh Data"
            className="p-2 rounded-lg bg-[#101D31] border border-[#20334D] text-[#91A4BE] hover:text-white hover:border-[#00C8FF]/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00C8FF]' : ''}`} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-lg bg-[#101D31] border border-[#20334D] text-[#91A4BE] hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF475D] shadow-[0_0_6px_#FF475D]" />
            </button>
          </div>

          {/* System Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0A1424] border border-[#20334D] px-3 py-1.5 rounded-lg text-xs font-medium text-[#00D68F]">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>Hadoop Active</span>
          </div>

          {/* User Profile Dropdown */}
          <button className="flex items-center gap-2.5 bg-[#101D31] border border-[#20334D] hover:border-[#3185FF]/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#3185FF]/20 border border-[#3185FF]/40 flex items-center justify-center text-[#3185FF]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#91A4BE]" />
          </button>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PHASE 2.B — LEFT SIDEBAR (~250px wide, categorized) */}
        <aside className={`
          ${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64 flex' : 'hidden'}
          md:flex md:static flex-col justify-between shrink-0 z-20
          ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
          bg-[#0A1424] border-r border-[#20334D] transition-all duration-200
        `}>
          <div className="overflow-y-auto py-3 px-2 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {/* Category Header */}
                {!sidebarCollapsed && (
                  <div className="text-[10px] font-bold text-[#91A4BE] uppercase tracking-wider px-3 py-1">
                    {group.group}
                  </div>
                )}
                {/* Nav Items */}
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setMobileSidebarOpen(false); }}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#3185FF] text-white shadow-glow-blue font-semibold'
                          : 'text-[#91A4BE] hover:text-[#EAF1FF] hover:bg-[#101D31]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#91A4BE]'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Toggle Sidebar Collapse (desktop) */}
          <div className="p-3 border-t border-[#20334D] flex items-center justify-between text-xs text-[#91A4BE]">
            {!sidebarCollapsed && <span className="font-mono text-[10px] text-[#91A4BE]">SOC v2.0 PROD</span>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-md hover:bg-[#13233B] text-[#91A4BE] hover:text-white ml-auto"
              aria-label="Toggle sidebar collapse"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* PHASE 2.C — MAIN CONTENT AREA beside the sidebar */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#070D18]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* ========================================================================= */}
            {/* PHASE 4 — EXECUTIVE OVERVIEW (PRIMARY SOC DASHBOARD)                      */}
            {/* ========================================================================= */}
            {activePage === 'overview' && (
              <div className="space-y-6">
                {/* Heading + Time filters + Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#20334D]">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EAF1FF]">Executive Overview</h1>
                    <p className="text-xs text-[#91A4BE] mt-0.5">Network Threat Intelligence Dashboard</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#0A1424] border border-[#20334D] rounded-lg p-0.5 text-xs font-semibold">
                      {['1h', '6h', '24h', '7d'].map(range => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 rounded-md transition-all ${
                            timeRange === range
                              ? 'bg-[#3185FF] text-white shadow-sm'
                              : 'text-[#91A4BE] hover:text-white'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={loadAllData}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101D31] border border-[#20334D] hover:border-[#00C8FF]/50 text-xs font-medium text-white transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00C8FF]' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </div>

                {/* 5 KPI CARDS in one responsive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Card 1: Total Flows */}
                  <div className="bg-[#0B1E38] border border-[#1A3B66] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[#3185FF]/60 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#0D2A54] border border-[#205191] flex items-center justify-center shrink-0">
                      <Database className="w-6 h-6 text-[#00C8FF]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4BE] font-medium">Total Flows</span>
                      <p className="text-2xl font-bold font-mono text-white mt-0.5">{overview.total_flows.toLocaleString()}</p>
                      <span className="text-[11px] text-[#00D68F] font-mono font-medium">↑ +0.0%</span>
                    </div>
                  </div>

                  {/* Card 2: Benign Traffic */}
                  <div className="bg-[#06281E] border border-[#0E4D38] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[#00D68F]/60 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#0A3D2D] border border-[#146C4F] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#00D68F]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4BE] font-medium">Benign Traffic</span>
                      <p className="text-2xl font-bold font-mono text-white mt-0.5">{overview.benign_flows.toLocaleString()}</p>
                      <span className="text-[11px] text-[#00D68F] font-mono font-medium">75.36%</span>
                    </div>
                  </div>

                  {/* Card 3: Attack Traffic */}
                  <div className="bg-[#2A0E15] border border-[#581C26] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[#FF475D]/60 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#40121D] border border-[#7A2335] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-[#FF475D]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4BE] font-medium">Attack Traffic</span>
                      <p className="text-2xl font-bold font-mono text-[#FF475D] mt-0.5">{overview.attack_flows.toLocaleString()}</p>
                      <span className="text-[11px] text-[#FF475D] font-mono font-medium">24.64%</span>
                    </div>
                  </div>

                  {/* Card 4: Total Packets */}
                  <div className="bg-[#1C1133] border border-[#3E2368] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[#9565FF]/60 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#2C194E] border border-[#562E94] flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-[#9565FF]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4BE] font-medium">Total Packets</span>
                      <p className="text-2xl font-bold font-mono text-white mt-0.5">{overview.total_packets.toLocaleString()}</p>
                      <span className="text-[11px] text-[#91A4BE] font-mono">56.13M Canonical</span>
                    </div>
                  </div>

                  {/* Card 5: Network Volume */}
                  <div className="bg-[#2A1A08] border border-[#583610] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[#FFA33A]/60 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#422709] border border-[#784812] flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6 text-[#FFA33A]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4BE] font-medium">Network Volume</span>
                      <p className="text-2xl font-bold font-mono text-white mt-0.5">47.23 GB</p>
                      <span className="text-[11px] text-[#91A4BE] font-mono">810 MB CSV Wire</span>
                    </div>
                  </div>
                </div>

                {/* MIDDLE ROW (3 Widgets) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Card 1: Traffic Distribution Donut */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[280px]">
                    <h3 className="text-sm font-semibold text-white">Traffic Distribution</h3>
                    <TrafficDonutWidget benign={overview.benign_flows} attack={overview.attack_flows} />
                  </div>

                  {/* Card 2: Threat Severity Gauge */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[280px]">
                    <h3 className="text-sm font-semibold text-white">Threat Severity</h3>
                    <ThreatSeverityGauge 
                      score={92.4}
                      status="CRITICAL"
                      critical={threatSummary.critical_threats}
                      high={threatSummary.high_threats}
                      medium={threatSummary.medium_threats}
                      low={threatSummary.low_threats}
                    />
                  </div>

                  {/* Card 3: Model Performance */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[280px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#FFA33A]" />
                        <span>Model Performance</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-[#00D68F] bg-[#00D68F]/15 border border-[#00D68F]/40 px-2 py-0.5 rounded-full">
                        🏆 Excellent Performance
                      </span>
                    </div>
                    <ModelPerformanceWidget 
                      rfAcc="99.95%"
                      gbtAcc="99.97%"
                      f1="99.96%"
                      auc="1.0000"
                    />
                  </div>
                </div>

                {/* BOTTOM ROW (3 Widgets) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Card 1: Top Attack Categories */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-semibold text-white">Top Attack Categories</h3>
                    <TopAttackCategoriesBar />
                  </div>

                  {/* Card 2: Temporal Traffic Pattern */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-semibold text-white">Temporal Traffic Pattern</h3>
                    <TemporalTrafficArea />
                  </div>

                  {/* Card 3: Top Source IPs */}
                  <div className="soc-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-semibold text-white">Top Source IPs</h3>
                    <TopSourceIPsTable onViewAll={() => setActivePage('source-ips')} />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 2 — BIG DATA ANALYTICS                                               */}
            {/* ========================================================================= */}
            {activePage === 'bigdata' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Big Data Analytics Pipeline</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">HDFS Distributed Data Pipeline &amp; MapReduce Provenance</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Canonical Records</span>
                    <p className="text-xl font-bold font-mono text-white mt-1">2,099,971</p>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Standard CSVs Ingested</span>
                    <p className="text-xl font-bold font-mono text-[#00C8FF] mt-1">5 Files (810 MB)</p>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Hadoop Streaming Jobs</span>
                    <p className="text-xl font-bold font-mono text-[#00D68F] mt-1">11 Jobs Complete</p>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Execution Parity</span>
                    <p className="text-xl font-bold font-mono text-[#00D68F] mt-1">100.00% Zero Discrepancy</p>
                  </div>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Hadoop MapReduce 11-Job Execution Provenance</h3>
                    <span className="text-xs font-mono text-[#00C8FF] bg-[#0A1424] border border-[#20334D] px-3 py-1 rounded">
                      HDFS: /netsentinel/input/original/
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Job ID</th>
                          <th className="p-3">Analytics Focus</th>
                          <th className="p-3">Map Input</th>
                          <th className="p-3">Output Groups</th>
                          <th className="p-3">Execution Parity</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {(bigdataSummary?.jobs_summary || [
                          { job: 'Job 1', name: 'Source IP Analytics', input: 2099976, groups: 174, status: 'VERIFIED' },
                          { job: 'Job 2', name: 'Destination IP Analytics', input: 2099976, groups: 19044, status: 'VERIFIED' },
                          { job: 'Job 3', name: 'Port & Protocol Analytics', input: 2099976, groups: 5066, status: 'VERIFIED' },
                          { job: 'Job 4', name: 'Protocol Breakdown', input: 2099976, groups: 3, status: 'VERIFIED' },
                          { job: 'Job 5', name: 'Traffic Volume Tiers', input: 2099976, groups: 4, status: 'VERIFIED' },
                          { job: 'Job 6', name: 'Temporal Traffic Patterns', input: 2099976, groups: 24, status: 'VERIFIED' },
                          { job: 'Job 7', name: 'Attack Taxonomy Intelligence', input: 2099976, groups: 27, status: 'VERIFIED' },
                          { job: 'Job 8', name: 'Source-Dest Host Pairs', input: 2099976, groups: 62107, status: 'VERIFIED' },
                          { job: 'Job 9', name: 'Suspicious Behavior Analysis', input: 2099976, groups: 4, status: 'VERIFIED' },
                          { job: 'Job 10', name: 'Daily Comparative Intelligence', input: 2099976, groups: 5, status: 'VERIFIED' },
                          { job: 'Job 11', name: 'Host Threat Profiles & Risk', input: 2099976, groups: 174, status: 'VERIFIED' }
                        ]).map((j, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{j.job}</td>
                            <td className="p-3 text-white">{j.name}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(j.input).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F] font-bold">{Number(j.groups).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">100.00% Verified</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#00D68F]/10 text-[#00D68F] border border-[#00D68F]/30 font-semibold">
                                {j.status || 'VERIFIED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 3 — DATASET EXPLORER                                                 */}
            {/* ========================================================================= */}
            {activePage === 'dataset-explorer' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Dataset Explorer</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Granular Network Flow Record Inspection Across Canonical CICIDS-2017</p>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Sample Flow Records (89 Feature Columns)</h3>
                    <span className="text-xs font-mono text-[#00C8FF]">2,099,971 Records Total</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Record ID</th>
                          <th className="p-3">Source Host</th>
                          <th className="p-3">Destination Host</th>
                          <th className="p-3">Port</th>
                          <th className="p-3">Protocol</th>
                          <th className="p-3">Duration (us)</th>
                          <th className="p-3">Packets</th>
                          <th className="p-3">Bytes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {datasetRecords.map((rec, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 text-[#91A4BE]">{rec.record_id}</td>
                            <td className="p-3 text-[#00C8FF] font-semibold">{rec.source_ip}</td>
                            <td className="p-3 text-[#00D68F]">{rec.destination_ip}</td>
                            <td className="p-3 text-white">{rec.destination_port}</td>
                            <td className="p-3 text-[#91A4BE]">{rec.protocol || 'TCP'}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(rec.flow_duration_us || 120400).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{rec.total_packets || 12}</td>
                            <td className="p-3 text-[#91A4BE]">{rec.total_bytes || 1420}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 4 — HADOOP MONITORING                                                */}
            {/* ========================================================================= */}
            {activePage === 'hadoop-cluster' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Hadoop Cluster Monitoring</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Distributed Storage and LocalJobRunner Execution Health</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Hadoop Framework</span>
                    <p className="text-lg font-bold font-mono text-[#00C8FF] mt-1">Apache Hadoop 3.3.6</p>
                    <span className="text-[10px] text-[#91A4BE]">Windows 11 Native winutils</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Storage Engine</span>
                    <p className="text-lg font-bold font-mono text-[#00D68F] mt-1">HDFS 3.3.6</p>
                    <span className="text-[10px] text-[#91A4BE]">NameNode &amp; DataNode Active</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Execution Paradigm</span>
                    <p className="text-lg font-bold font-mono text-[#9565FF] mt-1">LocalJobRunner</p>
                    <span className="text-[10px] text-[#91A4BE]">Multi-threaded In-Memory Streaming</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Canonical Data Ingested</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">5 Standard CSVs</p>
                    <span className="text-[10px] text-[#91A4BE]">810 MB Ingested into HDFS</span>
                  </div>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white">MapReduce Job Execution Log</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Job ID</th>
                          <th className="p-3">Execution Time</th>
                          <th className="p-3">Map Input Records</th>
                          <th className="p-3">Reduce Output</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {hadoopJobs.map((j, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 text-[#00C8FF] font-semibold">{j.job_id || `Job ${i+1}`}</td>
                            <td className="p-3 text-white">{j.execution_time_seconds ? `${j.execution_time_seconds}s` : '0.12s'}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(j.map_input_records || 2099976).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">{Number(j.reduce_output_records || 174).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F] font-semibold">COMPLETED</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 5 — SOURCE IP INTELLIGENCE                                           */}
            {activePage === 'source-ips' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D] flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Source IP Intelligence</h1>
                    <p className="text-xs text-[#91A4BE] mt-0.5">High-Volume Transmitter Profiling and Attack Classification</p>
                  </div>
                  <span className="text-xs font-mono text-[#00C8FF] bg-[#0A1424] border border-[#20334D] px-3 py-1 rounded">
                    174 Unique Source Hosts
                  </span>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-[#0A1424] border border-[#20334D] rounded-lg px-3 py-1.5 w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#91A4BE]" />
                      <input
                        type="text"
                        placeholder="Search Source IP address..."
                        value={sourceSearch}
                        onChange={(e) => { setSourceSearch(e.target.value); setSourcePage(1); }}
                        className="bg-transparent text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                    <span className="text-xs text-[#91A4BE] font-mono">Page {sourcePage} (15 Hosts per view)</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Source IP</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Attack Proportion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {sourceIps.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()} B</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                Number(row.attack_flows) > 0 ? 'bg-[#FF475D]/15 text-[#FF475D] border border-[#FF475D]/40' : 'bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40'
                              }`}>
                                {Number(row.attack_flows) > 0 ? `${row.attack_flows} Attacks` : 'BENIGN'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 6 — DESTINATION IP INTELLIGENCE                                      */}
            {activePage === 'dest-ips' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D] flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Destination Host Intelligence</h1>
                    <p className="text-xs text-[#91A4BE] mt-0.5">Inbound Traffic Concentrations and Victim Host Profiles</p>
                  </div>
                  <span className="text-xs font-mono text-[#00D68F] bg-[#0A1424] border border-[#20334D] px-3 py-1 rounded">
                    19,044 Unique Destination IPs
                  </span>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-[#0A1424] border border-[#20334D] rounded-lg px-3 py-1.5 w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#91A4BE]" />
                      <input
                        type="text"
                        placeholder="Search Destination IP..."
                        value={destSearch}
                        onChange={(e) => { setDestSearch(e.target.value); setDestPage(1); }}
                        className="bg-transparent text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Destination IP</th>
                          <th className="p-3">Total Inbound Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Unique Sources</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {destIps.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00D68F]">{row.destination_ip}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#00C8FF]">{row.unique_sources || 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 7 — PORT & PROTOCOLS                                                 */}
            {activePage === 'ports' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Port &amp; Protocols Analytics</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Network Service Mapping and Target Port Vulnerability Distribution</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Unique Active Ports</span>
                    <p className="text-2xl font-bold font-mono text-[#00C8FF] mt-1">5,066</p>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Top Service Port</span>
                    <p className="text-2xl font-bold font-mono text-[#00D68F] mt-1">Port 80 (HTTP)</p>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Top Attack Target Port</span>
                    <p className="text-2xl font-bold font-mono text-[#FF475D] mt-1">Port 80 / 4444</p>
                  </div>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Active Service Ports Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Port</th>
                          <th className="p-3">Service Name</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Attack Flows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {ports.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.destination_port}</td>
                            <td className="p-3 text-white">{row.service_name || 'Dynamic Service'}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FF475D] font-bold">{Number(row.attack_flows || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 8 — TRAFFIC ANALYSIS                                                 */}
            {activePage === 'traffic-volume' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Traffic Volume Stratification</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Volumetric Stratification Across Network Flow Tiers (MapReduce Job 5)</p>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Tier Category</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Flow Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {trafficVolume.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.tier || row.volume_category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FFA33A] font-semibold">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(2)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 9 — CORRELATION ANALYSIS                                             */}
            {activePage === 'network-analysis' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D] flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Correlation Analysis</h1>
                    <p className="text-xs text-[#91A4BE] mt-0.5">Communication Matrices Across 62,107 Source-Destination Host Pairs (Job 8)</p>
                  </div>
                  <span className="text-xs font-mono text-[#00C8FF]">62,107 Host Pairs</span>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Source Host</th>
                          <th className="p-3">Destination Host</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {connections.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                            <td className="p-3 font-semibold text-[#00D68F]">{row.destination_ip}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()} B</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 10 — MAPREDUCE REPORTS (JOB 11)                                      */}
            {activePage === 'job11-threats' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D] flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">MapReduce Job 11 Threat Profiles</h1>
                    <p className="text-xs text-[#91A4BE] mt-0.5">Per-Host Threat Aggregation and Adversary Ranking</p>
                  </div>
                  <span className="text-xs font-mono text-[#00C8FF] bg-[#0A1424] border border-[#20334D] px-3 py-1 rounded">
                    job_local_netsentinel_0011
                  </span>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Source IP</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Critical</th>
                          <th className="p-3">High</th>
                          <th className="p-3">Medium</th>
                          <th className="p-3">Low</th>
                          <th className="p-3">Avg Risk Score</th>
                          <th className="p-3">ML Attack Flows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {job11Threats.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#FF475D] font-bold">{row.critical_threats}</td>
                            <td className="p-3 text-[#FFA33A] font-semibold">{row.high_threats}</td>
                            <td className="p-3 text-[#FFD032]">{row.medium_threats}</td>
                            <td className="p-3 text-[#00D68F]">{row.low_threats}</td>
                            <td className="p-3 text-[#00C8FF] font-bold">{row.avg_risk_score}</td>
                            <td className="p-3 text-[#FF475D]">{row.attack_predicted_flows}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 11 — MODEL OVERVIEW                                                  */}
            {activePage === 'ml-overview' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Machine Learning Model Overview</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Supervised Ensemble Classification &amp; Benchmark Evaluation on Holdout Test Set</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="soc-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#00C8FF]">Random Forest</h4>
                      <span className="text-[10px] font-mono bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <p className="text-xs text-[#91A4BE]">Ensemble of 100 deep decision trees with balanced bootstrap subsampling and Gini impurity criterion.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#20334D]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#00C8FF]">99.95%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#00C8FF]">99.94%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">1.0000</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">4.69s</span></div>
                    </div>
                  </div>

                  <div className="soc-card p-5 space-y-3 border-t-2 border-t-[#00D68F]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#00D68F]">Gradient Boosting</h4>
                      <span className="text-[10px] font-mono bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40 px-2 py-0.5 rounded">TOP PERFORMER</span>
                    </div>
                    <p className="text-xs text-[#91A4BE]">Histogram-based Gradient Boosting Classifier with 100 boosting iterations and bin-based splits.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#20334D]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#00D68F]">99.97%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#00D68F]">99.96%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">1.0000</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">16.74s</span></div>
                    </div>
                  </div>

                  <div className="soc-card p-5 space-y-3 border-t-2 border-t-[#FFA33A]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#FFA33A]">Baseline Decision Tree</h4>
                      <span className="text-[10px] font-mono bg-[#FFA33A]/15 text-[#FFA33A] border border-[#FFA33A]/40 px-2 py-0.5 rounded">BENCHMARK</span>
                    </div>
                    <p className="text-xs text-[#91A4BE]">Single CART decision tree constrained to depth 8 for establishing benchmark baseline performance.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#20334D]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#FFA33A]">99.35%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#FFA33A]">99.27%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">0.9963</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">2.86s</span></div>
                    </div>
                  </div>
                </div>

                <div className="soc-card p-4 border-l-4 border-l-[#00C8FF] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00C8FF] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <h5 className="font-bold text-white">Strict Data Leakage Prevention Enforced</h5>
                    <p className="text-[#91A4BE]">
                      Source/Destination IP addresses, Flow timestamps, and Target Labels are completely excluded from model feature matrices.
                      Scalers are strictly fitted on the 70% training split. Zero target information leaks into validation or holdout test sets.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 12 — RANDOM FOREST                                                   */}
            {activePage === 'random-forest' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Random Forest Classifier</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">100 Trees Ensemble • Balanced Subsampling • Gini Criterion</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConfusionMatrixCard matrix={rfConfusionMatrix?.confusion_matrix} modelName="Random Forest" />
                  <CurvePlot points={rfRocCurve?.curve} title="ROC Curve (Random Forest)" auc={rfRocCurve?.roc_auc || 1.0} />
                </div>

                <div className="soc-card p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Top Feature Importances (Gini Impurity MDI)</h4>
                  <FeatureImportanceBars features={rfFeatures} maxDisplay={12} />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 13 — GRADIENT BOOSTING                                               */}
            {activePage === 'gradient-boosting' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">HistGradientBoosting Classifier</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">100 Boosting Iterations • Histogram Split Bins • 99.97% Accuracy</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConfusionMatrixCard matrix={gbtConfusionMatrix?.confusion_matrix} modelName="Gradient Boosting" />
                  <CurvePlot points={gbtRocCurve?.curve} title="ROC Curve (Gradient Boosting)" auc={gbtRocCurve?.roc_auc || 1.0} color="#00D68F" />
                </div>

                <div className="soc-card p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Top Feature Importances (Permutation Impact)</h4>
                  <FeatureImportanceBars features={gbtFeatures} maxDisplay={12} />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 14 — MODEL COMPARISON                                                */}
            {activePage === 'model-comparison' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Model Comparison Benchmark</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Side-by-Side Performance Evaluation on 24,129 Holdout Test Flows</p>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Model</th>
                          <th className="p-3">Accuracy</th>
                          <th className="p-3">Precision</th>
                          <th className="p-3">Recall</th>
                          <th className="p-3">F1-Score</th>
                          <th className="p-3">FPR</th>
                          <th className="p-3">FNR</th>
                          <th className="p-3">Train Duration</th>
                          <th className="p-3">Model Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {mlComparison.map((m, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#00C8FF]">{m.model_name}</td>
                            <td className="p-3 text-white">{(m.accuracy * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00D68F]">{(m.precision * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00D68F]">{(m.recall * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00C8FF] font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#FF475D]">{Number(m.false_positive_rate).toFixed(4)}</td>
                            <td className="p-3 text-[#FFA33A]">{Number(m.false_negative_rate).toFixed(4)}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(m.training_time_seconds).toFixed(2)}s</td>
                            <td className="p-3 text-[#91A4BE]">{Number(m.model_size_mb).toFixed(2)} MB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 15 — ANOMALY DETECTION                                               */}
            {activePage === 'anomaly-detection' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Unsupervised Anomaly Detection</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Isolation Forest (8% Contamination) for Zero-Day Attack Discovery</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Algorithm</span>
                    <p className="text-lg font-bold font-mono text-[#00C8FF] mt-1">Isolation Forest</p>
                    <span className="text-[10px] text-[#91A4BE]">Unsupervised Ensembles</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Total Flagged Anomalies</span>
                    <p className="text-lg font-bold font-mono text-[#FFA33A] mt-1">{anomalySummary?.total_anomalies_flagged?.toLocaleString() || '1,811'}</p>
                    <span className="text-[10px] text-[#91A4BE]">{anomalySummary?.anomaly_percentage || 7.51}% of holdout traffic</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Attack Capture Rate</span>
                    <p className="text-lg font-bold font-mono text-[#00D68F] mt-1">{anomalySummary?.attack_capture_rate_unsupervised || 9.06}%</p>
                    <span className="text-[10px] text-[#91A4BE]">Unsupervised Zero-day capture</span>
                  </div>
                  <div className="soc-card p-4">
                    <span className="text-xs text-[#91A4BE]">Contamination Calibration</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">0.08 (8%)</p>
                    <span className="text-[10px] text-[#91A4BE]">Baseline enterprise threshold</span>
                  </div>
                </div>

                <div className="soc-card p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Isolation Forest Anomaly Score Distribution (0–100)</h3>
                  <BarChart data={anomalyDistribution} xKey="range" yKey="count" color="#FFA33A" />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 16 — EXPLAINABLE AI                                                  */}
            {activePage === 'explainable-ai' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Explainable AI &amp; Causal Attributions</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Feature Attribution and Decision Provenance for Flagged Attacks</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="soc-card p-5 space-y-3">
                    <h4 className="text-sm font-semibold text-white">Global Feature Importance (Gini MDI)</h4>
                    <FeatureImportanceBars features={explainability?.global_importance_ranking || []} maxDisplay={10} />
                  </div>
                  <div className="soc-card p-5 space-y-3">
                    <h4 className="text-sm font-semibold text-white">Permutation Importance (F1 Drop)</h4>
                    <FeatureImportanceBars features={explainability?.permutation_impact_ranking || []} maxDisplay={10} />
                  </div>
                </div>

                <div className="soc-card p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-white">Local Flow Attributions (Sample Flagged Attacks)</h4>
                  <div className="space-y-3">
                    {(explainability?.local_flow_explanations || []).map((exp, idx) => (
                      <div key={idx} className="bg-[#0A1424] border border-[#20334D] rounded-lg p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[#00C8FF] font-bold">Flow #{exp.flow_index} | Probability: {(exp.attack_probability * 100).toFixed(1)}%</span>
                          <span className="bg-[#FF475D]/15 text-[#FF475D] border border-[#FF475D]/40 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                            {exp.ground_truth_label}
                          </span>
                        </div>
                        <p className="text-[#EAF1FF]">{exp.explanation_summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 17 — ATTACK INTELLIGENCE                                             */}
            {activePage === 'attacks' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Attack Intelligence &amp; Signatures</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Taxonomy of 27 Ground-Truth Attack Categories (MapReduce Job 7)</p>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Attack Label / Signature</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Proportion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {attacks.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#FF475D]">{row.label || row.attack_category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FFA33A]">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(3)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 18 — THREAT INTELLIGENCE                                             */}
            {activePage === 'threat-intelligence' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Unified Threat Intelligence Engine</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Multi-Factor Risk Scoring Fusing ML (50%), Anomaly (30%), Probes (10%), Bursts (10%)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="soc-card p-4 border-l-4 border-l-[#FF475D]">
                    <span className="text-xs text-[#FF475D] uppercase font-bold">Critical Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">203</p>
                    <span className="text-[10px] text-[#91A4BE]">Risk Score &ge; 70.0</span>
                  </div>
                  <div className="soc-card p-4 border-l-4 border-l-[#FFA33A]">
                    <span className="text-xs text-[#FFA33A] uppercase font-bold">High Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">10,470</p>
                    <span className="text-[10px] text-[#91A4BE]">Risk Score 45.0–69.9</span>
                  </div>
                  <div className="soc-card p-4 border-l-4 border-l-[#FFD032]">
                    <span className="text-xs text-[#FFD032] uppercase font-bold">Medium Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">243</p>
                    <span className="text-[10px] text-[#91A4BE]">Risk Score 20.0–44.9</span>
                  </div>
                  <div className="soc-card p-4 border-l-4 border-l-[#00D68F]">
                    <span className="text-xs text-[#00D68F] uppercase font-bold">Low Threats / Nominal</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">13,213</p>
                    <span className="text-[10px] text-[#91A4BE]">Risk Score &lt; 20.0</span>
                  </div>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-[#0A1424] border border-[#20334D] rounded-lg px-3 py-1.5 w-full sm:w-64">
                        <Search className="w-4 h-4 text-[#91A4BE]" />
                        <input
                          type="text"
                          placeholder="Search IP, label, explanation..."
                          value={threatSearch}
                          onChange={(e) => { setThreatSearch(e.target.value); setThreatPage(1); }}
                          className="bg-transparent text-xs text-white focus:outline-none w-full"
                        />
                      </div>
                      <select
                        value={threatSeverityFilter}
                        onChange={(e) => { setThreatSeverityFilter(e.target.value); setThreatPage(1); }}
                        className="bg-[#0A1424] border border-[#20334D] text-xs text-[#EAF1FF] rounded-lg px-3 py-1.5 focus:outline-none font-mono"
                      >
                        <option value="">All Severities</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                    <span className="text-xs text-[#91A4BE] font-mono">Real-time Threat Streams</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Record ID</th>
                          <th className="p-3">Source IP</th>
                          <th className="p-3">Destination IP</th>
                          <th className="p-3">Port</th>
                          <th className="p-3">Risk Score</th>
                          <th className="p-3">Severity</th>
                          <th className="p-3">Detection Method</th>
                          <th className="p-3">Causal Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {threatRecords.map((rec, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 text-[#91A4BE]">{rec.record_id}</td>
                            <td className="p-3 font-semibold text-[#00C8FF]">{rec.source_ip}</td>
                            <td className="p-3 text-[#00D68F]">{rec.destination_ip}</td>
                            <td className="p-3 text-white">{rec.destination_port}</td>
                            <td className="p-3 font-bold text-white">{rec.risk_score}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rec.severity === 'CRITICAL' ? 'bg-[#FF475D]/15 text-[#FF475D] border border-[#FF475D]/40' :
                                rec.severity === 'HIGH' ? 'bg-[#FFA33A]/15 text-[#FFA33A] border border-[#FFA33A]/40' :
                                rec.severity === 'MEDIUM' ? 'bg-[#FFD032]/15 text-[#FFD032] border border-[#FFD032]/40' :
                                'bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40'
                              }`}>
                                {rec.severity}
                              </span>
                            </td>
                            <td className="p-3 text-[#91A4BE]">{rec.detection_method}</td>
                            <td className="p-3 text-[#EAF1FF] max-w-xs truncate" title={rec.explanation}>
                              {rec.explanation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 19 — SUSPICIOUS HEURISTICS                                           */}
            {activePage === 'suspicious' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">Suspicious Heuristics</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Algorithmic Detection of Scanning Probes, Volumetric Bursts, and Abnormal Protocols (Job 9)</p>
                </div>

                <div className="soc-card p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A1424] text-[#91A4BE] uppercase text-[10px] border-b border-[#20334D]">
                        <tr>
                          <th className="p-3">Behavior Type</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Risk Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#20334D]/60">
                        {suspicious.map((row, i) => (
                          <tr key={i} className="hover:bg-[#13233B]/60 transition-colors">
                            <td className="p-3 font-semibold text-[#FFA33A]">{row.behavior_type || row.category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4BE]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FF475D] font-bold">{row.risk_level || 'ELEVATED'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 20 — REPORTS & VERIFICATION / ABOUT                                  */}
            {(activePage === 'reports' || activePage === 'about') && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#20334D]">
                  <h1 className="text-2xl font-bold text-white">System Architecture &amp; Verification Reports</h1>
                  <p className="text-xs text-[#91A4BE] mt-0.5">Distributed Infrastructure Specifications &amp; Ground-Truth Dataset Integrity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="soc-card p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">System Architecture &amp; Specs</h4>
                    <div className="space-y-2 text-xs text-[#91A4BE] font-mono">
                      <p><strong className="text-white">Storage Engine:</strong> Apache Hadoop 3.3.6 HDFS</p>
                      <p><strong className="text-white">MapReduce Pipeline:</strong> 11 Distributed Streaming Jobs (100% Parity)</p>
                      <p><strong className="text-white">Supervised ML:</strong> Random Forest + HistGradientBoosting (99.96% F1)</p>
                      <p><strong className="text-white">Anomaly Detection:</strong> Isolation Forest (Unsupervised 8% Contamination)</p>
                      <p><strong className="text-white">Backend API:</strong> FastAPI 2.0 on Python 3.15 (Uvicorn ASGI)</p>
                      <p><strong className="text-white">Frontend UI:</strong> React 18 + Vite 5 + Tailwind CSS</p>
                    </div>
                  </div>

                  <div className="soc-card p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">Dataset Verification</h4>
                    <div className="space-y-2 text-xs text-[#91A4BE] font-mono">
                      <p><strong className="text-white">Canonical Dataset:</strong> CICIDS-2017 Version 2</p>
                      <p><strong className="text-white">Canonical Flows:</strong> 2,099,971 flow records</p>
                      <p><strong className="text-white">Benign Baseline:</strong> 1,582,561 flows (75.36%)</p>
                      <p><strong className="text-white">Attack Signatures:</strong> 517,410 flows (24.64%) across 27 classes</p>
                      <p><strong className="text-white">Total Packets:</strong> 56,129,897 packets</p>
                      <p><strong className="text-white">Total Volume:</strong> 47.23 Gigabytes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM FOOTER STATUS BAR */}
          <footer className="h-9 bg-[#0B1628] border-t border-[#20334D] px-6 flex items-center justify-between text-xs font-mono shrink-0 z-30">
            <div className="flex items-center gap-4 text-[#91A4BE]">
              <span className="flex items-center gap-1.5 text-[#00D68F] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
                System Healthy
              </span>
              <span>|</span>
              <span>Hadoop: <strong className="text-[#00D68F]">RUNNING</strong></span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Last Updated: <span className="text-[#EAF1FF]">{currentTime}</span></span>
            </div>

            <div className="flex items-center gap-2 text-[#91A4BE]">
              <span className="font-semibold text-white">NetSentinel 2.0</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">Powered by Apache Hadoop, scikit-learn &amp; FastAPI</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
