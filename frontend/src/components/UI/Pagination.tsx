import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  total: number;
  limit: number;
}

export default function Pagination({ page, pages, onPageChange, total, limit }: Props) {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>Showing {start}–{end} of {total}</span>
      <div className="flex gap-1">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
          className="btn-icon" style={{ width: 32, height: 32 }}>
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className="rounded-lg text-sm font-medium transition-all"
            style={{
              width: 32, height: 32,
              background: p === page ? 'var(--primary)' : 'var(--surface-2)',
              color: p === page ? '#fff' : 'var(--text-2)',
              border: `1px solid ${p === page ? 'var(--primary)' : 'var(--border)'}`,
            }}>
            {p}
          </button>
        ))}
        <button disabled={page === pages} onClick={() => onPageChange(page + 1)}
          className="btn-icon" style={{ width: 32, height: 32 }}>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
