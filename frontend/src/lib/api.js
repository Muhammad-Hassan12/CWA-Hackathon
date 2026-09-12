export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8008';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_URL}/api/health`, { headers: DEFAULT_HEADERS });
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      error: err.message,
    };
  }
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_URL}/api/dashboard/stats`, { headers: DEFAULT_HEADERS });
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Dashboard stats fetch error:', err);
    return null;
  }
}

export async function fetchDashboardFeed(limit = 40, area = 'All', category = 'All') {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (area && area !== 'All') params.append('area', area);
    if (category && category !== 'All') params.append('category', category);

    const res = await fetch(`${API_URL}/api/dashboard/feed?${params.toString()}`, { headers: DEFAULT_HEADERS });
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Dashboard feed fetch error:', err);
    return [];
  }
}

export async function lookupTracking(trackingId) {
  try {
    const cleanId = encodeURIComponent(trackingId.trim().toUpperCase());
    const res = await fetch(`${API_URL}/api/dashboard/lookup/${cleanId}`, { headers: DEFAULT_HEADERS });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Tracking ID not found in Public Register');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchProcedures() {
  try {
    const res = await fetch(`${API_URL}/api/procedures`, { headers: DEFAULT_HEADERS });
    if (!res.ok) throw new Error(`Procedures fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Procedures fetch error:', err);
    return [];
  }
}

export async function submitExploitationSignal(signalData) {
  try {
    const res = await fetch(`${API_URL}/api/exploitation-signal`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(signalData),
    });
    if (!res.ok) throw new Error(`Signal submission failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function markReportResolved(trackingId) {
  try {
    const cleanId = encodeURIComponent(trackingId.trim().toUpperCase());
    const res = await fetch(`${API_URL}/api/reports/${cleanId}/mark-resolved`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to mark report resolved');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}
