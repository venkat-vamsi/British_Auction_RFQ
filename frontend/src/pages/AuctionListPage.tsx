import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { rfqApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import type { RfqSummary } from '../types';
import { useAuth } from '../context/AuthContext';

function fmt(val: number | null) {
  if (val === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function AuctionListPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RfqSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const load = async () => {
    try {
      const data = await rfqApi.list();
      setRfqs(data);
    } catch {
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'ALL' ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">British Auctions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rfqs.length} auction{rfqs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {user?.role === 'BUYER' && (
          <Link
            to="/rfq/create"
            className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
          >
            + Create RFQ
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'ACTIVE', 'DRAFT', 'CLOSED', 'FORCE_CLOSED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === s ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg">No auctions found</p>
          {user?.role === 'BUYER' && (
            <Link to="/rfq/create" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Create your first RFQ
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Reference', 'RFQ Name', 'Status', 'Lowest Bid', 'L1 Supplier', 'Closes At', 'Forced Close', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map(rfq => (
                <tr key={rfq.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{rfq.referenceId}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{rfq.rfqName}</td>
                  <td className="px-5 py-4"><StatusBadge status={rfq.status} /></td>
                  <td className="px-5 py-4 font-bold text-gray-900">{fmt(rfq.currentLowestBid)}</td>
                  <td className="px-5 py-4 text-gray-600">{rfq.currentLowestBidSupplier ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                    {format(parseISO(rfq.bidCloseTime), 'dd MMM, HH:mm')}
                  </td>
                  <td className="px-5 py-4 text-red-600 whitespace-nowrap text-xs">
                    {format(parseISO(rfq.forcedCloseTime), 'dd MMM, HH:mm')}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/rfq/${rfq.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs whitespace-nowrap"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
