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

### Validate Price

```
POST /api/market/validate-price
Content-Type: application/json
```

**Request Body:**

```json
{
  "itemName": "Beras Premium",
  "proposedPrice": 18000,
  "province": "Jawa Barat",
  "regency": "Purwakarta",
  "district": "Babakancikao"
}
```

**Field Descriptions:**

| Field           | Type   | Required | Description                      |
| --------------- | ------ | -------- | -------------------------------- |
| `itemName`      | string | Ya       | Nama item untuk pencarian pasar  |
| `proposedPrice` | number | Ya       | Harga yang akan divalidasi       |
| `province`      | string | Tidak    | Filter provinsi (opsional)       |
| `regency`       | string | Tidak    | Filter kabupaten/kota (opsional) |
| `district`      | string | Tidak    | Filter kecamatan (opsional)      |
| `latitude`      | number | Tidak    | GPS latitude (opsional)          |
| `longitude`     | number | Tidak    | GPS longitude (opsional)         |

**Response:**

```json
{
  "success": true,
  "data": {
    "itemName": "Beras Premium",
    "proposedPrice": 18000,
    "validation": {
      "status": "INVALID",
      "reason": "Harga terdeteksi sebagai outlier ekstrem di atas batas wajar pasar lokal",
      "recommendation": "Batas atas pasar: Rp 14.000",
      "marketMedianSnapshot": 12000
    }
  }
}
```

**Validation Logic:**

| Kondisi                 | Status                                 | Keterangan                                   |
| ----------------------- | -------------------------------------- | -------------------------------------------- |
| Cold Start (0 supplier) | INVALID jika > master × 1.2            | Harga melebihi batas atas nasional 20%       |
| Cold Start (0 supplier) | WARNING jika > master × 1.05           | Harga sedikit di atas master                 |
| Mature Market           | INVALID jika > upper IQR               | Outlier ekstrem di atas batas wajar          |
| Mature Market           | WARNING jika < lower IQR               | Harga terlalu rendah, potensi kualitas buruk |
| Mature Market           | WARNING jika deviasi > 15% dari median | Harga membengkak dari median pasar           |

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

All report endpoints require `Role.SPPG_ADMIN`.

### Get Daily Official Report

```
GET /api/reports/daily?date=2026-07-09
Authorization: Bearer <token>
```

### Get Weekly Official Report

```
GET /api/reports/weekly?week=2026-W28
Authorization: Bearer <token>
```

### Get Monthly Official Report

```
GET /api/reports/monthly?month=2026-07
Authorization: Bearer <token>
```

### Get Granular Expense Breakdown

```
GET /api/reports/expenses?source=ALL&startDate=2026-07-01&endDate=2026-07-31
Authorization: Bearer <token>
```

**Query Params:**

| Param       | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `source`    | string | No       | `COGS`, `PROCUREMENT`, `OPEX`, `ALL` (default: `ALL`) |
| `startDate` | string | Ya       | ISO date `YYYY-MM-DD`                                 |
| `endDate`   | string | Ya       | ISO date `YYYY-MM-DD`                                 |

**Response:**

```json
{
  "success": true,
  "data": {
    "source": "ALL",
    "sppgId": "clx...",
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-31T00:00:00.000Z",
    "items": [
      {
        "source": "COGS",
        "date": "2026-07-09T00:00:00.000Z",
        "referenceId": "clx...",
        "title": "Beras Premium",
        "description": "Batch BATCH-20260709-001",
        "amount": 230000,
        "meta": {
          "batchId": "clx...",
          "batchNumber": "BATCH-20260709-001"
        }
      },
      {
        "source": "PROCUREMENT",
        "date": "2026-07-09T00:00:00.000Z",
        "referenceId": "clx...",
        "title": "UD. Sumber Rejeki",
        "description": "Order COMPLETED",
        "amount": 615000,
        "meta": {
          "orderId": "clx...",
          "warningBypassCount": 1,
          "priceValidation": {
            "hasWarningBypass": true,
            "bypassedItems": [
              {
                "itemName": "Beras Premium",
                "quantity": 20,
                "unitPrice": 11500,
                "marketMedianAtPurchase": 12000,
                "justificationNote": "[Price Validation Justification] Stok lokal langka"
              }
            ]
          }
        }
      }
    ],
    "summary": {
      "totalCogs": 4000000,
      "totalProcured": 1850000,
      "totalOpex": 250000,
      "grandTotal": 6100000,
      "warningBypassCount": 2
    }
  }
}
```

