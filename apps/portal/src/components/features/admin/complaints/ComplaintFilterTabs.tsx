'use client';

import type { ComplaintFilterTab } from './types';

interface ComplaintFilterTabsProps {
  activeTab: ComplaintFilterTab;
  onTabChange: (tab: ComplaintFilterTab) => void;
  counts: Record<ComplaintFilterTab, number>;
}

const TABS: { key: ComplaintFilterTab; label: string }[] = [
  { key: 'ALL', label: 'Semua' },
  { key: 'PENDING', label: 'Perlu Ditinjau' },
  { key: 'REVIEWED', label: 'Ditinjau' },
  { key: 'RESOLVED', label: 'Selesai' },
];

export function ComplaintFilterTabs({
  activeTab,
  onTabChange,
  counts,
}: ComplaintFilterTabsProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[tab.key]})</span>
        </button>
      ))}
    </div>
  );
}
