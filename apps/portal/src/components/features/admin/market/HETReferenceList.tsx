"use client";

import { HETReference } from "./types";
import { HETReferenceBadge } from "./HETReferenceBadge";

interface HETReferenceListProps {
  references: HETReference[];
  onRemove: (id: string) => void;
}

export function HETReferenceList({
  references,
  onRemove,
}: HETReferenceListProps) {
  if (references.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 w-full overflow-x-hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {references.map((ref) => (
            <HETReferenceBadge
              key={ref.id}
              reference={ref}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