### Report Snapshot Download

```
GET /api/reports/:id/download
Authorization: Bearer <token>
```

**Response:** PDF file streamed from local storage

### Operational Expense CRUD

```
GET /api/reports/operational-expenses
POST /api/reports/operational-expenses
GET /api/reports/operational-expenses/:id
PUT /api/reports/operational-expenses/:id
DELETE /api/reports/operational-expenses/:id
```

**Access:** `SPPG_ADMIN` only

**Create / Update Request Body:**

```json
{
  "category": "FUEL",
  "amount": 150000,
  "expenseDate": "2026-07-13",
  "description": "Bensin pengantaran harian",
  "evidenceUrl": "https://storage.local/evidence/expense-1.jpg",
  "notes": "Disetujui bendahara"
}
```

**Category values:** `TRANSPORTATION`, `FUEL`, `VEHICLE_MAINTENANCE`, `ADMINISTRATIVE`, `UTILITIES`, `OTHER`

**Financial taxonomy used by reports:**

| Metric               | Source             | Formula                                      |
| -------------------- | ------------------ | -------------------------------------------- |
| `totalCogs`          | BatchItem          | Sum of `subtotal`                            |
| `totalProcured`      | Order COMPLETED    | Sum of `total`                               |
| `totalOpex`          | OperationalExpense | Sum of `amount`                              |
| `budgetVariance`     | Official report    | `(totalPortions * 10000) - totalCogs`        |
| `warningBypassCount` | OrderItem          | Count of items with `isWarningBypass = true` |

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

## Order Management

### List Orders

```
GET /api/orders
Authorization: Bearer <token>
```

**Query Params:**

| Param        | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `sppgId`     | string | No       | Filter by SPPG ID                                   |
| `supplierId` | string | No       | Filter by Supplier ID                               |
| `status`     | string | No       | PENDING, CONFIRMED, DELIVERED, COMPLETED, CANCELLED |
| `page`       | number | No       | Page number (default: 1)                            |
| `limit`      | number | No       | Items per page (default: 20)                        |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "status": "PENDING",
        "total": 615000,
        "notes": "Pesanan bahan baku minggu ini",
        "sppgId": "clx...",
        "supplierId": "clx...",
        "mouId": "clx...",
        "expectedDeliveryDate": "2026-07-15T00:00:00Z",
        "actualDeliveryDate": null,
        "deliveryEvidence": null,
        "paidAt": null,
        "paymentEvidenceUrl": null,
        "cancelledAt": null,
        "cancelledReason": null,
        "isLate": false,
        "supplier": {
          "id": "clx...",
          "name": "UD. Sumber Rejeki"
        },
        "sppg": {
          "id": "clx...",
          "name": "SPPG Purwakarta"
        },
        "items": [
          {
            "id": "clx...",
            "itemId": "clx...",
            "quantity": 20,
            "unitPrice": 11500,
            "subtotal": 230000,
            "marketMedianAtPurchase": 12000,
            "isWarningBypass": false,
            "justificationNote": "Semua harga valid sesuai data pasar"
          }
        ],
        "createdAt": "2026-07-13T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Note:** Field `isLate` akan bernilai `true` jika order melewati tanggal pengiriman yang diharapkan dan status belum COMPLETED atau CANCELLED.

### Get Order Detail

