import { format, parseISO } from 'date-fns';
import type { BidResponse } from '../types';

interface Props {
  bids: BidResponse[];
}

const rankColors: Record<string, string> = {
  L1: 'bg-gold-100 text-yellow-800 font-bold ring-1 ring-yellow-400',
  L2: 'bg-gray-100 text-gray-700',
  L3: 'bg-orange-50 text-orange-700',
};

function RankBadge({ rank }: { rank: string }) {
  const cls = rankColors[rank] ?? 'bg-gray-50 text-gray-500';
  const medal = rank === 'L1' ? '🥇' : rank === 'L2' ? '🥈' : rank === 'L3' ? '🥉' : '';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cls}`}>
      {medal} {rank}
    </span>
  );
}

function fmt(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function BidTable({ bids }: Props) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📭</p>
        <p>No bids submitted yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Rank','Supplier','Carrier','Freight','Origin','Destination','Total','Transit','Validity','Submitted At'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {bids.map((bid, i) => (
            <tr key={bid.id} className={i === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
              <td className="px-4 py-3">
                <RankBadge rank={bid.rank} />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{bid.supplierCompany}</td>
              <td className="px-4 py-3 text-gray-600">{bid.carrierName}</td>
              <td className="px-4 py-3 text-gray-700">{fmt(bid.freightCharges)}</td>
              <td className="px-4 py-3 text-gray-700">{fmt(bid.originCharges)}</td>
              <td className="px-4 py-3 text-gray-700">{fmt(bid.destinationCharges)}</td>
              <td className="px-4 py-3 font-bold text-gray-900">{fmt(bid.totalCharges)}</td>
              <td className="px-4 py-3 text-gray-600">{bid.transitTimeDays}d</td>
              <td className="px-4 py-3 text-gray-600">
                {format(parseISO(bid.quoteValidityDate), 'dd MMM yyyy')}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {format(parseISO(bid.submittedAt), 'dd MMM, HH:mm:ss')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
