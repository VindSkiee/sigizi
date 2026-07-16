'use client';

import { BatchCard } from './BatchCard';
import type { BatchManagement } from './types';

interface BatchCardGridProps {
  batches: BatchManagement[];
  onViewDetail: (batch: BatchManagement) => void;
}

export function BatchCardGrid({
  batches,
  onViewDetail,
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
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}