```
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "CONFIRMED",
    "total": 615000,
    "notes": "Pesanan bahan baku minggu ini",
    "expectedDeliveryDate": "2026-07-15T00:00:00Z",
    "actualDeliveryDate": null,
    "isLate": false,
    "supplier": {
      "id": "clx...",
      "name": "UD. Sumber Rejeki"
    },
    "sppg": {
      "id": "clx...",
      "name": "SPPG Purwakarta"
    },
    "items": [
      {
        "id": "clx...",
        "itemId": "clx...",
        "quantity": 20,
        "unitPrice": 11500,
        "subtotal": 230000,
        "marketMedianAtPurchase": 12000,
        "isWarningBypass": false,
        "justificationNote": "Semua harga valid sesuai data pasar",
        "inventoryStocks": []
      }
    ],
    "statusHistory": [
      {
        "id": "clx...",
        "fromStatus": null,
        "toStatus": "PENDING",
        "notes": "Order berhasil dibuat dan menunggu konfirmasi dari supplier",
        "createdAt": "2026-07-13T00:00:00Z"
      },
      {
        "id": "clx...",
        "fromStatus": "PENDING",
        "toStatus": "CONFIRMED",
        "notes": "Konfirmasi dari supplier",
        "createdAt": "2026-07-13T01:00:00Z"
      }
    ],
    "createdAt": "2026-07-13T00:00:00Z"
  }
}
```

### Create Order

```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** SPPG_ADMIN only

**Request Body:**

```json
{
  "supplierId": "clx...",
  "mouId": "clx...",
  "notes": "Pesanan bahan baku minggu ini",
  "expectedDeliveryDate": "2026-07-15T00:00:00Z",
  "priceJustification": "Stok lokal langka, supplier terdekat hanya ini yang tersedia",
  "items": [
    {
      "itemId": "clx...",
      "quantity": 20
    },
    {
      "itemId": "clx...",
      "quantity": 5
    }
  ]
}
```

**Field Descriptions:**

| Field                  | Type   | Required    | Description                                                           |
| ---------------------- | ------ | ----------- | --------------------------------------------------------------------- |
| `supplierId`           | string | Ya          | ID Supplier                                                           |
| `mouId`                | string | Tidak       | ID MoU (jika ada perjanjian kerjasama)                                |
| `notes`                | string | Tidak       | Catatan order                                                         |
| `expectedDeliveryDate` | string | Tidak       | Tanggal pengiriman yang diharapkan (ISO 8601)                         |
| `priceJustification`   | string | Kondisional | Wajib diisi jika ada item dengan status WARNING dari price validation |
| `items`                | array  | Ya          | Daftar barang yang dipesan                                            |
| `items[].itemId`       | string | Ya          | ID Barang                                                             |
| `items[].quantity`     | number | Ya          | Jumlah yang dipesan                                                   |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "PENDING",
    "total": 615000,
    "expectedDeliveryDate": "2026-07-15T00:00:00Z",
    "items": [
      {
        "id": "clx...",
        "itemId": "clx...",
        "quantity": 20,
        "unitPrice": 11500,
        "subtotal": 230000,
        "marketMedianAtPurchase": 12000,
        "isWarningBypass": false,
        "justificationNote": "Semua harga valid sesuai data pasar"
      }
    ],
    "createdAt": "2026-07-13T00:00:00Z"
  }
}
```

**Price Validation Behavior:**

Saat membuat order, sistem akan secara otomatis memvalidasi harga setiap item terhadap data pasar:

1. **INVALID** → Order ditolak. Sistem mengembalikan error dengan detail item yang tidak valid.
2. **WARNING** → Order dapat dilanjutkan, tetapi admin wajib mengisi `priceJustification`.
3. **VALID** → Order dapat dilanjutkan tanpa justifikasi.

**Snapshot Fields per OrderItem:**

| Field                    | Type    | Description                                                    |
| ------------------------ | ------- | -------------------------------------------------------------- |
| `marketMedianAtPurchase` | number  | Median pasar saat order dibuat (null jika tidak tersedia)      |
| `isWarningBypass`        | boolean | true jika item melewati validasi WARNING dengan justifikasi    |
| `justificationNote`      | string  | Catatan justifikasi atau "Semua harga valid sesuai data pasar" |

