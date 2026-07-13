const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Terjadi kesalahan",
    }));
    const err = new Error(error.message || "Request failed") as any;
    err.code = error.code || "UNKNOWN_ERROR";
    err.details = error.details || undefined;
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// ============================================================================
// Public API (no auth)
// ============================================================================
export async function getBatchByNumber(batchNumber: string) {
  return fetchApi(`/api/batches/by-number/${batchNumber}`);
}

// ============================================================================
// Auth API
// ============================================================================
export async function loginEmail(email: string, password: string) {
  return fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerSupplier(data: {
  name: string;
  nib: string;
  email: string;
  password: string;
  nibFileUrl?: string;
  phone?: string;
  province: string;
  regency: string;
  district: string;
}) {
  return fetchApi("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginSso(code: string, state: string) {
  return fetchApi("/api/auth/sso", {
    method: "POST",
    body: JSON.stringify({ code, state }),
  });
}

export async function handleSsoCallback(code: string, state: string) {
  return fetchApi(
    `/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
  );
}

export async function devLogin(role: string) {
  return fetchApi(`/api/auth/dev-login?role=${encodeURIComponent(role)}`);
}

export async function getCurrentUser(token: string) {
  return fetchApi("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// File Upload API
// ============================================================================
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/api/upload`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Upload gagal",
    }));
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
}

// ============================================================================
// Supplier API (Admin)
// ============================================================================
export async function getSuppliers(token: string, search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchApi(`/api/suppliers${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSupplierById(token: string, id: string) {
  return fetchApi(`/api/suppliers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createSupplier(token: string, data: any) {
  return fetchApi("/api/suppliers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(token: string, id: string, data: any) {
  return fetchApi(`/api/suppliers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateSupplierProfile(token: string, data: any) {
  return fetchApi("/api/suppliers/me/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteSupplier(token: string, id: string) {
  return fetchApi(`/api/suppliers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Supplier Items
export async function getSupplierItems(token: string, supplierId: string) {
  return fetchApi(`/api/suppliers/${supplierId}/items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addSupplierItem(
  token: string,
  supplierId: string,
  data: any,
) {
  return fetchApi(`/api/suppliers/${supplierId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function removeSupplierItem(token: string, itemId: string) {
  return fetchApi(`/api/suppliers/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// Batch API
// ============================================================================
export async function getBatches(
  token: string,
  sppgId?: string,
  status?: string,
) {
  const params = new URLSearchParams();
  if (sppgId) params.append("sppgId", sppgId);
  if (status) params.append("status", status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/api/batches${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createBatch(
  token: string,
  data: any,
  sppgId: string,
  userId: string,
) {
  return fetchApi(`/api/batches?sppgId=${sppgId}&userId=${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateBatchStatus(
  token: string,
  id: string,
  status: string,
) {
  return fetchApi(`/api/batches/${id}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// Order API
// ============================================================================
export async function getOrders(
  token: string,
  sppgId?: string,
  supplierId?: string,
) {
  const params = new URLSearchParams();
  if (sppgId) params.append("sppgId", sppgId);
  if (supplierId) params.append("supplierId", supplierId);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/api/orders${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOrderById(token: string, id: string) {
  return fetchApi(`/api/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createOrder(
  token: string,
  data: any,
  sppgId: string,
  userId: string,
) {
  return fetchApi(`/api/orders?sppgId=${sppgId}&userId=${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: string,
) {
  return fetchApi(`/api/orders/${id}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// Complaint API
// ============================================================================
export async function getComplaints(
  token: string,
  batchId?: string,
  status?: string,
) {
  const params = new URLSearchParams();
  if (batchId) params.append("batchId", batchId);
  if (status) params.append("status", status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/api/complaints${qs}`, {
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
  return fetchApi("/api/complaints", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateComplaintStatus(
  token: string,
  id: string,
  status: string,
  notes?: string,
) {
  return fetchApi(`/api/complaints/${id}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, notes }),
  });
}

// ============================================================================
// Market API
// ============================================================================
export interface MarketLocationParams {
  province?: string;
  regency?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

function appendMarketLocationParams(
  params: URLSearchParams,
  location?: MarketLocationParams,
) {
  if (!location) return;

  if (location.province) params.append("province", location.province);
  if (location.regency) params.append("regency", location.regency);
  if (location.district) params.append("district", location.district);
  if (location.latitude !== undefined) {
    params.append("latitude", String(location.latitude));
  }
  if (location.longitude !== undefined) {
    params.append("longitude", String(location.longitude));
  }
  if (location.radiusKm !== undefined) {
    params.append("radiusKm", String(location.radiusKm));
  }
}

export async function getMarketPrices(
  token: string,
  item: string,
  location?: MarketLocationParams,
) {
  const params = new URLSearchParams({ item });
  appendMarketLocationParams(params, location);
  return fetchApi(`/api/market/prices?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMarketAnomalies(
  token: string,
  location?: MarketLocationParams,
) {
  const params = new URLSearchParams();
  appendMarketLocationParams(params, location);
  const query = params.toString();
  return fetchApi(`/api/market/anomalies${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getHETSuggestion(
  token: string,
  item: string,
  location?: MarketLocationParams,
) {
  const params = new URLSearchParams({ item });
  appendMarketLocationParams(params, location);
  return fetchApi(`/api/market/het-suggestion?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// Reports API
// ============================================================================
export async function getDailyReport(
  token: string,
  date: string,
  sppgId?: string,
) {
  const params = new URLSearchParams({ date });
  if (sppgId) params.append("sppgId", sppgId);
  return fetchApi(`/api/reports/daily?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getWeeklyReport(
  token: string,
  week: string,
  sppgId?: string,
) {
  const params = new URLSearchParams({ week });
  if (sppgId) params.append("sppgId", sppgId);
  return fetchApi(`/api/reports/weekly?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// MoU API
// ============================================================================
export async function getMoUs(token: string, sppgId?: string) {
  const params = sppgId ? `?sppgId=${sppgId}` : "";
  return fetchApi(`/api/mou${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMoUById(token: string, id: string) {
  return fetchApi(`/api/mou/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createMoU(token: string, data: any, userId: string) {
  return fetchApi(`/api/mou?userId=${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateMoUStatus(
  token: string,
  id: string,
  status: string,
) {
  return fetchApi(`/api/mou/${id}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// Beneficiary API
// ============================================================================
export async function getBeneficiaries(token: string, sppgId?: string) {
  const params = sppgId ? `?sppgId=${sppgId}` : "";
  return fetchApi(`/api/beneficiaries${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getBeneficiaryById(token: string, id: string) {
  return fetchApi(`/api/beneficiaries/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createBeneficiary(
  token: string,
  data: any,
  sppgId: string,
) {
  return fetchApi(`/api/beneficiaries?sppgId=${sppgId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteBeneficiary(token: string, id: string) {
  return fetchApi(`/api/beneficiaries/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// SPPG API
// ============================================================================
export async function getSppgs(token: string) {
  return fetchApi("/api/sppg", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSppgById(token: string, id: string) {
  return fetchApi(`/api/sppg/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createSppg(token: string, data: any) {
  return fetchApi("/api/sppg", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateSppg(
  token: string,
  id: string,
  data: {
    name?: string;
    address?: string;
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  },
) {
  return fetchApi(`/api/sppg/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}
