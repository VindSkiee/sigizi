'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getComplaints, updateComplaintStatus } from '@/lib/api';
import {
  ComplaintStatsCards,
  ComplaintFilterTabs,
  ComplaintTable,
  ComplaintDetailModal,
  ComplaintResolveModal,
} from '@/components/features/admin/complaints';
import type {
  ComplaintAdmin,
  ComplaintFilterTab,
  ComplaintStats,
} from '@/components/features/admin/complaints';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';

const ITEMS_PER_PAGE = 10;

export default function ComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ComplaintFilterTab>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintAdmin | null>(null);
  const [resolveComplaint, setResolveComplaint] = useState<ComplaintAdmin | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getComplaints(token, { limit: 100 });
      if (response.success) {
        const data = response.data as any;
        const items = data?.items || data || [];
        setComplaints(Array.isArray(items) ? items : []);
        setTotalCount(data?.pagination?.total || items.length);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const stats: ComplaintStats = {
    pendingCount: complaints.filter((c) => c.status === 'PENDING').length,
    reviewedCount: complaints.filter((c) => c.status === 'REVIEWED').length,
    resolvedCount: complaints.filter((c) => c.status === 'RESOLVED').length,
    totalCount: complaints.length,
  };

  const counts: Record<ComplaintFilterTab, number> = {
    ALL: complaints.length,
    PENDING: stats.pendingCount,
    REVIEWED: stats.reviewedCount,
    RESOLVED: stats.resolvedCount,
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeTab !== 'ALL' && complaint.status !== activeTab) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComplaints = filteredComplaints.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: ComplaintFilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetail = (complaint: ComplaintAdmin) => {
    setSelectedComplaint(complaint);
  };

  const handleMarkReviewed = async (id: string) => {
    if (!token) return;
    try {
      await updateComplaintStatus(token, id, 'REVIEWED');
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: 'REVIEWED' as const } : c
        )
      );
      setSelectedComplaint((prev) =>
        prev && prev.id === id ? { ...prev, status: 'REVIEWED' as const } : prev
      );
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  const handleOpenResolve = (complaint: ComplaintAdmin) => {
    setSelectedComplaint(null);
    setResolveComplaint(complaint);
  };

  const handleResolve = async (id: string, notes: string) => {
    if (!token) throw new Error('Tidak terautentikasi');
    await updateComplaintStatus(token, id, 'RESOLVED', notes);
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'RESOLVED' as const, notes } : c
      )
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-lg mb-6" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-3 flex-1" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-4">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Komplain</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan tangani laporan komplain dari penerima manfaat.
        </p>
      </div>

      {/* Stats Cards */}
      <ComplaintStatsCards stats={stats} />

      {/* Filter Tabs */}
      <ComplaintFilterTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* Table */}
      <ComplaintTable
        complaints={paginatedComplaints}
        onViewDetail={handleViewDetail}
      />

      {/* Pagination */}
      {filteredComplaints.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            Menampilkan {startIndex + 1}-
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredComplaints.length)} dari{' '}
            {filteredComplaints.length} komplain
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onMarkReviewed={handleMarkReviewed}
        onOpenResolve={handleOpenResolve}
      />

      {/* Resolve Modal */}
      <ComplaintResolveModal
        complaint={resolveComplaint}
        onClose={() => setResolveComplaint(null)}
        onResolve={handleResolve}
      />
    </div>
  );
}
