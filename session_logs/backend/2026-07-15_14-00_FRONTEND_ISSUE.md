# Frontend Issue Report - Button "Selesai" Tidak Berfungsi

**Dari:** Frontend Team
**Tanggal:** 2026-07-15
**Priority:** HIGH

---

## Summary

Button "Selesai" pada halaman Admin Integrasi Supplier (`/admin/suppliers`) tidak berfungsi untuk order dengan status DELIVERED.

---

## Error Message (Backend)

```
Bukti pembayaran wajib diunggah saat menyelesaikan order
```

---

## Penyebab

Backend `order.service.ts` line 385-388 memerlukan `paymentEvidenceUrl` saat transisi ke COMPLETED:

```typescript
// apps/backend/src/modules/order/services/order.service.ts:385-388
if (newStatus === OS.COMPLETED && !dto.paymentEvidenceUrl) {
  throw new BadRequestException(
    "Bukti pembayaran wajib diunggah saat menyelesaikan order",
  );
}
```

---

## Alur Baru (Frontend sudah diubah)

```
SEBELUM:
  "Bayar" = Tandai Dikirim (CONFIRMED → DELIVERED)
  "Selesai" = Tandai Selesai + Upload Bukti Bayar (DELIVERED → COMPLETED)

SETELAH (Frontend):
  "Bayar" = Konfirmasi Pembayaran (CONFIRMED → DELIVERED) → buka halaman /admin/payments/[orderId]
  "Selesai" = Tandai Selesai (DELIVERED → COMPLETED) → TANPA upload bukti
```

---

## Yang Perlu Diubah

### Option 1: Hapus validasi paymentEvidenceUrl (Recommended)

```typescript
// apps/backend/src/modules/order/services/order.service.ts

// HAPUS atau comment baris 385-388:
// if (newStatus === OS.COMPLETED && !dto.paymentEvidenceUrl) {
//   throw new BadRequestException(
//     "Bukti pembayaran wajib diunggah saat menyelesaikan order",
//   );
// }
```

### Option 2: Pindahkan penandaan pembayaran ke DELIVERED

```typescript
if (newStatus === OS.DELIVERED) {
  updateData.actualDeliveryDate = new Date();
  updateData.deliveryEvidence = dto.deliveryEvidence;
  // TAMBAH: Tandai sebagai sudah dibayar saat Bayar
  updateData.paidAt = new Date();
  updateData.paidById = currentUser.id;
}

// COMPLETED tidak perlu lagi paymentEvidenceUrl
if (newStatus === OS.COMPLETED) {
  // Hapus baris yang memerlukan paymentEvidenceUrl
}
```

---

## Frontend Code yang Trigger Error

```typescript
// apps/portal/src/app/admin/suppliers/page.tsx
const handleUpdateStatus = async (orderId: string, newStatus: string) => {
  if (!token) return;
  try {
    const response = await updateOrderStatus(token, orderId, newStatus);
    // ...
  } catch (err) {
    console.error("Failed to update order status:", err);
    // Error dari backend: "Bukti pembayaran wajib diunggah saat menyelesaikan order"
  }
};
```

---

## Testing

Setelah fix, test flow ini:

1. Login sebagai SPPG_ADMIN
2. Buat order → status PENDING
3. Supplier konfirmasi → status CONFIRMED
4. Admin klik "Bayar" → navigasi ke payment page → konfirmasi → status DELIVERED
5. Admin klik "Selesai" → status COMPLETED ✅
6. Cek inventory → InventoryStock harusnya otomatis dibuat

---

## Terima Kasih

Mohon segera di-fix agar demo hackathon bisa berjalan lancar.
