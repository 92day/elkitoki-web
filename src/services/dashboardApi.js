export async function apiRequest(apiBase, path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const requestOptions = { method, headers: { ...headers } };

  if (body instanceof FormData) {
    requestOptions.body = body;
  } else if (body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBase}${path}`, requestOptions);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const fetchWeather = (apiBase) => apiRequest(apiBase, '/api/weather/seoul');
export const fetchWorkers = (apiBase) => apiRequest(apiBase, '/api/workers/');
export const fetchAlerts = (apiBase) => apiRequest(apiBase, '/api/alerts/');
export const fetchLatestSensors = (apiBase) => apiRequest(apiBase, '/api/sensors/latest');
export const fetchReports = (apiBase) => apiRequest(apiBase, '/api/reports/');
export const fetchPhotos = (apiBase, zoneId = '') => apiRequest(apiBase, `/api/photos/${zoneId ? `?zone_id=${zoneId}` : ''}`);

export const createWorker = (apiBase, payload) => apiRequest(apiBase, '/api/workers/', { method: 'POST', body: payload });
export const updateWorkerStatus = (apiBase, workerId, status) => apiRequest(apiBase, `/api/workers/${workerId}`, { method: 'PATCH', body: { status } });
export const removeWorker = (apiBase, workerId) => apiRequest(apiBase, `/api/workers/${workerId}`, { method: 'DELETE' });

export const createAlert = (apiBase, payload) => apiRequest(apiBase, '/api/alerts/', { method: 'POST', body: payload });
export const resolveAlert = (apiBase, alertId) => apiRequest(apiBase, `/api/alerts/${alertId}/resolve`, { method: 'PATCH' });

export const translateText = (apiBase, payload) => apiRequest(apiBase, '/api/translate', { method: 'POST', body: payload });
export const createReport = (apiBase, payload) => apiRequest(apiBase, '/api/reports/', { method: 'POST', body: payload });
export const removeReport = (apiBase, reportId) => apiRequest(apiBase, `/api/reports/${reportId}`, { method: 'DELETE' });

export async function uploadPhoto(apiBase, file, zoneId = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (zoneId) formData.append('zone_id', zoneId);
  return apiRequest(apiBase, '/api/photos/', { method: 'POST', body: formData });
}

export const removePhoto = (apiBase, photoId) => apiRequest(apiBase, `/api/photos/${photoId}`, { method: 'DELETE' });

export const loginUser = (apiBase, payload) => apiRequest(apiBase, '/api/auth/login', { method: 'POST', body: payload });
export const fetchCurrentUser = (apiBase, token) => apiRequest(apiBase, '/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
export const logoutUser = (apiBase, token) => apiRequest(apiBase, '/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