Audit trail justifikasi disimpan di `OrderStatusHistory.notes`.

### Update Order Status

```
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** SPPG_ADMIN atau SUPPLIER (tergantung transisi)

**Request Body:**

```json
{
  "status": "CONFIRMED",
  "reason": null,
  "deliveryEvidence": null,
  "paymentEvidenceUrl": null,
  "notes": "Konfirmasi pesanan"
}
```

**Field Descriptions:**

| Field                | Type   | Required    | Description                                         |
| -------------------- | ------ | ----------- | --------------------------------------------------- |
| `status`             | string | Ya          | Status baru (lihat tabel transisi)                  |
| `reason`             | string | Kondisional | Wajib diisi jika status = CANCELLED                 |
| `deliveryEvidence`   | string | Kondisional | URL bukti pengiriman (untuk status DELIVERED)       |
| `paymentEvidenceUrl` | string | Kondisional | URL bukti pembayaran (wajib untuk status COMPLETED) |
| `notes`              | string | Tidak       | Catatan tambahan                                    |

**Status Transitions:**

| Dari      | Ke        | Oleh                 | Syarat                           |
| --------- | --------- | -------------------- | -------------------------------- |
| PENDING   | CONFIRMED | SUPPLIER             | -                                |
| PENDING   | CANCELLED | SPPG_ADMIN, SUPPLIER | `reason` wajib diisi             |
| CONFIRMED | DELIVERED | SUPPLIER             | -                                |
| CONFIRMED | CANCELLED | SPPG_ADMIN, SUPPLIER | `reason` wajib diisi             |
| DELIVERED | COMPLETED | SPPG_ADMIN           | `paymentEvidenceUrl` wajib diisi |
| DELIVERED | CANCELLED | SPPG_ADMIN           | `reason` wajib diisi             |

**Response (COMPLETED):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "COMPLETED",
    "paidAt": "2026-07-15T10:00:00Z",
    "paymentEvidenceUrl": "https://example.com/bukti-bayar.jpg",
    "updatedAt": "2026-07-15T10:00:00Z"
  }
}
```

**Response (CANCELLED):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "CANCELLED",
    "cancelledAt": "2026-07-14T08:00:00Z",
    "cancelledReason": "Supplier tidak dapat memenuhi pesanan tepat waktu",
    "updatedAt": "2026-07-14T08:00:00Z"
  }
}
```

**Error Responses:**

```json
// Transisi tidak diperbolehkan
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Transisi status dari \"PENDING\" ke \"COMPLETED\" tidak diperbolehkan"
  }
}

// Role tidak memiliki akses
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Anda tidak memiliki hak akses untuk mengubah status dari \"PENDING\" ke \"CONFIRMED\""
  }
}

// Stok sudah terpakai (membatalkan order COMPLETED)
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Tidak dapat membatalkan order karena stok barang dengan ID clx... sudah terpakai (tersisa 15 dari 20 unit). Silakan hubungi administrator untuk proses retur secara manual."
  }
}
```

---

## Inventory Stock (Event-Driven)

Inventory Stock dikelola secara otomatis melalui event-driven:

### Order COMPLETED → InventoryStock Dibuat

Ketika order berubah status menjadi `COMPLETED`, sistem akan otomatis membuat `InventoryStock` untuk setiap item dalam order.

**Trigger:** Event `order.completed`

**Behavior:**

- Membuat 1 `InventoryStock` record untuk setiap `OrderItem`
- `purchasePrice` diambil dari `OrderItem.unitPrice` (harga beku)
- `initialQty` dan `remainingQty` diatur sesuai jumlah yang dipesan

### Order CANCELLED → InventoryStock Dikembalikan

Ketika order yang statusnya `COMPLETED` dibatalkan menjadi `CANCELLED`, sistem akan menghapus `InventoryStock` yang terkait.

**Trigger:** Event `order.cancelled`

**Behavior:**

- Hanya diproses jika status sebelumnya adalah `COMPLETED`
- Mengecek apakah stok masih utuh (`remainingQty == initialQty`)
- Jika stok sudah terpakai, pembatalan akan dicegah oleh validasi di OrderService

---

## Inventory Management

### Create Manual Stock

```
POST /api/inventory/manual
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** SPPG_ADMIN only

