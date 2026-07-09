const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  // Tambahkan AbortController untuk timeout 1 detik (agar cepat fallback ke mock)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Terjadi kesalahan',
    }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Public API (no auth)
export async function getBatchByNumber(batchNumber: string) {
  return fetchApi(`/api/public/batch/${batchNumber}`);
}

// Auth API
export async function loginEmail(email: string, password: string) {
  return fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerSupplier(data: {
  name: string;
  npwp: string;
  email: string;
  password: string;
  npwpFileUrl?: string;
}) {
  return fetchApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginSso(code: string, state: string) {
  return fetchApi('/api/auth/sso', {
    method: 'POST',
    body: JSON.stringify({ code, state }),
  });
}

export async function getCurrentUser(token: string) {
  return fetchApi('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// File Upload API
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_URL}/api/upload`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Upload gagal',
    }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

// Supplier API
export async function getSuppliers(token: string, search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchApi(`/api/suppliers${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createSupplier(token: string, data: any) {
  return fetchApi('/api/suppliers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

// Batch API
export async function getBatches(token: string, date?: string) {
  const params = date ? `?date=${date}` : '';
  return fetchApi(`/api/batches${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createBatch(token: string, data: any) {
  return fetchApi('/api/batches', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

// Complaint API
export async function getComplaints(token: string, status?: string) {
  const params = status ? `?status=${status}` : '';
  return fetchApi(`/api/complaints${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function submitComplaint(data: {
  reportKey: string;
  description: string;
  evidence?: string;
}) {
  return fetchApi('/api/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Market API
export async function getMarketPrices(token: string, item: string, region?: string) {
  const params = new URLSearchParams({ item });
  if (region) params.append('region', region);
  return fetchApi(`/api/market/prices?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getHETSuggestion(token: string, item: string, region?: string) {
  const params = new URLSearchParams({ item });
  if (region) params.append('region', region);
  return fetchApi(`/api/market/het-suggestion?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Reports API
export async function getDailyReport(token: string, date: string) {
  return fetchApi(`/api/reports/daily?date=${date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getWeeklyReport(token: string, week: string) {
  return fetchApi(`/api/reports/weekly?week=${week}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Supplier Dashboard API
export async function getSupplierDashboard(token: string) {
  return fetchApi('/api/supplier/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSupplierProducts(token: string) {
  return fetchApi('/api/supplier/products', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSupplierOrders(token: string, status?: string) {
  const params = status ? `?status=${status}` : '';
  return fetchApi(`/api/supplier/orders${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function acceptOrder(token: string, orderId: string) {
  return fetchApi(`/api/supplier/orders/${orderId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rejectOrder(token: string, orderId: string) {
  return fetchApi(`/api/supplier/orders/${orderId}/reject`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSupplierMoUs(token: string) {
  return fetchApi('/api/supplier/mou', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSupplierMaterials(token: string, period?: string) {
  const params = period ? `?period=${period}` : '';
  return fetchApi(`/api/supplier/materials${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSupplierNetwork(token: string) {
  return fetchApi('/api/supplier/network', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getWeeklyShipments(token: string) {
  return fetchApi('/api/supplier/shipments/weekly', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
