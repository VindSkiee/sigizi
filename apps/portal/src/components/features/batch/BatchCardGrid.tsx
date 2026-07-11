'use client';

import { BatchCard } from './BatchCard';
import type { BatchManagement } from './types';

interface BatchCardGridProps {
  batches: BatchManagement[];
  onComplete: (batchId: string) => void;
  onCancel: (batchId: string) => void;
  onPrintQR: (batch: BatchManagement) => void;
  onDelete: (batchId: string) => void;
}

export function BatchCardGrid({
  batches,
  onComplete,
  onCancel,
  onPrintQR,
  onDelete,
}: BatchCardGridProps) {
  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada batch ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          onComplete={onComplete}
          onCancel={onCancel}
          onPrintQR={onPrintQR}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
