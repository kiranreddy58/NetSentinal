export const API_BASE = '/api';

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
