'use client';

import { Package, ChefHat, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { BatchManagement } from './types';

interface BatchStatsCardsProps {
  batches: BatchManagement[];
}

export function BatchStatsCards({ batches }: BatchStatsCardsProps) {
  const totalBatch = batches.length;
  const aktif = batches.filter((b) => b.status === 'ACTIVE').length;
  const selesai = batches.filter((b) => b.status === 'COMPLETED').length;
  const dibatalkan = batches.filter((b) => b.status === 'CANCELLED').length;
  const gagal = batches.filter((b) => b.status === 'FAILED').length;

  const totalBudget = batches.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
  const totalCost = batches.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  const variance = totalCost - totalBudget;

  const stats = [
    {
      title: 'TOTAL BATCH',
      value: totalBatch,
      icon: <Package className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'AKTIF',
      value: aktif,
      icon: <ChefHat className="w-6 h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'SELESAI',
      value: selesai,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'GAGAL / BATAL',
      value: dibatalkan + gagal,
      icon: gagal > 0 ? <AlertTriangle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