**Request Body:**

```json
{
  "itemId": "clx...",
  "quantity": 100,
  "purchasePrice": 12000,
  "expiredAt": "2026-08-15T00:00:00Z",
  "notes": "Stok awal dari supplier"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "sppgId": "clx...",
    "itemId": "clx...",
    "source": "MANUAL_ADJUSTMENT",
    "purchasePrice": 12000,
    "initialQty": 100,
    "remainingQty": 100,
    "expiredAt": "2026-08-15T00:00:00Z",
    "notes": "Stok awal dari supplier",
    "item": {
      "name": "Beras Premium",
      "unit": "kg"
    },
    "createdBy": {
      "name": "Admin SPPG"
    },
    "createdAt": "2026-07-13T00:00:00Z"
  }
}
```

### Adjust Stock Lot

```
PATCH /api/inventory/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** SPPG_ADMIN only

**Request Body:**

```json
{
  "adjustmentQty": -5,
  "reason": "SPOILAGE",
  "description": "Beras rusak akibat kelembaban tinggi"
}
```

**Field Descriptions:**

| Field           | Type   | Required | Description                                             |
| --------------- | ------ | -------- | ------------------------------------------------------- |
| `adjustmentQty` | number | Ya       | Negatif untuk pengurangan, positif untuk penambahan     |
| `reason`        | string | Ya       | Alasan: SPOILAGE, THEFT, DISCREPANCY, CORRECTION, OTHER |
| `description`   | string | Tidak    | Deskripsi detail                                        |

**Response:**

```json
{
  "success": true,
  "data": {
    "stock": {
      "id": "clx...",
      "remainingQty": 95,
      "updatedAt": "2026-07-13T00:00:00Z"
    },
    "adjustment": {
      "id": "clx...",
      "adjustmentQty": -5,
      "reason": "SPOILAGE",
      "description": "Beras rusak akibat kelembaban tinggi",
      "createdAt": "2026-07-13T00:00:00Z"
    }
  }
}
```

### List Inventory Stocks

```
GET /api/inventory
Authorization: Bearer <token>
```

**Access:** SPPG_ADMIN only

**Query Params:**

| Param          | Type   | Required | Description                                   |
| -------------- | ------ | -------- | --------------------------------------------- |
| `itemId`       | string | Tidak    | Filter berdasarkan ID item                    |
| `source`       | string | Tidak    | SYSTEM_ORDER, MANUAL_ADJUSTMENT, BATCH_RETURN |
| `minRemaining` | number | Tidak    | Minimum remainingQty (default: 0)             |
| `page`         | number | Tidak    | Page number (default: 1)                      |
| `limit`        | number | Tidak    | Items per page (default: 20)                  |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "sppgId": "clx...",
        "itemId": "clx...",
        "source": "SYSTEM_ORDER",
        "purchasePrice": 11500,
        "initialQty": 20,
        "remainingQty": 15,
        "expiredAt": null,
        "notes": "Stok dari order ORDER-20260713-001",
        "item": {
          "id": "clx...",
          "name": "Beras Premium",
          "unit": "kg"
        },
        "createdBy": {
          "id": "clx...",
          "name": "Admin SPPG"
        },
        "adjustments": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### Get Stock Balance

```
GET /api/inventory/balance
Authorization: Bearer <token>
```

**Access:** SPPG_ADMIN only

**Query Params:**

| Param    | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| `itemId` | string | Tidak    | Filter berdasarkan ID item |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "item": {
        "id": "clx...",
        "name": "Beras Premium",
        "unit": "kg",
        "minThreshold": 50
      },
      "totalRemaining": 150,
      "totalInitial": 200,
      "lotCount": 3
    }
  ]
}
```

### Get Stock Valuation

```
GET /api/inventory/valuation
Authorization: Bearer <token>
```

**Access:** SPPG_ADMIN only

