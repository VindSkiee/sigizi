# API Documentation - SIGIZI

Base URL: `http://localhost:3001`

## Authentication

### SSO Login

```
POST /api/auth/sso
```

Initiates SSO login with BGN portal.

**Response:**

```json
{
  "success": true,
  "data": {
    "redirectUrl": "https://mitra.bgn.go.id/sso/authorize?..."
  }
}
```

### SSO Callback

```
GET /api/auth/callback?code=xxx&state=yyy
```

Handles SSO callback from BGN portal.

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "clx...",
      "email": "user@sppg.go.id",
      "name": "Budi Santoso",
      "role": "SPPG_ADMIN",
      "sppgId": "clx..."
    }
  }
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "user@sppg.go.id",
    "name": "Budi Santoso",
    "role": "SPPG_ADMIN",
    "sppg": {
      "id": "clx...",
      "name": "SPPG Purwakarta"
    }
  }
}
```

---

## Supplier Management

### List Suppliers

```
GET /api/suppliers
Authorization: Bearer <token>
```

**Query Params:**

- `search` - Search by name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "name": "UD. Sumber Rejeki",
        "npwp": "1234567890",
        "phone": "08123456789",
        "address": "Purwakarta",
        "items": [
          {
            "id": "clx...",
            "name": "Beras Premium",
            "unit": "kg",
            "basePrice": 12000
          }
        ],
        "createdAt": "2026-07-09T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### Register Supplier

```
POST /api/suppliers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "UD. Sumber Rejeki",
  "npwp": "1234567890",
  "phone": "08123456789",
  "address": "Purwakarta"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "UD. Sumber Rejeki",
    "npwp": "1234567890",
    "createdAt": "2026-07-09T00:00:00Z"
  }
}
```

### Get Supplier Detail

```
GET /api/suppliers/:id
Authorization: Bearer <token>
```

### Update Supplier

```
PUT /api/suppliers/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### List Supplier Items

```
GET /api/suppliers/:id/items
Authorization: Bearer <token>
```

### Add Supplier Item

```
POST /api/suppliers/:id/items
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Beras Premium",
  "unit": "kg",
  "basePrice": 12000
}
```

---

## Market Analytics (Dynamic Median)

### Get Market Prices

**Admin hierarchy filter:**

```
GET /api/market/prices?item=Beras&province=Jawa+Barat&regency=Purwakarta&district=Babakancikao
Authorization: Bearer <token>
```

**GPS radius filter:**

```
GET /api/market/prices?item=Beras&latitude=-6.5398&longitude=107.4471&radiusKm=5
Authorization: Bearer <token>
```

**Query Params:**

| Param       | Type   | Required | Example        | Description                  |
| ----------- | ------ | -------- | -------------- | ---------------------------- |
| `item`      | string | **Yes**  | `Beras`        | Item name to search          |
| `province`  | string | No*      | `Jawa Barat`   | Province filter (admin mode) |
| `regency`   | string | No*      | `Purwakarta`   | Regency filter (admin mode)  |
| `district`  | string | No*      | `Babakancikao` | District filter (admin mode) |
| `latitude`  | number | No**     | `-6.5398`      | GPS latitude (GPS mode)      |
| `longitude` | number | No**     | `107.4471`     | GPS longitude (GPS mode)     |
| `radiusKm`  | number | No       | `5`            | Radius in km (default: 25)   |

\* Admin mode filters are **mutually exclusive** with GPS mode.  
\** latitude & longitude must be provided together.

**Scope cascade (admin mode):** `district` → `regency` → `province` → `master`  
**Scope cascade (GPS mode):** radius → ×3 → ×5 (max 50km) → admin fallback → master  
**Threshold:** ≥5 samples per scope to use that scope; <5 cascades to wider scope.

**Response:**

```json
{
  "success": true,
  "data": {
    "item": "Beras",
    "filter": {
      "province": "Jawa Barat",
      "regency": "Purwakarta",
      "district": "Babakancikao",
      "latitude": null,
      "longitude": null,
      "radiusKm": null
    },
    "scopeUsed": "district",
    "sampleCount": 25,
    "effectiveRadiusKm": null,
    "statistics": {
      "raw": {
        "min": 10000,
        "max": 15000,
        "median": 12000,
        "mean": 12500,
        "count": 25
      },
      "clean": {
        "min": 10000,
        "max": 14000,
        "median": 12000,
        "mean": 12100,
        "count": 23
      }
    },
    "suppliers": [
      {
        "id": "clx...",
        "name": "UD. Sumber Rejeki",
        "price": 12000,
        "isAnomaly": false,
        "latitude": -6.5563,
        "longitude": 107.4439,
        "distanceKm": 2.4
      }
    ]
  }
}
```

**`scopeUsed` values:** `district` | `regency` | `province` | `gps_radius` | `master`

### Get Price Anomalies

```
GET /api/market/anomalies?province=Jawa+Barat&regency=Purwakarta
Authorization: Bearer <token>
```

Same query params as above (without `item`). Returns IQR-based outliers per item.

### Get HET Suggestion

