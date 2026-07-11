'use client';

import { useState, useMemo } from 'react';
import { BatchManagementHeader } from '@/components/features/batch/BatchManagementHeader';
import { BatchStatsCards } from '@/components/features/batch/BatchStatsCards';
import { BatchSearchBar } from '@/components/features/batch/BatchSearchBar';
import { BatchCardGrid } from '@/components/features/batch/BatchCardGrid';
import { BatchCreateModal } from '@/components/features/batch/BatchCreateModal';
import { BatchQRPrintModal } from '@/components/features/batch/BatchQRPrintModal';
import type {
  BatchManagement,
  BeneficiaryOption,
} from '@/components/features/batch/types';

// ============================================================================
// MOCK DATA (Sementara - akan diganti dengan API)
// ============================================================================

const MOCK_BENEFICIARIES: BeneficiaryOption[] = [
  { id: '1', name: 'SDN 01 Kebon Jeruk', portions: 520 },
  { id: '2', name: 'SDN 02 Palmerah', portions: 310 },
  { id: '3', name: 'SMPN 03 Jakarta', portions: 420 },
  { id: '4', name: 'SDN 04 Grogol', portions: 280 },
  { id: '5', name: 'SDN 05 Tambora', portions: 350 },
];

const MOCK_BATCHES: BatchManagement[] = [
  {
    id: '1',
    batchNumber: '#BTCH-003',
    status: 'ACTIVE',
    beneficiaryId: '3',
    beneficiaryName: 'SMPN 03 Jakarta',
    beneficiaryPortions: 420,
    deliveryDate: new Date().toISOString(),
    deliveryTimeStart: '04:00',
    deliveryTimeEnd: '06:30',
    cycle: 'SIKLUS B',
    menus: [
      { name: 'Nasi Putih', weight: '150g' },
      { name: 'Ayam Teriyaki', weight: '75g' },
      { name: 'Tumis Buncis Wortel', weight: '50g' },
      { name: 'Buah Pisang & Susu UHT', weight: '200ml' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    batchNumber: '#BTCH-002',
    status: 'COMPLETED',
    beneficiaryId: '2',
    beneficiaryName: 'SDN 02 Palmerah',
    beneficiaryPortions: 310,
    deliveryDate: new Date().toISOString(),
    deliveryTimeStart: '03:00',
    deliveryTimeEnd: '05:00',
    cycle: 'SIKLUS B',
    menus: [
      { name: 'Nasi Putih', weight: '100g' },
      { name: 'Ayam Teriyaki Suwir', weight: '50g' },
      { name: 'Tumis Buncis Wortel', weight: '50g' },
      { name: 'Buah Pisang & Susu UHT', weight: '125ml' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    batchNumber: '#BTCH-001',
    status: 'CANCELLED',
    beneficiaryId: '1',
    beneficiaryName: 'SDN 01 Kebon Jeruk',
    beneficiaryPortions: 520,
    deliveryDate: new Date().toISOString(),
    deliveryTimeStart: '02:00',
    deliveryTimeEnd: '04:00',
    cycle: 'SIKLUS B',
    menus: [
      { name: 'Nasi Putih', weight: '100g' },
      { name: 'Telur Dadar Gulung', weight: '1 pcs' },
      { name: 'Sayur Sop Makaroni', weight: '50g' },
      { name: 'Buah Jeruk & Susu UHT', weight: '125ml' },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function BatchManagementPage() {
  // State
  const [batches, setBatches] = useState<BatchManagement[]>(MOCK_BATCHES);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrPrintBatch, setQrPrintBatch] = useState<BatchManagement | null>(null);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;

    const query = searchQuery.toLowerCase();
    return batches.filter(
      (b) =>
        b.batchNumber.toLowerCase().includes(query) ||
        b.beneficiaryName.toLowerCase().includes(query)
    );
  }, [batches, searchQuery]);

  // Handlers
  const handleComplete = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'COMPLETED' as const } : b))
    );
  };

  const handleCancel = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'CANCELLED' as const } : b))
    );
  };

  const handleCreateBatch = (
    newBatch: Omit<BatchManagement, 'id' | 'batchNumber' | 'createdAt'>
  ) => {
    const batchNumber = `#BTCH-${String(batches.length).padStart(3, '0')}`;
    const batch: BatchManagement = {
      ...newBatch,
      id: String(batches.length + 1),
      batchNumber,
      createdAt: new Date().toISOString(),
    };
    setBatches((prev) => [batch, ...prev]);
  };

  const handleDeleteBatch = (batchId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus batch ini?')) {
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <BatchManagementHeader />

        {/* Stats */}
        <BatchStatsCards batches={batches} />

        {/* Search + Create */}
        <BatchSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={() => setCreateModalOpen(true)}
        />

        {/* Batch Cards Grid */}
        <BatchCardGrid
          batches={filteredBatches}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onPrintQR={setQrPrintBatch}
          onDelete={handleDeleteBatch}
        />
      </div>

      {/* Modals */}
      <BatchCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBatch}
        beneficiaries={MOCK_BENEFICIARIES}
      />

      <BatchQRPrintModal
        isOpen={!!qrPrintBatch}
        batch={qrPrintBatch}
        onClose={() => setQrPrintBatch(null)}
      />
    </div>
  );
}