**Response:**

```json
{
  "success": true,
  "data": {
    "totalValue": 1725000,
    "items": [
      {
        "itemId": "clx...",
        "itemName": "Beras Premium",
        "unit": "kg",
        "totalQty": 150,
        "totalValue": 1725000
      }
    ]
  }
}
```

### Get Low Stock Alerts

```
GET /api/inventory/alerts
Authorization: Bearer <token>
```

**Access:** SPPG_ADMIN only

**Query Params:**

| Param              | Type   | Required | Description                                                   |
| ------------------ | ------ | -------- | ------------------------------------------------------------- |
| `defaultThreshold` | number | Tidak    | Ambang batas global jika item.minThreshold null (default: 10) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "item": {
        "id": "clx...",
        "name": "Telur Ayam",
        "unit": "pcs",
        "minThreshold": 50
      },
      "totalRemaining": 30,
      "totalInitial": 100,
      "lotCount": 2,
      "threshold": 50,
      "isLow": true
    }
  ]
}
```

### Get Stock Adjustment History

```
GET /api/inventory/:id/history
Authorization: Bearer <token>
```

**Access:** SPPG_ADMIN only

**Response:**

```json
{
  "success": true,
  "data": {
    "stock": {
      "id": "clx...",
      "itemId": "clx...",
      "initialQty": 100,
      "remainingQty": 95,
      "item": {
        "name": "Beras Premium",
        "unit": "kg"
      }
    },
    "adjustments": [
      {
        "id": "clx...",
        "adjustmentQty": -5,
        "reason": "SPOILAGE",
        "description": "Beras rusak akibat kelembaban tinggi",
        "changedBy": {
          "id": "clx...",
          "name": "Admin SPPG",
          "email": "admin@sppg.go.id"
        },
        "createdAt": "2026-07-13T00:00:00Z"
      }
    ]
  }
}
```

### Stock Sources

| Source              | Description                  | Trigger                    |
| ------------------- | ---------------------------- | -------------------------- |
| `SYSTEM_ORDER`      | Stok dari order yang selesai | Order COMPLETED            |
| `MANUAL_ADJUSTMENT` | Input stok manual            | POST /api/inventory/manual |
| `BATCH_RETURN`      | Stok dikembalikan dari batch | Batch CANCELLED/FAILED     |

---

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### Role-Based Access

| Endpoint          |  SPPG_ADMIN   |  SUPPLIER   |   PUBLIC    |
| ----------------- | :-----------: | :---------: | :---------: |
| Supplier CRUD     |      ✅       |  ✅ (own)   |     ❌      |
| Beneficiary CRUD  | ✅ (own SPPG) |     ❌      |  ✅ (read)  |
| Market Analytics  |      ✅       |     ❌      |     ❌      |
| Batch Create      |      ✅       |     ❌      |     ❌      |
| Batch View        |      ✅       | ✅ (orders) | ✅ (public) |
| Complaint Submit  |      ❌       |     ❌      |     ✅      |
| Complaint View    |   ✅ (own)    |     ❌      |     ❌      |
| Reports           |   ✅ (own)    |     ❌      |     ❌      |
| OpEx Reports      |   ✅ (own)    |     ❌      |     ❌      |
| Order Create      |      ✅       |     ❌      |     ❌      |
| Order View        |   ✅ (own)    |  ✅ (own)   |     ❌      |
| Order Confirm     |      ❌       |  ✅ (own)   |     ❌      |
| Order Deliver     |      ❌       |  ✅ (own)   |     ❌      |
| Order Complete    |      ✅       |     ❌      |     ❌      |
| Order Cancel      |      ✅       |  ✅ (own)   |     ❌      |
| Inventory Create  |      ✅       |     ❌      |     ❌      |
| Inventory Adjust  |      ✅       |     ❌      |     ❌      |
| Inventory View    |      ✅       |     ❌      |     ❌      |
| Inventory Balance |      ✅       |     ❌      |     ❌      |
| Inventory Alerts  |      ✅       |     ❌      |     ❌      |
