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

```
GET /api/market/prices?item=Beras&region=Purwakarta
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "item": "Beras",
    "region": "Purwakarta",
    "statistics": {
      "min": 10000,
      "max": 15000,
      "median": 12000,
      "mean": 12500,
      "count": 25
    },
    "suppliers": [
      {
        "id": "clx...",
        "name": "UD. Sumber Rejeki",
        "price": 12000,
        "isAnomaly": false
      },
      {
        "id": "clx...",
        "name": "UD. Murah Jaya",
        "price": 15000,
        "isAnomaly": true
      }
    ]
  }
}
```

### Get Price Anomalies

```
GET /api/market/anomalies?region=Purwakarta
Authorization: Bearer <token>
```

### Get HET Suggestion

```
GET /api/market/het-suggestion?item=Beras&region=Purwakarta
Authorization: Bearer <token>
```

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
  "evidence": "base64-or-url"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "PENDING",
    "createdAt": "2026-07-09T12:00:00Z"
  }
}
```

### List Complaints (SPPG only)

```
GET /api/complaints?status=PENDING&batchId=clx...
Authorization: Bearer <token>
```

### Update Complaint Status

```
PUT /api/complaints/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "REVIEWED",
  "notes": "Sudah ditindaklanjuti"
}
```

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
