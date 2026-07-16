# Session Log - Frontend - 2026-07-17 (Part 2)

## Market Page - Region Mode Distance Sorting

### Summary

Menambahkan fitur "Lokasi Terdekat" untuk region mode dan memastikan info jarak muncul di MarketCard.

### Changes Made

#### 1. Distance Calculation Helper

**File:** `apps/portal/src/lib/utils.ts`

**Tambah function `calculateDistance()`:**

- Implementasi Haversine formula untuk hitung jarak antara 2 koordinat GPS
- Return distance dalam kilometers
- Reusable untuk fitur lain yang butuh distance calculation

**Formula:**

```typescript
R = 6371 (Earth's radius in km)
dLat = (lat2 - lat1) * π / 180
dLon = (lon2 - lon1) * π / 180
a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLon/2)
c = 2 * atan2(√a, √(1-a))
distance = R * c
```

#### 2. Enrich Items dengan Calculated Distance

**File:** `apps/portal/src/app/admin/market/page.tsx`

**Tambah `enrichedItems` useMemo:**

- Calculate distance untuk semua items di region mode
- Gunakan koordinat SPPG dari `user?.sppg?.latitude/longitude`
- Gunakan koordinat supplier dari `item.latitude/longitude`
- Jika distance sudah ada (GPS mode), keep as-is
- Jika supplier tidak punya koordinat, skip calculation

**Update `filteredItems` useMemo:**

- Gunakan `enrichedItems` sebagai base (bukan `items`)
- Sorting logic lebih simple karena distance sudah terisi
- Dependency: `enrichedItems` (bukan `items`)

**Update `hasDistanceData` check:**

- True jika ada `item.distance` (GPS mode)
- ATAU jika SPPG punya lokasi DAN ada supplier dengan koordinat (region mode)
- Memastikan opsi "Lokasi Terdekat" muncul di kedua mode

#### 3. MarketCard Distance Display

**File:** `apps/portal/src/components/features/admin/market/MarketCard.tsx`

**Existing logic (no changes needed):**

- MarketCard sudah punya logic untuk menampilkan distance (line 114-121)
- Check `item.distance != null` sebelum display
- Format distance dengan helper `formatDistance()`
- Display: "X.X km dari lokasi Anda"

**Result:**

- Distance sekarang muncul di region mode karena `enrichedItems` sudah terisi
- MarketCard tidak perlu perubahan, tinggal pakai data yang sudah ada

### Technical Decisions

1. **Frontend Distance Calculation:**
   - Backend sudah return koordinat supplier
   - Frontend punya lokasi SPPG
   - Lebih simple hitung di frontend daripada ubah backend API
   - Reusable untuk fitur lain

2. **Enrichment Pattern:**
   - Buat `enrichedItems` terpisah dari `items`
   - Keep original data intact
   - Easy to debug dan maintain
   - Clear separation of concerns

3. **Haversine Formula:**
   - Standard formula untuk distance calculation
   - Akurat untuk jarak < 100km (use case ini)
   - Performance impact minimal (hanya hitung saat render)

### Testing Checklist

- [x] Opsi "Lokasi Terdekat" muncul di region mode
- [x] Opsi "Lokasi Terdekat" muncul di GPS mode (existing)
- [x] Sorting bekerja dengan benar di region mode
- [x] Sorting tetap bekerja di GPS mode
- [x] Distance calculation akurat
- [x] Info jarak muncul di MarketCard (region mode)
- [x] Info jarak muncul di MarketCard (GPS mode)
- [x] Handle kasus supplier tanpa koordinat
- [x] Handle kasus SPPG tanpa lokasi

### Files Modified

1. `apps/portal/src/lib/utils.ts` - Tambah `calculateDistance()` function
2. `apps/portal/src/app/admin/market/page.tsx` - Enrich items, update sorting, update hasDistanceData

### Build Status

- ✅ Frontend TypeScript: No errors
- ✅ Build: Success

### Notes

- MarketCard tidak perlu perubahan karena sudah ada logic untuk display distance
- Distance calculation hanya terjadi saat SPPG punya lokasi
- Supplier tanpa koordinat akan di-sort ke akhir (Infinity distance)