```
GET /api/market/het-suggestion?item=Beras&latitude=-6.5398&longitude=107.4471&radiusKm=5
Authorization: Bearer <token>
```

**`basedOn` values:**

| Value                         | Kondisi                      | Formula                           |
| ----------------------------- | ---------------------------- | --------------------------------- |
| `master_reference_cold_start` | 0 supplier di semua scope    | `ceil(master)`                    |
| `blended_small_sample`        | 1–4 supplier                 | `ceil((master + mean) / 2 * 1.1)` |
| `clean_dynamic_median`        | ≥ 5 supplier, clean data ada | `ceil(median(clean) * 1.1)`       |
| `all_anomaly_fallback`        | ≥ 5 supplier, semua outlier  | `ceil(master)`                    |

**Master Reference Prices (MVP 90% budget):**

| Kategori       | Keyword | Default Price |
| -------------- | ------- | ------------- |
| Karbohidrat    | beras   | Rp 15.000     |
| Karbohidrat    | kentang | Rp 12.000     |
| Protein Hewani | ayam    | Rp 40.000     |
| Protein Hewani | sapi    | Rp 120.000    |
| Protein Hewani | telur   | Rp 28.000     |
| Protein Hewani | ikan    | Rp 35.000     |
| Protein Nabati | tahu    | Rp 8.000      |
| Protein Nabati | tempe   | Rp 10.000     |
| Susu           | susu    | Rp 18.000     |
| Minyak         | minyak  | Rp 16.000     |
| Sayur          | wortel  | Rp 10.000     |
| Sayur          | bayam   | Rp 8.000      |
| Sayur          | sawi    | Rp 7.000      |
| Fallback       | —       | Rp 20.000     |

---

## Batch Management

### Create Batch

```
POST /api/batches
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "menu": "Nasi Ayam Bakar + Sayur Bayam",
  "nutrition": {
    "calories": 450,
    "protein": 25,
    "fat": 15,
    "carbs": 50
  },
  "allergens": ["gluten"],
  "costPerPortion": 8000,
  "totalCost": 800000,
  "beneficiaryCount": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "batchNumber": "BATCH-20260709-001",
    "reportKey": "A7X9K2M4",
    "menu": "Nasi Ayam Bakar + Sayur Bayam",
    "date": "2026-07-09T00:00:00Z",
    "status": "ACTIVE",
    "qrUrl": "http://localhost:3000/batch/BATCH-20260709-001"
  }
}
```

### List Batches

```
GET /api/batches?date=2026-07-09&status=ACTIVE
Authorization: Bearer <token>
```

### Get Batch Detail

```
GET /api/batches/:id
Authorization: Bearer <token>
```

### Get Batch by Number (Public)

```
GET /api/public/batch/:batchNumber
```

**Response:**

```json
{
  "success": true,
  "data": {
    "batchNumber": "BATCH-20260709-001",
    "date": "2026-07-09",
    "sppg": "SPPG Purwakarta",
    "menu": "Nasi Ayam Bakar + Sayur Bayam",
    "nutrition": {
      "calories": 450,
      "protein": 25,
      "fat": 15,
      "carbs": 50
    },
    "allergens": ["gluten"],
    "costPerPortion": 8000,
    "totalCost": 800000,
    "status": "ACTIVE"
  }
}
```

---

## Complaints

### Submit Complaint

```
POST /api/complaints
Content-Type: application/json
```

**Request Body:**

```json
{
  "reportKey": "A7X9K2M4",
  "description": "Nasi berbau basi",
  "evidence": "https://example.com/evidence.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "reportKey": "A7X9K2M4",
    "description": "Nasi berbau basi",
    "evidence": "https://example.com/evidence.jpg",
    "status": "PENDING",
    "batchId": "clx...",
    "batch": {
      "id": "clx...",
      "batchNumber": "BATCH-20260709-001",
      "menu": "Nasi Ayam Bakar + Sayur Bayam",
      "sppg": {
        "id": "clx...",
        "name": "SPPG Purwakarta"
      }
    },
    "createdAt": "2026-07-09T12:00:00Z"
  }
}
```

### List Complaints (SPPG Admin)

```
GET /api/complaints?sppgId=clx...&status=PENDING&batchId=clx...
Authorization: Bearer <token>
```

**Query Params:**

| Param     | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `sppgId`  | string | No       | Filter by SPPG ID (via batch relation) |
| `batchId` | string | No       | Filter by batch ID                     |
| `status`  | string | No       | PENDING, REVIEWED, RESOLVED            |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "reportKey": "A7X9K2M4",
        "description": "Nasi berbau basi",
        "status": "PENDING",
        "batch": {
          "id": "clx...",
          "batchNumber": "BATCH-20260709-001",
          "sppg": {
            "id": "clx...",
            "name": "SPPG Purwakarta"
          }
        },
        "createdAt": "2026-07-09T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Get Complaint Detail (auto-marks as REVIEWED)

```
GET /api/complaints/:id
Authorization: Bearer <token>
```

**Behavior:** Jika status masih `PENDING`, otomatis diubah ke `REVIEWED` saat SPPG membaca komplain.

