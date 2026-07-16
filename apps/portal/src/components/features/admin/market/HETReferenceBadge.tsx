"use client";

import { HETReference } from "./types";
import { formatCurrency } from "@/lib/utils";
import { formatHETLocation } from "@/lib/het-reference";
import { X } from "lucide-react";

interface HETReferenceBadgeProps {
  reference: HETReference;
  onRemove: (id: string) => void;
}

export function HETReferenceBadge({
  reference,
  onRemove,
}: HETReferenceBadgeProps) {
  const isClean = reference.dataSource === "clean";
  const borderColor = isClean ? "border-l-emerald-500" : "border-l-blue-500";
  const badgeBg = isClean ? "bg-emerald-100" : "bg-blue-100";
  const badgeText = isClean ? "text-emerald-700" : "text-blue-700";

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${borderColor} w-[280px] flex-shrink-0`}
    >
      {/* Remove button */}
      <button
        onClick={() => onRemove(reference.id)}
        className="absolute top-1 left-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        aria-label="Hapus acuan"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Data source badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeBg} ${badgeText}`}
        >
          {isClean ? "Bersih" : "Mentah"}
        </span>
      </div>

      {/* Content */}
      <div className="pt-8 pb-3 px-4">
        {/* Item and location */}
        <div className="mb-2">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {reference.item}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {formatHETLocation(reference.location)}
          </p>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-gray-500">Max: </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(reference.maxPrice)}
            </span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div>
            <span className="text-gray-500">Rata-rata: </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(reference.medianPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
