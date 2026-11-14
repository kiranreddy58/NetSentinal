export const API_BASE = '/api';

// Core Analytics
export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/overview`);
  return res.json();
}

export async function fetchSourceIps(page = 1, pageSize = 20, search = '') {
  const res = await fetch(`${API_BASE}/source-ips?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`);
  return res.json();
}

export async function fetchDestIps(page = 1, pageSize = 20, search = '') {
  const res = await fetch(`${API_BASE}/destination-ips?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`);
  return res.json();
}

export async function fetchPorts(page = 1, pageSize = 20, search = '') {
  const res = await fetch(`${API_BASE}/ports?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`);
  return res.json();
}

export async function fetchProtocols() {
  const res = await fetch(`${API_BASE}/protocols`);
  return res.json();
}

export async function fetchTrafficVolume() {
  const res = await fetch(`${API_BASE}/traffic-volume`);
  return res.json();
}

export async function fetchTemporal() {
  const res = await fetch(`${API_BASE}/temporal`);
  return res.json();
}

export async function fetchDaily() {
  const res = await fetch(`${API_BASE}/daily`);
  return res.json();
}

export async function fetchAttacks() {
  const res = await fetch(`${API_BASE}/attacks`);
  return res.json();
}

export async function fetchSuspicious() {
  const res = await fetch(`${API_BASE}/suspicious`);
  return res.json();
}

export async function fetchConnections(page = 1, pageSize = 20, search = '') {
  const res = await fetch(`${API_BASE}/connections?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`);
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  return res.json();
}

// Machine Learning
export async function fetchMlModels() {
  const res = await fetch(`${API_BASE}/ml/models`);
  return res.json();
}

export async function fetchMlMetrics() {
  const res = await fetch(`${API_BASE}/ml/metrics`);
  return res.json();
}

export async function fetchMlComparison() {
  const res = await fetch(`${API_BASE}/ml/comparison`);
  return res.json();
}

export async function fetchMlFeatureImportance() {
  const res = await fetch(`${API_BASE}/ml/feature-importance`);
  return res.json();
}

export async function fetchMlConfusionMatrix(model = 'Random Forest') {
  const res = await fetch(`${API_BASE}/ml/confusion-matrix?model=${encodeURIComponent(model)}`);
  return res.json();
}

export async function fetchMlRoc(model = 'Random Forest') {
  const res = await fetch(`${API_BASE}/ml/roc?model=${encodeURIComponent(model)}`);
  return res.json();
}

export async function fetchMlPr(model = 'Random Forest') {
  const res = await fetch(`${API_BASE}/ml/precision-recall?model=${encodeURIComponent(model)}`);
  return res.json();
}

export async function fetchMlPredictions(page = 1, pageSize = 25) {
  const res = await fetch(`${API_BASE}/ml/predictions?page=${page}&page_size=${pageSize}`);
  return res.json();
}

export async function fetchMlExplainability() {
  const res = await fetch(`${API_BASE}/ml/explainability`);
  return res.json();
}

export async function postBatchPredict(modelName, records) {
  const res = await fetch(`${API_BASE}/ml/predict-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: modelName, records: records })
  });
  return res.json();
}

// Anomaly Detection
export async function fetchAnomalySummary() {
  const res = await fetch(`${API_BASE}/anomaly/summary`);
  return res.json();
}

export async function fetchAnomalyDistribution() {
  const res = await fetch(`${API_BASE}/anomaly/distribution`);
  return res.json();
}

export async function fetchAnomalyTopSources() {
  const res = await fetch(`${API_BASE}/anomaly/top-sources`);
  return res.json();
}

export async function fetchAnomalyRecords(page = 1, pageSize = 20) {
  const res = await fetch(`${API_BASE}/anomaly/records?page=${page}&page_size=${pageSize}`);
  return res.json();
}

// Threat Intelligence
export async function fetchThreatSummary() {
  const res = await fetch(`${API_BASE}/threats/summary`);
  return res.json();
}

export async function fetchThreatRanking() {
  const res = await fetch(`${API_BASE}/threats/ranking`);
  return res.json();
}

export async function fetchThreatSeverity() {
  const res = await fetch(`${API_BASE}/threats/severity`);
  return res.json();
}

export async function fetchThreatRecords(page = 1, pageSize = 25, severity = null, search = '') {
  let url = `${API_BASE}/threats/records?page=${page}&page_size=${pageSize}`;
  if (severity) url += `&severity=${encodeURIComponent(severity)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchThreatExplanations() {
  const res = await fetch(`${API_BASE}/threats/explanations`);
  return res.json();
}

// Big Data & MapReduce
export async function fetchBigdataSummary() {
  const res = await fetch(`${API_BASE}/bigdata/summary`);
  return res.json();
}

export async function fetchJob11Threats(page = 1, pageSize = 25) {
  const res = await fetch(`${API_BASE}/bigdata/job11-threats?page=${page}&page_size=${pageSize}`);
  return res.json();
}
