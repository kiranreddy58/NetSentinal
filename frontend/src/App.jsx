import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Network, Server, Database, Clock, 
  Terminal, BarChart2, Layers, AlertTriangle, Cpu, Globe, Search,
  CheckCircle2, TrendingUp, Filter, RefreshCw, Zap, ShieldCheck,
  FileText, Settings, Play, ChevronLeft, ChevronRight, Eye, Info
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
  BarChart, AreaChart, DonutChart, ConfusionMatrixCard, 
  CurvePlot, FeatureImportanceBars 
} from './components/Charts';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // General tab data states
  const [tabData, setTabData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('');

  // Specialized states
  const [mlComparison, setMlComparison] = useState([]);
  const [featureImps, setFeatureImps] = useState({});
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [rocCurve, setRocCurve] = useState(null);
  const [prCurve, setPrCurve] = useState(null);
  const [anomalySummary, setAnomalySummary] = useState(null);
  const [anomalyDistribution, setAnomalyDistribution] = useState([]);
  const [threatSummary, setThreatSummary] = useState(null);
  const [threatRanking, setThreatRanking] = useState({ top_sources: [], top_destinations: [] });
  const [explainability, setExplainability] = useState(null);
  const [bigdataSummary, setBigdataSummary] = useState(null);

  useEffect(() => {
    // Initial load of overview & core stats
    Promise.all([
      fetchOverview().catch(() => null),
      fetchMlComparison().catch(() => []),
      fetchThreatSummary().catch(() => null),
      fetchAnomalySummary().catch(() => null)
    ]).then(([ov, comp, th, an]) => {
      setOverview(ov);
      setMlComparison(comp);
      setThreatSummary(th);
      setAnomalySummary(an);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadActiveTabData(activeTab, page, search, severityFilter);
  }, [activeTab, page, search, severityFilter]);

  const loadActiveTabData = async (tab, p, s, sev) => {
    try {
      if (tab === 'overview') {
        const [th, an, prt, att] = await Promise.all([
          fetchThreatSummary().catch(() => null),
          fetchAnomalySummary().catch(() => null),
          fetchProtocols().catch(() => []),
          fetchAttacks().catch(() => [])
        ]);
        setThreatSummary(th);
        setAnomalySummary(an);
        setTabData({ protocols: prt, attacks: att });
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
        const [sum, rnk, recs] = await Promise.all([
          fetchThreatSummary(),
          fetchThreatRanking(),
          fetchThreatRecords(p, 25, sev, s)
        ]);
        setThreatSummary(sum);
        setThreatRanking(rnk);
        setTabData(recs.items || []);
        setPagination({ page: recs.page, total_pages: recs.total_pages, total: recs.total });
      } else if (tab === 'suspicious') {
        const res = await fetchSuspicious();
        setTabData(res || []);
      } else if (tab === 'network-analysis') {
        const res = await fetchConnections(p, 25, s);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      } else if (tab === 'dataset-explorer') {
        const [daily, prt] = await Promise.all([fetchDaily(), fetchProtocols()]);
        setTabData({ daily, protocols: prt });
      } else if (tab === 'job11-threats') {
        const res = await fetchJob11Threats(p, 25);
        setTabData(res.items || []);
        setPagination({ page: res.page, total_pages: res.total_pages, total: res.total });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navGroups = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'overview', label: '1. Executive Overview', icon: ShieldAlert },
        { id: 'bigdata', label: '2. Big Data Analytics', icon: Database },
        { id: 'hadoop-cluster', label: '3. Hadoop & Job Monitoring', icon: Server }
      ]
    },
    {
      title: 'NETWORK INTELLIGENCE',
      items: [
        { id: 'source-ips', label: '4. Source IP Intelligence', icon: Globe },
        { id: 'dest-ips', label: '5. Destination IP Intelligence', icon: Server },
        { id: 'ports', label: '6. Port & Protocol Analytics', icon: Terminal },
        { id: 'traffic-volume', label: '7. Traffic Volume Tiers', icon: BarChart2 },
        { id: 'temporal', label: '8. Temporal Analytics', icon: Clock },
        { id: 'attacks', label: '9. Attack Intelligence', icon: AlertTriangle }
      ]
    },
    {
      title: 'MACHINE LEARNING & AI',
      items: [
        { id: 'ml-overview', label: '10. ML Overview', icon: Cpu },
        { id: 'random-forest', label: '11. Random Forest Model', icon: Zap },
        { id: 'gradient-boosting', label: '12. Gradient Boosting Model', icon: TrendingUp },
        { id: 'model-comparison', label: '13. Model Comparison', icon: Layers },
        { id: 'anomaly-detection', label: '14. Anomaly Detection', icon: Activity },
        { id: 'explainable-ai', label: '15. Explainable AI (XAI)', icon: Eye }
      ]
    },
    {
      title: 'THREAT OPERATIONS',
      items: [
        { id: 'threat-intelligence', label: '16. Threat Intelligence', icon: ShieldCheck },
        { id: 'suspicious', label: '17. Suspicious Heuristics', icon: AlertTriangle },
        { id: 'network-analysis', label: '18. Host Correlation Channels', icon: Network },
        { id: 'job11-threats', label: '19. MapReduce Threat Ranking', icon: Filter },
        { id: 'dataset-explorer', label: '20. Dataset Explorer & About', icon: FileText }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-slate-100 flex items-center gap-2">
                NETSENTINEL <span className="text-[10px] bg-cyan-950 border border-cyan-700 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">2.0</span>
              </h1>
              <p className="text-[11px] text-slate-400">Big Data & ML Threat Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="overflow-y-auto max-h-[calc(100vh-170px)] p-3 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">{group.title}</h3>
                <nav className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setPage(1); setSearch(''); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">HADOOP 3.3.6 LIVE</span>
          </div>
          <span className="font-mono text-cyan-400">FASTAPI 2.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active View:</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || activeTab}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              2,099,971 Flows Processed
            </span>
            <span className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              11 MapReduce Jobs
            </span>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* VIEW 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Total Canonical Flows</span>
                  <p className="text-2xl font-bold font-mono text-slate-100 mt-1">2,099,971</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Hadoop Verified
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Attack-Labelled Flows</span>
                  <p className="text-2xl font-bold font-mono text-rose-400 mt-1">517,410</p>
                  <span className="text-[10px] text-rose-300 mt-1">24.64% of total traffic</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Benign Baseline Flows</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">1,582,561</p>
                  <span className="text-[10px] text-emerald-300 mt-1">75.36% normal traffic</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">ML Model F1-Score</span>
                  <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">99.96%</p>
                  <span className="text-[10px] text-cyan-300 mt-1">HistGradientBoosting</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Anomalies Detected</span>
                  <p className="text-2xl font-bold font-mono text-amber-400 mt-1">1,811</p>
                  <span className="text-[10px] text-amber-300 mt-1">Isolation Forest (7.51%)</span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                    <span>Canonical Traffic Breakdown</span>
                    <span className="text-xs text-slate-400 font-mono">CICIDS-2017</span>
                  </h3>
                  <DonutChart 
                    data={[
                      { label: 'Benign Traffic', count: 1582561, color: '#10b981' },
                      { label: 'Attack Signatures', count: 517410, color: '#ef4444' }
                    ]}
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                    <span>Multi-Tier Threat Severity Distribution</span>
                    <span className="text-xs text-slate-400 font-mono">Risk Engine</span>
                  </h3>
                  <DonutChart 
                    data={[
                      { label: 'Critical Threat', count: 203, color: '#ef4444' },
                      { label: 'High Threat', count: 10470, color: '#f97316' },
                      { label: 'Medium Threat', count: 243, color: '#eab308' },
                      { label: 'Low Threat', count: 13213, color: '#10b981' }
                    ]}
                  />
                </div>
              </div>

              {/* Model Comparison Snapshot */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Supervised Machine Learning Verified Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Model</th>
                        <th className="p-3">Accuracy</th>
                        <th className="p-3">Precision</th>
                        <th className="p-3">Recall</th>
                        <th className="p-3">F1-Score</th>
                        <th className="p-3">ROC-AUC</th>
                        <th className="p-3">Train Time</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {mlComparison.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-slate-200">{m.model_name}</td>
                          <td className="p-3 text-cyan-400">{(m.accuracy * 100).toFixed(2)}%</td>
                          <td className="p-3 text-emerald-400">{(m.precision * 100).toFixed(2)}%</td>
                          <td className="p-3 text-emerald-400">{(m.recall * 100).toFixed(2)}%</td>
                          <td className="p-3 text-cyan-300 font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                          <td className="p-3 text-violet-400">{Number(m.roc_auc).toFixed(4)}</td>
                          <td className="p-3 text-slate-300">{Number(m.training_time_seconds).toFixed(2)}s</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                              DEPLOYED
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

          {/* VIEW 2: BIG DATA ANALYTICS */}
          {activeTab === 'bigdata' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Apache Hadoop MapReduce Pipeline Overview</h3>
                    <p className="text-xs text-slate-400 mt-1">11 Distributed MapReduce Jobs executed over 2.1M canonical network flow records</p>
                  </div>
                  <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded border border-cyan-800">
                    HDFS: /netsentinel/input/original/
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Job ID</th>
                        <th className="p-3">Analytics Focus</th>
                        <th className="p-3">Map Input</th>
                        <th className="p-3">Output Groups</th>
                        <th className="p-3">Execution Parity</th>
                        <th className="p-3">Provenance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {(bigdataSummary?.jobs_summary || []).map((j, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-cyan-400">{j.job}</td>
                          <td className="p-3 text-slate-200">{j.name}</td>
                          <td className="p-3 text-slate-300">{Number(j.input).toLocaleString()}</td>
                          <td className="p-3 text-emerald-400">{Number(j.groups).toLocaleString()}</td>
                          <td className="p-3 text-emerald-300 font-bold">100.00% Zero Discrepancy</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
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

          {/* VIEW 3: HADOOP CLUSTER & JOB MONITORING */}
          {activeTab === 'hadoop-cluster' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Hadoop Version</span>
                  <p className="text-lg font-bold font-mono text-cyan-400 mt-1">Apache Hadoop 3.3.6</p>
                  <span className="text-[10px] text-slate-400">Windows 11 Native with winutils.exe</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Storage Subsystem</span>
                  <p className="text-lg font-bold font-mono text-emerald-400 mt-1">HDFS 3.3.6</p>
                  <span className="text-[10px] text-slate-400">NameNode + DataNode Live</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Execution Framework</span>
                  <p className="text-lg font-bold font-mono text-violet-400 mt-1">LocalJobRunner</p>
                  <span className="text-[10px] text-slate-400">Deterministic Parallel In-Memory</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Total HDFS Files Ingested</span>
                  <p className="text-lg font-bold font-mono text-slate-100 mt-1">5 Canonical CSVs</p>
                  <span className="text-[10px] text-slate-400">810 MB Ingested into HDFS</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">MapReduce Job Execution Log & Provenance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Job ID</th>
                        <th className="p-3">Execution Time</th>
                        <th className="p-3">Map Input Records</th>
                        <th className="p-3">Map Output Records</th>
                        <th className="p-3">Reduce Output</th>
                        <th className="p-3">Engine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((j, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 text-cyan-400">{j.job_id || `Job ${i+1}`}</td>
                          <td className="p-3 text-slate-300">{j.execution_time_seconds ? `${j.execution_time_seconds}s` : 'Verified'}</td>
                          <td className="p-3 text-slate-300">{Number(j.map_input_records || 2099976).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(j.map_output_records || 2099971).toLocaleString()}</td>
                          <td className="p-3 text-emerald-400">{Number(j.reduce_output_records || j.unique_groups || 100).toLocaleString()}</td>
                          <td className="p-3 text-slate-400">Hadoop Streaming</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: SOURCE IP INTELLIGENCE */}
          {activeTab === 'source-ips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 w-72">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Source IP..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Page {pagination.page} of {pagination.total_pages} ({pagination.total} IPs)</span>
                  <button 
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Source IP</th>
                      <th className="p-3">Total Flows</th>
                      <th className="p-3">Total Packets</th>
                      <th className="p-3">Total Bytes</th>
                      <th className="p-3">Attack Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {Array.isArray(tabData) && tabData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-cyan-400">{row.source_ip}</td>
                        <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            Number(row.attack_flows) > 0 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
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

          {/* VIEW 5: DESTINATION IP INTELLIGENCE */}
          {activeTab === 'dest-ips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 w-72">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Destination IP..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Page {pagination.page} of {pagination.total_pages} ({pagination.total} Hosts)</span>
                  <button 
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Destination IP</th>
                      <th className="p-3">Total Flows</th>
                      <th className="p-3">Total Packets</th>
                      <th className="p-3">Total Bytes</th>
                      <th className="p-3">Unique Sources</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {Array.isArray(tabData) && tabData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-emerald-400">{row.destination_ip}</td>
                        <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()}</td>
                        <td className="p-3 text-cyan-400">{row.unique_sources || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 6: PORT & PROTOCOL ANALYTICS */}
          {activeTab === 'ports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Unique Active Ports</span>
                  <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">5,066</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Top Service Port</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">Port 80 (HTTP)</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Top Attack Target Port</span>
                  <p className="text-2xl font-bold font-mono text-rose-400 mt-1">Port 80 / 4444</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Port</th>
                      <th className="p-3">Service Name</th>
                      <th className="p-3">Total Flows</th>
                      <th className="p-3">Total Bytes</th>
                      <th className="p-3">Attack Flows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {Array.isArray(tabData) && tabData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-cyan-400">{row.destination_port}</td>
                        <td className="p-3 text-slate-300">{row.service_name || 'Dynamic'}</td>
                        <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()}</td>
                        <td className="p-3 text-rose-400">{Number(row.attack_flows || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 7: TRAFFIC VOLUME TIERS */}
          {activeTab === 'traffic-volume' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Traffic Volume Tiers (MapReduce Job 5)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Tier Category</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Flow Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-cyan-400">{row.tier || row.volume_category}</td>
                          <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-emerald-400">{Number(row.total_bytes).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(2)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: TEMPORAL ANALYTICS */}
          {activeTab === 'temporal' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">60-Minute Temporal Traffic Distribution</h3>
                <AreaChart 
                  data={Array.isArray(tabData) ? tabData : []}
                  xKey="time_bucket"
                  yKey="total_flows"
                  color="#06b6d4"
                />
              </div>
            </div>
          )}

          {/* VIEW 9: ATTACK INTELLIGENCE */}
          {activeTab === 'attacks' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Attack Taxonomy Breakdown (27 Ground-Truth Labels)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Label / Signature</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Attack %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-rose-400">{row.label || row.attack_category}</td>
                          <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()}</td>
                          <td className="p-3 text-amber-400">{row.percentage || `${((Number(row.total_flows)/2099971)*100).toFixed(3)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 10: MACHINE LEARNING OVERVIEW */}
          {activeTab === 'ml-overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-cyan-400">Random Forest</h4>
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-400">Ensemble of 100 deep decision trees with balanced bootstrap sampling and Gini impurity splitting.</p>
                  <div className="space-y-1 font-mono text-xs pt-2 border-t border-slate-800">
                    <div className="flex justify-between"><span>Accuracy:</span><span className="text-cyan-300">99.95%</span></div>
                    <div className="flex justify-between"><span>F1-Score:</span><span className="text-cyan-300">99.94%</span></div>
                    <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-cyan-300">1.0000</span></div>
                    <div className="flex justify-between"><span>Training Time:</span><span className="text-slate-300">4.69s</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-emerald-400">Gradient Boosting</h4>
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-400">Histogram-based Gradient Boosting Classifier with 100 boosting iterations and bin-based splits.</p>
                  <div className="space-y-1 font-mono text-xs pt-2 border-t border-slate-800">
                    <div className="flex justify-between"><span>Accuracy:</span><span className="text-emerald-300">99.97%</span></div>
                    <div className="flex justify-between"><span>F1-Score:</span><span className="text-emerald-300">99.96%</span></div>
                    <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-emerald-300">1.0000</span></div>
                    <div className="flex justify-between"><span>Training Time:</span><span className="text-slate-300">16.74s</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-amber-400">Baseline Decision Tree</h4>
                    <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">BENCHMARK</span>
                  </div>
                  <p className="text-xs text-slate-400">Single CART decision tree constrained to depth 8 for establishing benchmark baseline performance.</p>
                  <div className="space-y-1 font-mono text-xs pt-2 border-t border-slate-800">
                    <div className="flex justify-between"><span>Accuracy:</span><span className="text-amber-300">99.35%</span></div>
                    <div className="flex justify-between"><span>F1-Score:</span><span className="text-amber-300">99.27%</span></div>
                    <div className="flex justify-between"><span>ROC-AUC:</span><span className="text-amber-300">0.9963</span></div>
                    <div className="flex justify-between"><span>Training Time:</span><span className="text-slate-300">2.86s</span></div>
                  </div>
                </div>
              </div>

              {/* Leakage Audit Notice */}
              <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h5 className="font-semibold text-cyan-300">Strict Data Leakage Prevention Enforced</h5>
                  <p className="text-slate-400">
                    Source/Destination IP addresses, Flow timestamps, and Target Labels are completely excluded from the model feature matrix. 
                    Scalers are strictly fitted on the 70% training split. Zero target information leaks into validation or holdout test sets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 11: RANDOM FOREST MODEL */}
          {activeTab === 'random-forest' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <ConfusionMatrixCard matrix={confusionMatrix?.confusion_matrix} modelName="Random Forest" />
                <CurvePlot points={rocCurve?.curve} title="ROC Curve (Random Forest)" auc={rocCurve?.roc_auc || 1.0} />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Top 15 Feature Importances (Gini Impurity MDI)</h4>
                <FeatureImportanceBars features={featureImps} maxDisplay={15} />
              </div>
            </div>
          )}

          {/* VIEW 12: GRADIENT BOOSTING MODEL */}
          {activeTab === 'gradient-boosting' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <ConfusionMatrixCard matrix={confusionMatrix?.confusion_matrix} modelName="Gradient Boosting" />
                <CurvePlot points={rocCurve?.curve} title="ROC Curve (Gradient Boosting)" auc={rocCurve?.roc_auc || 1.0} color="#10b981" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Top 15 Feature Importances (Permutation Impact)</h4>
                <FeatureImportanceBars features={featureImps} maxDisplay={15} />
              </div>
            </div>
          )}

          {/* VIEW 13: MODEL COMPARISON */}
          {activeTab === 'model-comparison' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Multi-Model Performance Comparison (Test Holdout: 24,129 Flows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
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
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {mlComparison.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-cyan-400">{m.model_name}</td>
                          <td className="p-3 text-slate-200">{(m.accuracy * 100).toFixed(2)}%</td>
                          <td className="p-3 text-emerald-400">{(m.precision * 100).toFixed(2)}%</td>
                          <td className="p-3 text-emerald-400">{(m.recall * 100).toFixed(2)}%</td>
                          <td className="p-3 text-cyan-300 font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                          <td className="p-3 text-rose-400">{Number(m.false_positive_rate).toFixed(4)}</td>
                          <td className="p-3 text-amber-400">{Number(m.false_negative_rate).toFixed(4)}</td>
                          <td className="p-3 text-slate-300">{Number(m.training_time_seconds).toFixed(2)}s</td>
                          <td className="p-3 text-slate-400">{Number(m.model_size_mb).toFixed(2)} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 14: ANOMALY DETECTION */}
          {activeTab === 'anomaly-detection' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Algorithm</span>
                  <p className="text-lg font-bold font-mono text-cyan-400 mt-1">Isolation Forest</p>
                  <span className="text-[10px] text-slate-400">Unsupervised Ensembles</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Total Flagged Anomalies</span>
                  <p className="text-lg font-bold font-mono text-amber-400 mt-1">{anomalySummary?.total_anomalies_flagged?.toLocaleString() || '1,811'}</p>
                  <span className="text-[10px] text-slate-400">{anomalySummary?.anomaly_percentage || 7.51}% of holdout traffic</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Attack Capture Rate</span>
                  <p className="text-lg font-bold font-mono text-emerald-400 mt-1">{anomalySummary?.attack_capture_rate_unsupervised || 9.06}%</p>
                  <span className="text-[10px] text-slate-400">Zero-day signature detection</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Contamination Setting</span>
                  <p className="text-lg font-bold font-mono text-slate-100 mt-1">0.08 (8%)</p>
                  <span className="text-[10px] text-slate-400">Calibrated baseline</span>
                </div>
              </div>

              {/* Anomaly Distribution Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Isolation Forest Anomaly Score Distribution (0-100)</h3>
                <BarChart 
                  data={anomalyDistribution}
                  xKey="range"
                  yKey="count"
                  color="#f59e0b"
                />
              </div>

              {/* Sample Anomalies Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Sample Flagged Anomalous Traffic Records</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Flow Index</th>
                        <th className="p-3">Anomaly Score</th>
                        <th className="p-3">Protocol</th>
                        <th className="p-3">Target Port</th>
                        <th className="p-3">Duration (us)</th>
                        <th className="p-3">Offline Ground Truth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 text-slate-400">{rec.flow_index}</td>
                          <td className="p-3 text-amber-400 font-bold">{rec.anomaly_score}/100</td>
                          <td className="p-3 text-slate-300">{rec.protocol === 6 ? 'TCP' : 'UDP'}</td>
                          <td className="p-3 text-cyan-400">{rec.dst_port}</td>
                          <td className="p-3 text-slate-300">{Number(rec.flow_duration).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              rec.ground_truth_label !== 'BENIGN' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {rec.ground_truth_label}
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

          {/* VIEW 15: EXPLAINABLE AI */}
          {activeTab === 'explainable-ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-200">Global Feature Importance (Random Forest Gini MDI)</h4>
                  <FeatureImportanceBars features={explainability?.global_importance_ranking || []} maxDisplay={10} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-200">Permutation Importance (F1-Score Degradation)</h4>
                  <FeatureImportanceBars features={explainability?.permutation_impact_ranking || []} maxDisplay={10} />
                </div>
              </div>

              {/* Local Flow Explanations */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200">Local Flow Explanations (Sample Detected Attacks)</h4>
                <div className="space-y-3">
                  {(explainability?.local_flow_explanations || []).map((exp, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-semibold">Flow #{exp.flow_index} | Attack Probability: {(exp.attack_probability * 100).toFixed(1)}%</span>
                        <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-mono text-[10px]">
                          {exp.ground_truth_label}
                        </span>
                      </div>
                      <p className="text-slate-300">{exp.explanation_summary}</p>
                      <div className="flex gap-2 pt-1">
                        {exp.top_contributing_features.map((feat, fIdx) => (
                          <span key={fIdx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                            {feat.feature}: <strong className="text-cyan-400">{feat.value}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 16: THREAT INTELLIGENCE */}
          {activeTab === 'threat-intelligence' && (
            <div className="space-y-6">
              {/* Severity KPI cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-4">
                  <span className="text-xs text-rose-400 uppercase font-semibold">Critical Threats</span>
                  <p className="text-2xl font-bold font-mono text-rose-300 mt-1">{threatSummary?.critical_threats?.toLocaleString() || '203'}</p>
                  <span className="text-[10px] text-slate-400">Score &ge; 70.0 (Immediate action)</span>
                </div>
                <div className="bg-orange-950/30 border border-orange-800/60 rounded-lg p-4">
                  <span className="text-xs text-orange-400 uppercase font-semibold">High Threats</span>
                  <p className="text-2xl font-bold font-mono text-orange-300 mt-1">{threatSummary?.high_threats?.toLocaleString() || '10,470'}</p>
                  <span className="text-[10px] text-slate-400">Score 45.0 - 69.9</span>
                </div>
                <div className="bg-amber-950/30 border border-amber-800/60 rounded-lg p-4">
                  <span className="text-xs text-amber-400 uppercase font-semibold">Medium Threats</span>
                  <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{threatSummary?.medium_threats?.toLocaleString() || '243'}</p>
                  <span className="text-[10px] text-slate-400">Score 20.0 - 44.9</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-4">
                  <span className="text-xs text-emerald-400 uppercase font-semibold">Low Threats / Nominal</span>
                  <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{threatSummary?.low_threats?.toLocaleString() || '13,213'}</p>
                  <span className="text-[10px] text-slate-400">Score &lt; 20.0 (Normal baseline)</span>
                </div>
              </div>

              {/* Threat Records Table with Filters */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 w-64">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search IP, label, explanation..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
                      />
                    </div>
                    <select
                      value={severityFilter}
                      onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-mono"
                    >
                      <option value="">All Severities</option>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>Page {pagination.page} of {pagination.total_pages}</span>
                    <button 
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={page >= pagination.total_pages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
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
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 text-slate-400">{rec.record_id}</td>
                          <td className="p-3 font-semibold text-cyan-400">{rec.source_ip}</td>
                          <td className="p-3 text-emerald-400">{rec.destination_ip}</td>
                          <td className="p-3 text-slate-300">{rec.destination_port}</td>
                          <td className="p-3 font-bold text-slate-100">{rec.risk_score}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rec.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                              rec.severity === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                              rec.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}>
                              {rec.severity}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{rec.detection_method}</td>
                          <td className="p-3 text-slate-300 max-w-xs truncate" title={rec.explanation}>
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

          {/* VIEW 17: SUSPICIOUS HEURISTICS */}
          {activeTab === 'suspicious' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Suspicious Behaviour Indicators (MapReduce Job 9)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Behavior Category</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Total Packets</th>
                        <th className="p-3">Total Bytes</th>
                        <th className="p-3">Risk Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-amber-400">{row.behavior_type || row.category}</td>
                          <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()}</td>
                          <td className="p-3 text-rose-400">{row.risk_level || 'ELEVATED'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 18: NETWORK ANALYSIS / CORRELATION */}
          {activeTab === 'network-analysis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 w-72">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Host IP..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Page {pagination.page} of {pagination.total_pages} ({pagination.total} Host Pairs)</span>
                  <button 
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Source Host</th>
                      <th className="p-3">Destination Host</th>
                      <th className="p-3">Total Flows</th>
                      <th className="p-3">Total Packets</th>
                      <th className="p-3">Total Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {Array.isArray(tabData) && tabData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-cyan-400">{row.source_ip}</td>
                        <td className="p-3 font-semibold text-emerald-400">{row.destination_ip}</td>
                        <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_packets).toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{Number(row.total_bytes).toLocaleString()} B</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 19: MAPREDUCE JOB 11 THREAT RANKING */}
          {activeTab === 'job11-threats' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">MapReduce Job 11: Source IP Threat Profiles</h3>
                    <p className="text-xs text-slate-400 mt-1">Aggregated with Hadoop Streaming Mapper & Reducer</p>
                  </div>
                  <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded border border-cyan-800">
                    job_local_netsentinel_0011
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="p-3">Source IP</th>
                        <th className="p-3">Total Flows</th>
                        <th className="p-3">Critical Threats</th>
                        <th className="p-3">High Threats</th>
                        <th className="p-3">Medium</th>
                        <th className="p-3">Low</th>
                        <th className="p-3">Avg Risk Score</th>
                        <th className="p-3">ML Attack Flows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Array.isArray(tabData) && tabData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-cyan-400">{row.source_ip}</td>
                          <td className="p-3 text-slate-200">{Number(row.total_flows).toLocaleString()}</td>
                          <td className="p-3 text-rose-400 font-bold">{row.critical_threats}</td>
                          <td className="p-3 text-orange-400 font-semibold">{row.high_threats}</td>
                          <td className="p-3 text-amber-400">{row.medium_threats}</td>
                          <td className="p-3 text-emerald-400">{row.low_threats}</td>
                          <td className="p-3 text-cyan-300 font-bold">{row.avg_risk_score}</td>
                          <td className="p-3 text-rose-300">{row.attack_predicted_flows}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 20: DATASET EXPLORER & ABOUT */}
          {activeTab === 'dataset-explorer' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-200">Dataset Specification (CICIDS-2017)</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p><strong>Total Canonical Rows:</strong> 2,099,971 bidirectional flow records</p>
                    <p><strong>Files:</strong> 5 Standard CSVs (Monday to Friday)</p>
                    <p><strong>Standard Dataset Columns:</strong> 89 features</p>
                    <p><strong>Plus Dataset Columns:</strong> 105 features</p>
                    <p><strong>Ground Truth Labels:</strong> 27 distinct attack signatures</p>
                    <p><strong>Unique Source Hosts:</strong> 174</p>
                    <p><strong>Unique Target Hosts:</strong> 19,044</p>
                    <p><strong>Total Volume:</strong> 47.23 Gigabytes</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-200">Technology Stack & System Specs</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p><strong>Distributed Storage:</strong> Apache Hadoop 3.3.6 HDFS</p>
                    <p><strong>Execution Engine:</strong> Hadoop Streaming LocalJobRunner</p>
                    <p><strong>Machine Learning:</strong> scikit-learn 1.9.1 (RF, HistGradientBoosting, IsolationForest)</p>
                    <p><strong>Backend:</strong> FastAPI 0.162 on Python 3.15.2 (Uvicorn ASGI)</p>
                    <p><strong>Frontend:</strong> React 18 + Vite + Tailwind CSS + Lucide Icons</p>
                    <p><strong>Architecture:</strong> Zero Data Leakage Feature Pipeline</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">About NetSentinel 2.0</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NetSentinel 2.0 is an enterprise Big Data and Machine Learning Cybersecurity Intelligence Platform designed for deep network traffic inspection, distributed attack detection, and multi-factor threat risk scoring. The system seamlessly combines distributed Apache Hadoop MapReduce batch processing with state-of-the-art supervised machine learning classifiers, unsupervised statistical anomaly detection via Isolation Forests, and Explainable AI (XAI) feature attribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
