// ============================================================================
// TYPES FOR PAYMENT COMPONENTS
// ============================================================================

export type InvoiceStatus = "PENDING" | "OVERDUE" | "VERIFYING" | "PAID";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId: string;
  referencePO: string;
  dueDate: string;
  issuedDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  orderItems: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface SupplierBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface InvoiceStats {
  totalUnpaid: number;
  unpaidCount: number;
  nearestDueDate: string;
  nearestDueSupplier: string;
  totalPaidThisMonth: number;
  paidCount: number;
}

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; badgeClass: string; description: string }
> = {
  PENDING: {
    label: "Belum Dibayar",
    badgeClass: "bg-yellow-100 text-yellow-700",
    description: "Tagihan belum dibayar",
  },
  OVERDUE: {
    label: "Jatuh Tempo",
    badgeClass: "bg-red-100 text-red-700",
    description: "Tagihan melewati batas waktu",
  },
  VERIFYING: {
    label: "Menunggu Verifikasi",
    badgeClass: "bg-blue-100 text-blue-700",
    description: "Bukti bayar sedang diverifikasi",
  },
  PAID: {
    label: "Lunas",
    badgeClass: "bg-green-100 text-green-700",
    description: "Pembayaran sudah dikonfirmasi",
  },
};
