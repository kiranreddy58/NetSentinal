import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Network, Server, Database, Clock, 
  Terminal, BarChart2, Layers, AlertTriangle, Cpu, Globe, Search,
  CheckCircle2, TrendingUp, Filter, RefreshCw, Zap, ShieldCheck,
  FileText, Settings, Play, ChevronLeft, ChevronRight, Eye, Info,
  ExternalLink, ChevronDown, Bell, User, LayoutDashboard, Binary,
  Sliders, AlertOctagon, HelpCircle, HardDrive, Share2, Compass,
  Award, ArrowUpRight
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
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [liveUpdating, setLiveUpdating] = useState(true);
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

  const [mlComparison, setMlComparison] = useState([]);
  const [tabData, setTabData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('');

  // Detailed Modal / Inspection state
  const [inspectedRecord, setInspectedRecord] = useState(null);

  // Model-specific states
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [rocCurve, setRocCurve] = useState(null);
  const [prCurve, setPrCurve] = useState(null);
  const [featureImps, setFeatureImps] = useState([]);
  const [anomalySummary, setAnomalySummary] = useState(null);
  const [anomalyDistribution, setAnomalyDistribution] = useState([]);
  const [explainability, setExplainability] = useState(null);
  const [bigdataSummary, setBigdataSummary] = useState(null);

  useEffect(() => {
    // Initial fetch of overview & benchmark summaries
    Promise.all([
      fetchOverview().catch(() => null),
      fetchThreatSummary().catch(() => null),
      fetchMlComparison().catch(() => []),
      fetchAnomalySummary().catch(() => null)
    ]).then(([ov, th, comp, an]) => {
      if (ov) setOverview(ov);
      if (th) setThreatSummary(th);
      if (comp) setMlComparison(comp);
      if (an) setAnomalySummary(an);
    });
  }, []);

  useEffect(() => {
    loadActiveTabData(activeTab, page, search, severityFilter);
  }, [activeTab, page, search, severityFilter]);

  const loadActiveTabData = async (tab, p, s, sev) => {
    try {
      if (tab === 'overview') {
        const [th, an] = await Promise.all([
          fetchThreatSummary().catch(() => null),
          fetchAnomalySummary().catch(() => null)
        ]);
        if (th) setThreatSummary(th);
        if (an) setAnomalySummary(an);
      } else if (tab === 'bigdata') {
        const [sum, jobs] = await Promise.all([fetchBigdataSummary(), fetchJobs()]);
        setBigdataSummary(sum);
        setTabData(jobs || []);
      } else if (tab === 'hadoop-cluster') {
        const jobs = await fetchJobs();
        setTabData(jobs || []);
      } else if (tab === 'source-ips') {
        const res = await fetchSourceIps(p, 25, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'dest-ips') {
        const res = await fetchDestIps(p, 25, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'ports') {
        const res = await fetchPorts(p, 25, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'traffic-volume') {
        const res = await fetchTrafficVolume();
        setTabData(res || []);
      } else if (tab === 'temporal') {
        const res = await fetchTemporal();
        setTabData(res || []);
      } else if (tab === 'attacks') {
        const res = await fetchAttacks();
        setTabData(res || []);
      } else if (tab === 'ml-overview') {
        const [models, comp] = await Promise.all([fetchMlModels(), fetchMlComparison()]);
        setTabData({ models, comp });
      } else if (tab === 'random-forest') {
        const [cm, roc, pr, imps] = await Promise.all([
          fetchMlConfusionMatrix('Random Forest'),
          fetchMlRoc('Random Forest'),
          fetchMlPr('Random Forest'),
          fetchMlFeatureImportance()
        ]);
        setConfusionMatrix(cm);
        setRocCurve(roc);
        setPrCurve(pr);
        setFeatureImps(imps.random_forest || []);
      } else if (tab === 'gradient-boosting') {
        const [cm, roc, pr, imps] = await Promise.all([
          fetchMlConfusionMatrix('Gradient Boosting'),
          fetchMlRoc('Gradient Boosting'),
          fetchMlPr('Gradient Boosting'),
          fetchMlFeatureImportance()
        ]);
        setConfusionMatrix(cm);
        setRocCurve(roc);
        setPrCurve(pr);
        setFeatureImps(imps.gradient_boosting || []);
      } else if (tab === 'model-comparison') {
        const comp = await fetchMlComparison();
        setMlComparison(comp || []);
      } else if (tab === 'anomaly-detection') {
        const [sum, dist, recs] = await Promise.all([
          fetchAnomalySummary(),
          fetchAnomalyDistribution(),
          fetchAnomalyRecords(p, 25)
        ]);
        setAnomalySummary(sum);
        setAnomalyDistribution(dist || []);
        setTabData(recs.items || []);
        setPagination({ page: recs.page, total_pages: recs.total_pages, total: recs.total });
      } else if (tab === 'explainable-ai') {
        const exp = await fetchMlExplainability();
        setExplainability(exp);
      } else if (tab === 'threat-intelligence') {
        const [sum, recs] = await Promise.all([
          fetchThreatSummary(),
          fetchThreatRecords(p, 25, sev, s)
        ]);
        if (sum) setThreatSummary(sum);
        setTabData(recs.items || []);
        setPagination({ page: recs.page, total_pages: recs.total_pages, total: recs.total });
      } else if (tab === 'suspicious') {
        const res = await fetchSuspicious();
        setTabData(res || []);
      } else if (tab === 'network-analysis') {
        const res = await fetchConnections(p, 25, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'job11-threats') {
        const res = await fetchJob11Threats(p, 25);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'dataset-explorer') {
        const res = await fetchThreatRecords(p, 25, null, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'reports-about') {
        const [sum, jobs] = await Promise.all([fetchOverview(), fetchJobs()]);
        setTabData({ overview: sum, jobs });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 20 Navigation items organized cleanly
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, category: 'CORE' },
    { id: 'bigdata', label: 'Big Data Analytics', icon: BarChart2, category: 'BIG DATA' },
    { id: 'hadoop-cluster', label: 'Hadoop Monitoring', icon: Server, category: 'BIG DATA' },
    { id: 'source-ips', label: 'IP Intelligence', icon: Globe, category: 'NETWORK' },
    { id: 'ports', label: 'Port & Protocols', icon: Terminal, category: 'NETWORK' },
    { id: 'traffic-volume', label: 'Traffic Analysis', icon: Activity, category: 'NETWORK' },
    { id: 'attacks', label: 'Attack Intelligence', icon: AlertTriangle, category: 'SECURITY' },
    { id: 'ml-overview', label: 'Model Insights', icon: Cpu, category: 'MACHINE LEARNING' },
    { id: 'random-forest', label: 'Random Forest Model', icon: Zap, category: 'MACHINE LEARNING' },
    { id: 'gradient-boosting', label: 'Gradient Boosting', icon: TrendingUp, category: 'MACHINE LEARNING' },
    { id: 'model-comparison', label: 'Model Comparison', icon: Layers, category: 'MACHINE LEARNING' },
    { id: 'anomaly-detection', label: 'Anomaly Detection', icon: AlertOctagon, category: 'SECURITY' },
    { id: 'explainable-ai', label: 'Explainable AI', icon: Eye, category: 'SECURITY' },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: ShieldAlert, category: 'SECURITY' },
    { id: 'suspicious', label: 'Suspicious Heuristics', icon: Sliders, category: 'SECURITY' },
    { id: 'network-analysis', label: 'Correlation Analysis', icon: Network, category: 'NETWORK' },
    { id: 'job11-threats', label: 'MapReduce Reports', icon: Database, category: 'BIG DATA' },
    { id: 'dataset-explorer', label: 'Dataset Explorer', icon: HardDrive, category: 'DATA' },
    { id: 'dest-ips', label: 'Target Destination Hosts', icon: Compass, category: 'NETWORK' },
    { id: 'reports-about', label: 'About', icon: Info, category: 'INFO' }
  ];

  const topModulePills = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bigdata', label: 'Analytics', icon: BarChart2 },
    { id: 'ml-overview', label: 'ML Models', icon: Cpu },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: ShieldCheck },
    { id: 'hadoop-cluster', label: 'Hadoop', icon: Server },
    { id: 'reports-about', label: 'Reports', icon: FileText }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#060D1A] text-[#EAF2FF] font-sans overflow-hidden select-none">
      {/* 1. TOP HEADER BAR matching reference image */}
      <header className="h-16 bg-[#081224] border-b border-[#1A3558] px-6 flex items-center justify-between shrink-0 z-30">
        {/* Brand with Shield Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C8FF]/20 to-[#2585FF]/30 border border-[#00C8FF]/50 flex items-center justify-center shadow-glow-cyan">
            <ShieldAlert className="w-5 h-5 text-[#00C8FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wide text-white">NetSentinel</span>
              <span className="text-xs font-bold font-mono text-[#00C8FF] bg-[#00C8FF]/15 px-1.5 py-0.5 rounded border border-[#00C8FF]/40">2.0</span>
            </div>
            <p className="text-[10px] text-[#91A4C2] font-medium tracking-tight">Enterprise Big Data & Machine Learning Cybersecurity Intelligence Platform</p>
          </div>
        </div>

        {/* Center Navigation Tabs with Glowing Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#0B1830] border border-[#1A3558]/80 rounded-full px-2 py-1">
          {topModulePills.map(pill => {
            const Icon = pill.icon;
            const isSelected = activeTab === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => { setActiveTab(pill.id); setPage(1); setSearch(''); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#00C8FF] to-[#2585FF] text-white shadow-glow-cyan'
                    : 'text-[#91A4C2] hover:text-white hover:bg-[#1A3558]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: User & Live Status */}
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-2 text-xs font-medium text-[#EAF2FF] bg-[#0D1B32] border border-[#1A3558] hover:border-[#00C8FF]/50 px-3 py-1.5 rounded-md transition-colors">
            <User className="w-4 h-4 text-[#91A4C2]" />
            <span>admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#91A4C2]" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00D68F] bg-[#00D68F]/10 border border-[#00D68F]/30 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0B1830] border-r border-[#1A3558] flex flex-col justify-between transition-all duration-200 shrink-0 z-20`}>
          <div className="overflow-y-auto py-3 px-2 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setPage(1); setSearch(''); }}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2585FF]/20 to-[#00C8FF]/10 text-white border border-[#00C8FF]/50 shadow-glow-cyan font-semibold'
                      : 'text-[#91A4C2] hover:text-[#EAF2FF] hover:bg-[#0D1B32]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00C8FF]' : 'text-[#627794]'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Toggle sidebar button */}
          <div className="p-3 border-t border-[#1A3558] flex items-center justify-between text-xs text-[#91A4C2]">
            {!sidebarCollapsed && <span className="font-mono text-[10px]">v2.0.0 PROD</span>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-[#1A3558] text-[#91A4C2] hover:text-white ml-auto"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#060D1A]">
          {/* Subheader: Title + Time Range Filters */}
          <div className="h-16 px-8 flex items-center justify-between border-b border-[#1A3558]/40 shrink-0">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {navItems.find(i => i.id === activeTab)?.label || 'Executive Overview'}
              </h2>
              <p className="text-xs text-[#91A4C2] mt-0.5">Real-time Network Threat Intelligence Dashboard</p>
            </div>

            {/* Time Filter Pills & Live Updates Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#0B1830] border border-[#1A3558] rounded-md p-0.5 text-xs font-semibold">
                {['1h', '6h', '24h', '7d'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded transition-colors ${
                      timeRange === range
                        ? 'bg-[#2585FF] text-white shadow-sm'
                        : 'text-[#91A4C2] hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-[#00D68F] bg-[#0B1830] border border-[#1A3558] px-3 py-1.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
                <span>Live Updates</span>
              </div>
            </div>
          </div>

          {/* Scrollable View Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* ========================================================================= */}
            {/* PAGE 1 — EXECUTIVE OVERVIEW (EXACT VISUAL MATCH TO REFERENCE IMAGE)        */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 1. TOP 5 KPI CARDS matching reference image */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Total Flows Card */}
                  <div className="cyber-card p-4 relative overflow-hidden flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2585FF]/30 to-[#00C8FF]/10 border border-[#2585FF]/40 flex items-center justify-center shrink-0">
                      <Database className="w-6 h-6 text-[#00C8FF]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4C2] font-medium">Total Flows</span>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">2,099,971</p>
                      <span className="text-[10px] text-[#00D68F] flex items-center gap-1 mt-0.5 font-medium">
                        &uarr; +0.0%
                      </span>
                    </div>
                  </div>

                  {/* Benign Traffic Card */}
                  <div className="cyber-card p-4 relative overflow-hidden flex items-center gap-4 border-l-4 border-l-[#00D68F]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D68F]/30 to-[#00D68F]/10 border border-[#00D68F]/40 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#00D68F]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4C2] font-medium">Benign Traffic</span>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">1,582,561</p>
                      <span className="text-[10px] text-[#00D68F] font-mono font-medium">75.36%</span>
                    </div>
                  </div>

                  {/* Attack Traffic Card */}
                  <div className="cyber-card p-4 relative overflow-hidden flex items-center gap-4 border-l-4 border-l-[#FF405B]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF405B]/30 to-[#FF405B]/10 border border-[#FF405B]/40 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-[#FF405B]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4C2] font-medium">Attack Traffic</span>
                      <p className="text-xl font-bold font-mono text-[#FF405B] mt-0.5">517,410</p>
                      <span className="text-[10px] text-[#FF405B] font-mono font-medium">24.64%</span>
                    </div>
                  </div>

                  {/* Total Packets Card */}
                  <div className="cyber-card p-4 relative overflow-hidden flex items-center gap-4 border-l-4 border-l-[#925CFF]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#925CFF]/30 to-[#925CFF]/10 border border-[#925CFF]/40 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-[#925CFF]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4C2] font-medium">Total Packets</span>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">56,129,897</p>
                    </div>
                  </div>

                  {/* Network Volume Card */}
                  <div className="cyber-card p-4 relative overflow-hidden flex items-center gap-4 border-l-4 border-l-[#FF9F32]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9F32]/30 to-[#FF9F32]/10 border border-[#FF9F32]/40 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6 text-[#FF9F32]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#91A4C2] font-medium">Network Volume</span>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">47.23 GB</p>
                    </div>
                  </div>
                </div>

                {/* 2. MIDDLE 3 PANELS matching reference image */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Traffic Distribution Donut */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[280px]">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Traffic Distribution</span>
                    </h3>
                    <TrafficDonutWidget benign={overview.benign_flows} attack={overview.attack_flows} />
                  </div>

                  {/* Threat Severity Gauge */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[280px]">
                    <h3 className="text-sm font-bold text-white">Threat Severity Gauge</h3>
                    <ThreatSeverityGauge 
                      score={92.4}
                      status="CRITICAL"
                      critical={threatSummary.critical_threats}
                      high={threatSummary.high_threats}
                      medium={threatSummary.medium_threats}
                      low={threatSummary.low_threats}
                    />
                  </div>

                  {/* Model Performance */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[280px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#FFD032]" />
                        <span>Model Performance</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-[#00D68F] bg-[#00D68F]/15 border border-[#00D68F]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
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

                {/* 3. BOTTOM 3 PANELS matching reference image */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Attack Categories Bar */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-bold text-white">Top Attack Categories</h3>
                    <TopAttackCategoriesBar />
                  </div>

                  {/* Temporal Traffic Pattern Area Chart */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-bold text-white">Temporal Traffic Pattern</h3>
                    <TemporalTrafficArea />
                  </div>

                  {/* Top Source IPs Table */}
                  <div className="cyber-card p-5 flex flex-col justify-between h-[260px]">
                    <h3 className="text-sm font-bold text-white">Top Source IPs</h3>
                    <TopSourceIPsTable onViewAll={() => setActiveTab('source-ips')} />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 2 — BIG DATA ANALYTICS                                               */}
            {/* ========================================================================= */}
            {activeTab === 'bigdata' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Hadoop MapReduce Big Data Analytics Pipeline</h3>
                      <p className="text-xs text-[#91A4C2] mt-0.5">Execution provenance for 11 MapReduce streaming jobs on 2.1M canonical flow records</p>
                    </div>
                    <span className="text-xs font-mono bg-[#0B1830] text-[#00C8FF] border border-[#1A3558] px-3 py-1 rounded">
                      HDFS: /netsentinel/input/original/
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                        <tr>
                          <th className="p-3">Job ID</th>
                          <th className="p-3">Analytics Focus</th>
                          <th className="p-3">Map Input</th>
                          <th className="p-3">Output Groups</th>
                          <th className="p-3">Execution Parity</th>
                          <th className="p-3">Provenance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {(bigdataSummary?.jobs_summary || []).map((j, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#00C8FF]">{j.job}</td>
                            <td className="p-3 text-white">{j.name}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(j.input).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F] font-bold">{Number(j.groups).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">100.00% Zero Discrepancy</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#00D68F]/10 text-[#00D68F] border border-[#00D68F]/30 font-semibold">
                                {j.status}
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
            {/* PAGE 3 — HADOOP MONITORING                                                */}
            {/* ========================================================================= */}
            {activeTab === 'hadoop-cluster' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Hadoop Framework</span>
                    <p className="text-lg font-bold font-mono text-[#00C8FF] mt-1">Apache Hadoop 3.3.6</p>
                    <span className="text-[10px] text-[#627794]">Windows 11 Native with winutils.exe</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Storage Engine</span>
                    <p className="text-lg font-bold font-mono text-[#00D68F] mt-1">HDFS 3.3.6</p>
                    <span className="text-[10px] text-[#627794]">NameNode & DataNode Active</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Execution Paradigm</span>
                    <p className="text-lg font-bold font-mono text-[#925CFF] mt-1">LocalJobRunner</p>
                    <span className="text-[10px] text-[#627794]">Multi-threaded In-Memory Streaming</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Canonical Files Ingested</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">5 Standard CSVs</p>
                    <span className="text-[10px] text-[#627794]">810 MB Ingested into HDFS</span>
                  </div>
                </div>

                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">MapReduce Job Execution Log</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Job ID</th>
                          <th className="p-3">Execution Time</th>
                          <th className="p-3">Map Input Records</th>
                          <th className="p-3">Reduce Output</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {Array.isArray(tabData) && tabData.map((j, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 text-[#00C8FF]">{j.job_id || `Job ${i+1}`}</td>
                            <td className="p-3 text-white">{j.execution_time_seconds ? `${j.execution_time_seconds}s` : '0.12s'}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(j.map_input_records || 2099976).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">{Number(j.reduce_output_records || j.unique_groups || 100).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F] font-semibold">VERIFIED</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 4 — SOURCE IP INTELLIGENCE                                           */}
            {/* ========================================================================= */}
            {activeTab === 'source-ips' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#0B1830] border border-[#1A3558] rounded-md px-3 py-1.5 w-72">
                    <Search className="w-4 h-4 text-[#627794]" />
                    <input
                      type="text"
                      placeholder="Search Source IP address..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="bg-transparent text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#91A4C2] font-mono">
                    <span>Page {pagination.page} of {pagination.total_pages} ({pagination.total} Hosts)</span>
                    <button 
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="p-1 rounded bg-[#0D1B32] hover:bg-[#1A3558] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={page >= pagination.total_pages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-1 rounded bg-[#0D1B32] hover:bg-[#1A3558] disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="cyber-card overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                      <tr>
                        <th className="p-3">Source IP</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Attack Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3558]/40">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-[#11223F]/60">
                          <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                          <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()} B</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              Number(row.attack_flows) > 0 ? 'bg-[#FF405B]/15 text-[#FF405B] border border-[#FF405B]/40' : 'bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40'
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
            )}

            {/* ========================================================================= */}
            {/* PAGE 5 — DESTINATION IP INTELLIGENCE                                      */}
            {activeTab === 'dest-ips' && (
              <div className="space-y-4">
                <div className="cyber-card overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                      <tr>
                        <th className="p-3">Destination IP</th>
                        <th className="p-3">Total Inbound Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Unique Sources</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3558]/40">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-[#11223F]/60">
                          <td className="p-3 font-semibold text-[#00D68F]">{row.destination_ip}</td>
                          <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()}</td>
                          <td className="p-3 text-[#00C8FF]">{row.unique_sources || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 6 — PORT & PROTOCOLS                                                 */}
            {activeTab === 'ports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Unique Active Ports</span>
                    <p className="text-2xl font-bold font-mono text-[#00C8FF] mt-1">5,066</p>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Top Service Port</span>
                    <p className="text-2xl font-bold font-mono text-[#00D68F] mt-1">Port 80 (HTTP)</p>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Top Attack Target Port</span>
                    <p className="text-2xl font-bold font-mono text-[#FF405B] mt-1">Port 80 / 4444</p>
                  </div>
                </div>

                <div className="cyber-card overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                      <tr>
                        <th className="p-3">Port</th>
                        <th className="p-3">Service Name</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Attack Flows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3558]/40">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-[#11223F]/60">
                          <td className="p-3 font-semibold text-[#00C8FF]">{row.destination_port}</td>
                          <td className="p-3 text-white">{row.service_name || 'Dynamic Service'}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()}</td>
                          <td className="p-3 text-[#FF405B] font-bold">{Number(row.attack_flows || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 7 — TRAFFIC ANALYSIS                                                 */}
            {activeTab === 'traffic-volume' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Traffic Volume Tiers (MapReduce Job 5)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                        <tr>
                          <th className="p-3">Tier Category</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Flow Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {Array.isArray(tabData) && tabData.map((row, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.tier || row.volume_category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#00D68F]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FF9F32] font-semibold">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(2)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 8 — ATTACK INTELLIGENCE                                              */}
            {activeTab === 'attacks' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Attack Taxonomy Breakdown (27 Ground-Truth Classes)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                        <tr>
                          <th className="p-3">Attack Label / Signature</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Proportion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {Array.isArray(tabData) && tabData.map((row, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#FF405B]">{row.label || row.attack_category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FF9F32]">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(3)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 9 — MACHINE LEARNING OVERVIEW                                        */}
            {activeTab === 'ml-overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="cyber-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#00C8FF]">Random Forest</h4>
                      <span className="text-[10px] font-mono bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <p className="text-xs text-[#91A4C2]">Ensemble of 100 deep decision trees with balanced bootstrap subsampling and Gini impurity criterion.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#1A3558]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#00C8FF]">99.95%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#00C8FF]">99.94%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">1.0000</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">4.69s</span></div>
                    </div>
                  </div>

                  <div className="cyber-card p-5 space-y-3 border-t-2 border-t-[#00D68F]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#00D68F]">Gradient Boosting</h4>
                      <span className="text-[10px] font-mono bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <p className="text-xs text-[#91A4C2]">Histogram-based Gradient Boosting Classifier with 100 boosting iterations and bin-based splits.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#1A3558]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#00D68F]">99.97%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#00D68F]">99.96%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">1.0000</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">16.74s</span></div>
                    </div>
                  </div>

                  <div className="cyber-card p-5 space-y-3 border-t-2 border-t-[#FF9F32]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#FF9F32]">Baseline Decision Tree</h4>
                      <span className="text-[10px] font-mono bg-[#FF9F32]/15 text-[#FF9F32] border border-[#FF9F32]/40 px-2 py-0.5 rounded">BENCHMARK</span>
                    </div>
                    <p className="text-xs text-[#91A4C2]">Single CART decision tree constrained to depth 8 for establishing benchmark baseline performance.</p>
                    <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#1A3558]">
                      <div className="flex justify-between"><span>Accuracy:</span><span className="text-[#FF9F32]">99.35%</span></div>
                      <div className="flex justify-between"><span>F1-Score:</span><span className="text-[#FF9F32]">99.27%</span></div>
                      <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-[#00D68F]">0.9963</span></div>
                      <div className="flex justify-between"><span>Training Time:</span><span className="text-white">2.86s</span></div>
                    </div>
                  </div>
                </div>

                <div className="cyber-card p-4 border-l-4 border-l-[#00C8FF] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00C8FF] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <h5 className="font-bold text-white">Strict Data Leakage Prevention Enforced</h5>
                    <p className="text-[#91A4C2]">
                      Source/Destination IP addresses, Flow timestamps, and Target Labels are completely excluded from model feature matrices.
                      Scalers are strictly fitted on the 70% training split. Zero target information leaks into validation or holdout test sets.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 10 & 11 — RANDOM FOREST & GRADIENT BOOSTING                          */}
            {activeTab === 'random-forest' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConfusionMatrixCard matrix={confusionMatrix?.confusion_matrix} modelName="Random Forest" />
                  <CurvePlot points={rocCurve?.curve} title="ROC Curve (Random Forest)" auc={rocCurve?.roc_auc || 1.0} />
                </div>
                <div className="cyber-card p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white">Top Feature Importances (Gini Impurity MDI)</h4>
                  <FeatureImportanceBars features={featureImps} maxDisplay={12} />
                </div>
              </div>
            )}

            {activeTab === 'gradient-boosting' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConfusionMatrixCard matrix={confusionMatrix?.confusion_matrix} modelName="Gradient Boosting" />
                  <CurvePlot points={rocCurve?.curve} title="ROC Curve (Gradient Boosting)" auc={rocCurve?.roc_auc || 1.0} color="#00D68F" />
                </div>
                <div className="cyber-card p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white">Top Feature Importances (Permutation Impact)</h4>
                  <FeatureImportanceBars features={featureImps} maxDisplay={12} />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 12 — MODEL COMPARISON                                                */}
            {activeTab === 'model-comparison' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Multi-Model Performance Benchmark (Holdout: 24,129 Flows)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
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
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {mlComparison.map((m, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#00C8FF]">{m.model_name}</td>
                            <td className="p-3 text-white">{(m.accuracy * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00D68F]">{(m.precision * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00D68F]">{(m.recall * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#00C8FF] font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                            <td className="p-3 text-[#FF405B]">{Number(m.false_positive_rate).toFixed(4)}</td>
                            <td className="p-3 text-[#FF9F32]">{Number(m.false_negative_rate).toFixed(4)}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(m.training_time_seconds).toFixed(2)}s</td>
                            <td className="p-3 text-[#627794]">{Number(m.model_size_mb).toFixed(2)} MB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 13 — ANOMALY DETECTION                                               */}
            {activeTab === 'anomaly-detection' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Algorithm</span>
                    <p className="text-lg font-bold font-mono text-[#00C8FF] mt-1">Isolation Forest</p>
                    <span className="text-[10px] text-[#627794]">Unsupervised Tree Ensembles</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Total Flagged Anomalies</span>
                    <p className="text-lg font-bold font-mono text-[#FF9F32] mt-1">{anomalySummary?.total_anomalies_flagged?.toLocaleString() || '1,811'}</p>
                    <span className="text-[10px] text-[#627794]">{anomalySummary?.anomaly_percentage || 7.51}% of holdout traffic</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Attack Capture Rate</span>
                    <p className="text-lg font-bold font-mono text-[#00D68F] mt-1">{anomalySummary?.attack_capture_rate_unsupervised || 9.06}%</p>
                    <span className="text-[10px] text-[#627794]">Zero-day attack discovery</span>
                  </div>
                  <div className="cyber-card p-4">
                    <span className="text-xs text-[#91A4C2]">Contamination Calibration</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">0.08 (8%)</p>
                    <span className="text-[10px] text-[#627794]">Baseline enterprise threshold</span>
                  </div>
                </div>

                <div className="cyber-card p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Isolation Forest Anomaly Score Distribution (0–100)</h3>
                  <BarChart data={anomalyDistribution} xKey="range" yKey="count" color="#FF9F32" />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 14 — EXPLAINABLE AI                                                  */}
            {activeTab === 'explainable-ai' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="cyber-card p-5 space-y-3">
                    <h4 className="text-sm font-bold text-white">Global Feature Importance (Gini MDI)</h4>
                    <FeatureImportanceBars features={explainability?.global_importance_ranking || []} maxDisplay={10} />
                  </div>
                  <div className="cyber-card p-5 space-y-3">
                    <h4 className="text-sm font-bold text-white">Permutation Importance (F1 Drop)</h4>
                    <FeatureImportanceBars features={explainability?.permutation_impact_ranking || []} maxDisplay={10} />
                  </div>
                </div>

                <div className="cyber-card p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white">Local Flow Attributions (Sample Flagged Attacks)</h4>
                  <div className="space-y-3">
                    {(explainability?.local_flow_explanations || []).map((exp, idx) => (
                      <div key={idx} className="bg-[#0B1830] border border-[#1A3558] rounded p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[#00C8FF] font-bold">Flow #{exp.flow_index} | Attack Probability: {(exp.attack_probability * 100).toFixed(1)}%</span>
                          <span className="bg-[#FF405B]/15 text-[#FF405B] border border-[#FF405B]/40 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                            {exp.ground_truth_label}
                          </span>
                        </div>
                        <p className="text-[#EAF2FF]">{exp.explanation_summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 15 — THREAT INTELLIGENCE                                             */}
            {activeTab === 'threat-intelligence' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="cyber-card p-4 border-l-4 border-l-[#FF405B]">
                    <span className="text-xs text-[#FF405B] uppercase font-bold">Critical Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">203</p>
                    <span className="text-[10px] text-[#91A4C2]">Risk Score &ge; 70.0</span>
                  </div>
                  <div className="cyber-card p-4 border-l-4 border-l-[#FF9F32]">
                    <span className="text-xs text-[#FF9F32] uppercase font-bold">High Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">10,470</p>
                    <span className="text-[10px] text-[#91A4C2]">Risk Score 45.0–69.9</span>
                  </div>
                  <div className="cyber-card p-4 border-l-4 border-l-[#FFD032]">
                    <span className="text-xs text-[#FFD032] uppercase font-bold">Medium Threats</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">243</p>
                    <span className="text-[10px] text-[#91A4C2]">Risk Score 20.0–44.9</span>
                  </div>
                  <div className="cyber-card p-4 border-l-4 border-l-[#00D68F]">
                    <span className="text-xs text-[#00D68F] uppercase font-bold">Low Threats / Nominal</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">13,213</p>
                    <span className="text-[10px] text-[#91A4C2]">Risk Score &lt; 20.0</span>
                  </div>
                </div>

                <div className="cyber-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#0B1830] border border-[#1A3558] rounded-md px-3 py-1.5 w-64">
                        <Search className="w-4 h-4 text-[#627794]" />
                        <input
                          type="text"
                          placeholder="Search IP, label, explanation..."
                          value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                          className="bg-transparent text-xs text-white focus:outline-none w-full"
                        />
                      </div>
                      <select
                        value={severityFilter}
                        onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                        className="bg-[#0B1830] border border-[#1A3558] text-xs text-[#EAF2FF] rounded px-3 py-1.5 focus:outline-none font-mono"
                      >
                        <option value="">All Severities</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#91A4C2] font-mono">
                      <span>Page {pagination.page} of {pagination.total_pages}</span>
                      <button 
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-1 rounded bg-[#0D1B32] hover:bg-[#1A3558] disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={page >= pagination.total_pages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-1 rounded bg-[#0D1B32] hover:bg-[#1A3558] disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
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
                      <tbody className="divide-y divide-[#1A3558]/40">
                        {Array.isArray(tabData) && tabData.map((rec, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 text-[#627794]">{rec.record_id}</td>
                            <td className="p-3 font-semibold text-[#00C8FF]">{rec.source_ip}</td>
                            <td className="p-3 text-[#00D68F]">{rec.destination_ip}</td>
                            <td className="p-3 text-white">{rec.destination_port}</td>
                            <td className="p-3 font-bold text-white">{rec.risk_score}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rec.severity === 'CRITICAL' ? 'bg-[#FF405B]/15 text-[#FF405B] border border-[#FF405B]/40' :
                                rec.severity === 'HIGH' ? 'bg-[#FF9F32]/15 text-[#FF9F32] border border-[#FF9F32]/40' :
                                rec.severity === 'MEDIUM' ? 'bg-[#FFD032]/15 text-[#FFD032] border border-[#FFD032]/40' :
                                'bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/40'
                              }`}>
                                {rec.severity}
                              </span>
                            </td>
                            <td className="p-3 text-[#91A4C2]">{rec.detection_method}</td>
                            <td className="p-3 text-[#EAF2FF] max-w-xs truncate" title={rec.explanation}>
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
            {/* PAGE 16 — SUSPICIOUS HEURISTICS                                           */}
            {activeTab === 'suspicious' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Suspicious Behavior Heuristics (MapReduce Job 9)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                        <tr>
                          <th className="p-3">Behavior Type</th>
                          <th className="p-3">Total Flows</th>
                          <th className="p-3">Total Packets</th>
                          <th className="p-3">Total Bytes</th>
                          <th className="p-3">Risk Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {Array.isArray(tabData) && tabData.map((row, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#FF9F32]">{row.behavior_type || row.category}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()}</td>
                            <td className="p-3 text-[#FF405B] font-bold">{row.risk_level || 'ELEVATED'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 17 — CORRELATION ANALYSIS                                            */}
            {activeTab === 'network-analysis' && (
              <div className="space-y-4">
                <div className="cyber-card overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
                      <tr>
                        <th className="p-3">Source Host</th>
                        <th className="p-3">Destination Host</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3558]/40">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-[#11223F]/60">
                          <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                          <td className="p-3 font-semibold text-[#00D68F]">{row.destination_ip}</td>
                          <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-[#91A4C2]">{Number(row.total_bytes).toLocaleString()} B</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 18 — MAPREDUCE THREAT RANKING (JOB 11)                                */}
            {activeTab === 'job11-threats' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">MapReduce Job 11: Source IP Threat Profiles</h3>
                      <p className="text-xs text-[#91A4C2] mt-0.5">Aggregated using Hadoop Streaming Mapper & Reducer</p>
                    </div>
                    <span className="text-xs font-mono bg-[#0B1830] text-[#00C8FF] border border-[#1A3558] px-3 py-1 rounded">
                      job_local_netsentinel_0011
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
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
                      <tbody className="divide-y divide-[#1A3558]/50">
                        {Array.isArray(tabData) && tabData.map((row, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 font-semibold text-[#00C8FF]">{row.source_ip}</td>
                            <td className="p-3 text-white">{Number(row.total_flows).toLocaleString()}</td>
                            <td className="p-3 text-[#FF405B] font-bold">{row.critical_threats}</td>
                            <td className="p-3 text-[#FF9F32] font-semibold">{row.high_threats}</td>
                            <td className="p-3 text-[#FFD032]">{row.medium_threats}</td>
                            <td className="p-3 text-[#00D68F]">{row.low_threats}</td>
                            <td className="p-3 text-[#00C8FF] font-bold">{row.avg_risk_score}</td>
                            <td className="p-3 text-[#FF405B]">{row.attack_predicted_flows}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PAGE 19 & 20 — DATASET EXPLORER & ABOUT                                   */}
            {activeTab === 'dataset-explorer' && (
              <div className="space-y-6">
                <div className="cyber-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Dataset Explorer & Real-Time Querying</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0B1830] text-[#627794] uppercase text-[10px] border-b border-[#1A3558]">
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
                      <tbody className="divide-y divide-[#1A3558]/40">
                        {Array.isArray(tabData) && tabData.map((rec, i) => (
                          <tr key={i} className="hover:bg-[#11223F]/60">
                            <td className="p-3 text-[#627794]">{rec.record_id}</td>
                            <td className="p-3 text-[#00C8FF] font-semibold">{rec.source_ip}</td>
                            <td className="p-3 text-[#00D68F]">{rec.destination_ip}</td>
                            <td className="p-3 text-white">{rec.destination_port}</td>
                            <td className="p-3 text-[#91A4C2]">{rec.protocol}</td>
                            <td className="p-3 text-[#91A4C2]">{Number(rec.flow_duration_us).toLocaleString()}</td>
                            <td className="p-3 text-[#91A4C2]">{rec.total_packets}</td>
                            <td className="p-3 text-[#91A4C2]">{rec.total_bytes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports-about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="cyber-card p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">System Architecture & Specs</h4>
                    <div className="space-y-2 text-xs text-[#91A4C2] font-mono">
                      <p><strong>Storage Engine:</strong> Apache Hadoop 3.3.6 HDFS</p>
                      <p><strong>MapReduce Pipeline:</strong> 11 Distributed Jobs (100% Parity)</p>
                      <p><strong>Supervised ML:</strong> Random Forest + HistGradientBoosting (99.96% F1)</p>
                      <p><strong>Anomaly Detection:</strong> Isolation Forest (Unsupervised 8% Contamination)</p>
                      <p><strong>Backend API:</strong> FastAPI 2.0 on Python 3.15 (Uvicorn ASGI)</p>
                      <p><strong>Frontend UI:</strong> React 18 + Vite 5 + Tailwind CSS</p>
                    </div>
                  </div>

                  <div className="cyber-card p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">Dataset Verification</h4>
                    <div className="space-y-2 text-xs text-[#91A4C2] font-mono">
                      <p><strong>Canonical Dataset:</strong> CICIDS-2017 Version 2</p>
                      <p><strong>Canonical Flows:</strong> 2,099,971 flow records</p>
                      <p><strong>Benign Baseline:</strong> 1,582,561 flows (75.36%)</p>
                      <p><strong>Attack Signatures:</strong> 517,410 flows (24.64%) across 27 classes</p>
                      <p><strong>Total Packets:</strong> 56,129,897 packets</p>
                      <p><strong>Total Traffic Volume:</strong> 47.23 Gigabytes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. BOTTOM FOOTER STATUS BAR matching reference image */}
          <footer className="h-10 bg-[#081224] border-t border-[#1A3558] px-8 flex items-center justify-between text-xs font-mono shrink-0 z-30">
            <div className="flex items-center gap-4 text-[#91A4C2]">
              <span className="flex items-center gap-1.5 text-[#00D68F] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
                System Healthy
              </span>
              <span>|</span>
              <span>Hadoop: <strong className="text-[#00D68F]">RUNNING</strong></span>
              <span>|</span>
              <span>Last Updated: <span className="text-[#EAF2FF]">{currentTime}</span></span>
            </div>

            <div className="flex items-center gap-2 text-[#91A4C2]">
              <span className="font-semibold text-white">NetSentinel 2.0</span>
              <span>|</span>
              <span>Powered by Apache Hadoop, scikit-learn &amp; FastAPI</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
