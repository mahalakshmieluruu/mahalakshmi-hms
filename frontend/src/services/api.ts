const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export function getAuthToken(): string | null {
  return sessionStorage.getItem('mhl_hms_jwt');
}

export function setAuthToken(token: string | null) {
  if (token) {
    sessionStorage.setItem('mhl_hms_jwt', token);
  } else {
    sessionStorage.removeItem('mhl_hms_jwt');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (res.status === 401) {
    // Session expired or invalid token
    setAuthToken(null);
  }

  if (!res.ok) {
    let errText = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errText = data.error || data.message || errText;
    } catch {
      // ignore
    }
    throw new Error(errText);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  uploadFile: <T>(path: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<T>(path, { method: 'POST', body: formData });
  },
  getPdfDownloadUrl: (labReportId: number) => {
    const token = getAuthToken();
    return `${API_BASE}/lab-reports/${labReportId}/download-pdf?token=${encodeURIComponent(token || '')}`;
  },
  getTemplateDownloadUrl: (type: 'patients' | 'doctors' | 'staff') => {
    const token = getAuthToken();
    return `${API_BASE}/onboarding/templates/${type}?token=${encodeURIComponent(token || '')}`;
  },
  getExportDownloadUrl: (type: string) => {
    const token = getAuthToken();
    return `${API_BASE}/onboarding/export/${type}?token=${encodeURIComponent(token || '')}`;
  },
};
