import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination Component - Modern & Minimalist
 * 
 * Fitur Redesign:
 * - Smart Truncation (Ellipsis) untuk halaman yang banyak (misal: 1 2 3 ... 10)
 * - Menghilangkan tombol First/Last (<<, >>) karena angka 1 dan terakhir selalu bisa diklik
 * - Desain tombol "Ghost" yang bersih dengan hitbox persegi (h-9 w-9)
 * - Transisi hover yang halus & state disabled yang lebih rapi
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Handle edge cases
  if (totalPages <= 1) return null;

  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Logic untuk menghasilkan array halaman dengan ellipsis (...)
  const getPageNumbers = () => {
    // Jika total halaman sedikit, tampilkan semua
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Jika sedang di awal halaman (1, 2, 3, 4, 5, ..., 10)
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    // Jika sedang di akhir halaman (1, ..., 6, 7, 8, 9, 10)
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // Jika sedang di tengah halaman (1, ..., 4, 5, 6, ..., 10)
    return [
      1,
      '...',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      '...',
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <nav 
      aria-label="Pagination" 
      // 1. Ubah space-x-1 menjadi gap-1 dan tambah flex-wrap sebagai safety net
      className={cn('flex flex-wrap items-center justify-center gap-1 mt-4', className)}
    >
      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        aria-label="Previous page"
        // 2. Buat ukuran responsif: mobile h-8 w-8 text-xs, sm (tablet/desktop) h-9 w-9 text-sm
        className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md text-xs sm:text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 text-gray-600"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex flex-wrap items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                // Sesuaikan juga ukuran ellipsis
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-gray-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isCurrent = page === safeCurrentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                // Sesuaikan juga ukuran tombol angka
                'inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors',
                isCurrent
                  ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        aria-label="Next page"
        // Terapkan ukuran responsif yang sama
        className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md text-xs sm:text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 text-gray-600"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </nav>
  );
}