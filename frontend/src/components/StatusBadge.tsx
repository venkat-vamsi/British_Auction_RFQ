import type { AuctionStatus } from '../types';

const config: Record<AuctionStatus, { label: string; className: string }> = {
  DRAFT:       { label: 'Draft',       className: 'bg-gray-100 text-gray-700' },
  ACTIVE:      { label: 'Active',      className: 'bg-green-100 text-green-800' },
  CLOSED:      { label: 'Closed',      className: 'bg-blue-100 text-blue-800' },
  FORCE_CLOSED:{ label: 'Force Closed',className: 'bg-red-100 text-red-800' },
};

export function StatusBadge({ status }: { status: AuctionStatus }) {
  const { label, className } = config[status] ?? config.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {status === 'ACTIVE' && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      )}
      {label}
    </span>
  );
}
