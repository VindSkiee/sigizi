'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBatches, createBatch, updateBatchStatus, getBeneficiaries } from '@/lib/api';
import { BatchManagementHeader } from '@/components/features/batch/BatchManagementHeader';
import { BatchStatsCards } from '@/components/features/batch/BatchStatsCards';
import { BatchSearchBar } from '@/components/features/batch/BatchSearchBar';
import { BatchCardGrid } from '@/components/features/batch/BatchCardGrid';
import { BatchCreateModal } from '@/components/features/batch/BatchCreateModal';
import { BatchQRPrintModal } from '@/components/features/batch/BatchQRPrintModal';
import { FailBatchModal } from '@/components/features/batch/FailBatchModal';
import type { BatchManagement, BeneficiaryOption } from '@/components/features/batch/types';

const COST_PER_PORTION_STANDARD = 10000;

function mapApiBatchToManagement(apiBatch: any): BatchManagement {
  const beneficiaryCount = apiBatch.beneficiaryCount || 0;
  const totalBudget = COST_PER_PORTION_STANDARD * beneficiaryCount;
  const totalCost = apiBatch.totalCost || 0;

  return {
    id: apiBatch.id,
    batchNumber: apiBatch.batchNumber,
    reportKey: apiBatch.reportKey,
    status: apiBatch.status,
    beneficiaryId: '',
    beneficiaryName: apiBatch.menu || '',
    beneficiaryPortions: beneficiaryCount,
    deliveryDate: apiBatch.date || apiBatch.createdAt,
    deliveryTimeStart: '04:00',
    deliveryTimeEnd: '06:30',
    cycle: 'SIKLUS B',
    menus: [],
    beneficiaryCount,
    costPerPortionStandard: COST_PER_PORTION_STANDARD,
    totalBudget,
    totalCost,
    budgetVariance: totalCost - totalBudget,
    failedReason: apiBatch.failedReason,
    failedEvidence: apiBatch.failedEvidence,
    createdAt: apiBatch.createdAt,
  };
}

export default function BatchManagementPage() {
  const { token } = useAuth();
  const [batches, setBatches] = useState<BatchManagement[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrPrintBatch, setQrPrintBatch] = useState<BatchManagement | null>(null);
  const [failModal, setFailModal] = useState<{ open: boolean; batchId: string; batchNumber: string }>({
    open: false,
    batchId: '',
    batchNumber: '',
  });

  const fetchBatches = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getBatches(token);
      if (response.success) {
        const items = (response.data as any)?.items || response.data || [];
        setBatches(Array.isArray(items) ? items.map(mapApiBatchToManagement) : []);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchBeneficiaries = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getBeneficiaries(token, { limit: 100 });
      if (response.success) {
        const items = (response.data as any)?.items || response.data || [];
        setBeneficiaries(
          Array.isArray(items) ? items.map((b: any) => ({
            id: b.id,
            name: b.name || b.institution,
            portions: b.totalBeneficiary || 0,
          })) : []
        );
      }
    } catch (err) {
      console.error('Failed to fetch beneficiaries:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchBatches();
    fetchBeneficiaries();
  }, [fetchBatches, fetchBeneficiaries]);

  const filteredBatches = batches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.batchNumber.toLowerCase().includes(q) ||
      b.beneficiaryName.toLowerCase().includes(q)
    );
  });

  const handleComplete = async (batchId: string) => {
    if (!token) return;
    try {
      await updateBatchStatus(token, batchId, 'COMPLETED');
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: 'COMPLETED' as const } : b))
      );
    } catch (err) {
      console.error('Failed to complete batch:', err);
    }
  };

  const handleCancel = async (batchId: string) => {
    if (!token) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan batch ini?')) return;
    try {
      await updateBatchStatus(token, batchId, 'CANCELLED');
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: 'CANCELLED' as const } : b))
      );
    } catch (err) {
      console.error('Failed to cancel batch:', err);
    }
  };

  const handleFail = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    setFailModal({
      open: true,
      batchId,
      batchNumber: batch?.batchNumber || '',
    });
  };

  const handleFailConfirm = async (batchId: string, reason: string, evidence?: string) => {
    if (!token) return;
    try {
      await updateBatchStatus(token, batchId, 'FAILED', reason, evidence);
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? { ...b, status: 'FAILED' as const, failedReason: reason, failedEvidence: evidence }
            : b
        )
      );
    } catch (err) {
      console.error('Failed to mark batch as failed:', err);
    }
  };

  const handleCreateBatch = async (
    newBatch: Omit<BatchManagement, 'id' | 'batchNumber' | 'createdAt' | 'costPerPortionStandard' | 'totalBudget'>
  ) => {
    if (!token) return;
    try {
      const data = {
        menu: newBatch.menus.map((m) => m.name).join(', '),
        beneficiaryCount: newBatch.beneficiaryPortions,
        costPerPortionStandard: COST_PER_PORTION_STANDARD,
        totalBudget: COST_PER_PORTION_STANDARD * newBatch.beneficiaryPortions,
      };
      const response = await createBatch(token, data, '', '');
      if (response.success) {
        await fetchBatches();
      }
    } catch (err) {
      console.error('Failed to create batch:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <BatchManagementHeader />
        <BatchStatsCards batches={batches} />
        <BatchSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={() => setCreateModalOpen(true)}
        />
        <BatchCardGrid
          batches={filteredBatches}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onFail={handleFail}
          onPrintQR={setQrPrintBatch}
        />
      </div>

      <BatchCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBatch}
        beneficiaries={beneficiaries}
      />

      <BatchQRPrintModal
        isOpen={!!qrPrintBatch}
        batch={qrPrintBatch}
        onClose={() => setQrPrintBatch(null)}
      />

      <FailBatchModal
        isOpen={failModal.open}
        batchId={failModal.batchId}
        batchNumber={failModal.batchNumber}
        onClose={() => setFailModal({ open: false, batchId: '', batchNumber: '' })}
        onConfirm={handleFailConfirm}
      />
    </div>
  );
}
