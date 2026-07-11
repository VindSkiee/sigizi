import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination Component - Simple Numbered Pagination
 * 
 * Jenis: Numbered Pagination dengan First/Last Page Buttons
 * 
 * Fitur:
 * - First page button (<<)
 * - Previous page button (<)
 * - Page numbers (1, 2, 3, ...)
 * - Next page button (>)
 * - Last page button (>>)
 * - Disabled state untuk first/last jika di boundary
 * - Active state untuk halaman saat ini
 * 
 * Usage:
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Handle edge cases
  if (totalPages <= 1) return null;

  // Ensure currentPage is within bounds
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Generate page numbers to display
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-4', className)}>
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={safeCurrentPage === 1}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          safeCurrentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="First page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          safeCurrentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
              page === safeCurrentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-label={`Page ${page}`}
            aria-current={page === safeCurrentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          safeCurrentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={safeCurrentPage === totalPages}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          safeCurrentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="Last page"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}