### Update Complaint Status

```
PUT /api/complaints/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "RESOLVED",
  "notes": "Sudah ditindaklanjuti, penggantian bahan makanan dilakukan"
}
```

**Status Transitions:**

| Dari     | Ke       | Syarat              |
| -------- | -------- | ------------------- |
| PENDING  | REVIEWED | —                   |
| REVIEWED | RESOLVED | `notes` wajib diisi |
| RESOLVED | —        | Terminal state      |

---

## Reports

### Get Daily Report

```
GET /api/reports/daily?date=2026-07-09
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2026-07-09",
    "sppg": "SPPG Purwakarta",
    "summary": {
      "totalBatches": 5,
      "totalCost": 4000000,
      "totalPortions": 500,
      "avgCostPerPortion": 8000
    },
    "batches": [...],
    "complaints": {
      "total": 2,
      "pending": 1,
      "resolved": 1
    }
  }
}
```

### Get Weekly Report

```
GET /api/reports/weekly?week=2026-W28
Authorization: Bearer <token>
```

### Download Report PDF

```
GET /api/reports/download/:reportId
Authorization: Bearer <token>
```

**Response:** PDF file (binary)

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "npwp",
        "message": "NPWP must be 10-15 digits"
      }
    ]
  }
}
```

### Error Codes

| Code             | HTTP Status | Description              |
| ---------------- | ----------- | ------------------------ |
| VALIDATION_ERROR | 400         | Invalid request body     |
| UNAUTHORIZED     | 401         | Missing or invalid token |
| FORBIDDEN        | 403         | Insufficient permissions |
| NOT_FOUND        | 404         | Resource not found       |
| CONFLICT         | 409         | Duplicate resource       |
| INTERNAL_ERROR   | 500         | Server error             |

---

## Beneficiaries

### List Beneficiaries

```
GET /api/beneficiaries
```

**Query Params:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sppgId` - Filter by SPPG
- `search` - Search by name or institution

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "name": "SDN 01 Purwakarta",
        "institution": "SDN 01 Purwakarta",
        "institutionType": "SEKOLAH",
        "totalBeneficiary": 150,
        "address": "Jl. Sudirman No. 1",
        "contactPhone": "081234567801",
        "contactEmail": "sdn01@email.com",
        "sppgId": "clx...",
        "createdAt": "2026-07-09T00:00:00Z",
        "updatedAt": "2026-07-09T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

### Get Beneficiary by ID

```
GET /api/beneficiaries/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "SDN 01 Purwakarta",
    "institution": "SDN 01 Purwakarta",
    "institutionType": "SEKOLAH",
    "totalBeneficiary": 150,
    "address": "Jl. Sudirman No. 1",
    "contactPhone": "081234567801",
    "contactEmail": "sdn01@email.com",
    "sppgId": "clx...",
    "createdAt": "2026-07-09T00:00:00Z",
    "updatedAt": "2026-07-09T00:00:00Z"
  }
}
```

### Create Beneficiary

```
POST /api/beneficiaries
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "SDN 01 Purwakarta",
  "institution": "SDN 01 Purwakarta",
  "institutionType": "SEKOLAH",
  "totalBeneficiary": 150,
  "address": "Jl. Sudirman No. 1",
  "contactPhone": "081234567801",
  "contactEmail": "sdn01@email.com"
}
```

**Note:** `sppgId` is automatically assigned from the authenticated user's JWT token.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "SDN 01 Purwakarta",
    "institution": "SDN 01 Purwakarta",
    "institutionType": "SEKOLAH",
    "totalBeneficiary": 150,
    "sppgId": "clx...",
    "createdAt": "2026-07-09T00:00:00Z",
    "updatedAt": "2026-07-09T00:00:00Z"
  }
}
```

### Update Beneficiary

```
PUT /api/beneficiaries/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** All fields are optional (partial update)

```json
{
  "name": "SDN 01 Purwakarta (Updated)",
  "totalBeneficiary": 200
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "SDN 01 Purwakarta (Updated)",
    "totalBeneficiary": 200,
    "updatedAt": "2026-07-10T00:00:00Z"
  }
}
```

### Delete Beneficiary

```
DELETE /api/beneficiaries/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": null
}
```

---

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### Role-Based Access

| Endpoint         |  SPPG_ADMIN   |  SUPPLIER   |   PUBLIC    |
| ---------------- | :-----------: | :---------: | :---------: |
| Supplier CRUD    |      ✅       |  ✅ (own)   |     ❌      |
| Beneficiary CRUD | ✅ (own SPPG) |     ❌      |  ✅ (read)  |
| Market Analytics |      ✅       |     ❌      |     ❌      |
| Batch Create     |      ✅       |     ❌      |     ❌      |
| Batch View       |      ✅       | ✅ (orders) | ✅ (public) |
| Complaint Submit |      ❌       |     ❌      |     ✅      |
| Complaint View   |   ✅ (own)    |     ❌      |     ❌      |
| Reports          |   ✅ (own)    |     ❌      |     ❌      |
