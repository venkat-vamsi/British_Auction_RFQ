import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { rfqApi } from '../services/api';
import { BidTable } from '../components/BidTable';
import { ActivityLogTable } from '../components/ActivityLogTable';
import { AuctionTimer } from '../components/AuctionTimer';
import { StatusBadge } from '../components/StatusBadge';
import { useAuctionWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import type { RfqDetail, AuctionUpdateMessage } from '../types';

const triggerLabels: Record<string, string> = {
  BID_RECEIVED: 'Any bid received',
  ANY_RANK_CHANGE: 'Any rank change',
  L1_RANK_CHANGE: 'L1 rank change',
};

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const rfqId = parseInt(id!);
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bids' | 'log'>('bids');

  const loadDetail = useCallback(async () => {
    try {
      const data = await rfqApi.detail(rfqId);
      setRfq(data);
    } catch {
      toast.error('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  }, [rfqId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleWsMessage = useCallback((msg: AuctionUpdateMessage) => {
    if (msg.type === 'BID_SUBMITTED' || msg.type === 'TIME_EXTENDED') {
      toast.success(msg.message, { icon: msg.type === 'TIME_EXTENDED' ? '⏰' : '📥' });
      loadDetail();
    } else if (msg.type === 'STATUS_CHANGED') {
      toast(msg.message, { icon: '🔔' });
      loadDetail();
    }
  }, [loadDetail]);

  useAuctionWebSocket(rfqId, handleWsMessage);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!rfq) return <div className="text-center py-20 text-gray-500">Auction not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← All Auctions</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{rfq.rfqName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Ref: <span className="font-mono">{rfq.referenceId}</span>
            {' · '} Posted by {rfq.createdByCompany}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={rfq.status} />
          {user?.role === 'SUPPLIER' && rfq.status === 'ACTIVE' && (
            <Link
              to={`/rfq/${rfqId}/bid`}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
            >
              Submit Bid
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timer + Config */}
        <div className="space-y-4">
          <AuctionTimer
            closeTime={rfq.bidCloseTime}
            forcedCloseTime={rfq.forcedCloseTime}
            onExpired={loadDetail}
          />

          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Auction Details</h3>
            <InfoRow label="Bid Start" value={format(parseISO(rfq.bidStartTime), 'dd MMM yyyy, HH:mm')} />
            <InfoRow label="Bid Close" value={format(parseISO(rfq.bidCloseTime), 'dd MMM yyyy, HH:mm')} highlight />
            <InfoRow label="Forced Close" value={format(parseISO(rfq.forcedCloseTime), 'dd MMM yyyy, HH:mm')} danger />
            <InfoRow label="Service Date" value={format(parseISO(rfq.pickupServiceDate), 'dd MMM yyyy')} />
          </div>

          {/* Auction Config Card */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
            <h3 className="font-semibold text-blue-800 text-sm">British Auction Config</h3>
            <InfoRow label="Trigger Window" value={`${rfq.triggerWindowMinutes} min before close`} />
            <InfoRow label="Extension Duration" value={`+${rfq.extensionDurationMinutes} min`} />
            <InfoRow label="Extension Trigger" value={triggerLabels[rfq.extensionTrigger] ?? rfq.extensionTrigger} />
          </div>

          {/* Summary stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Bids" value={rfq.rankedBids.length} />
              <StatCard
                label="Lowest Bid"
                value={rfq.rankedBids.length > 0
                  ? `$${rfq.rankedBids[0].totalCharges.toLocaleString()}`
                  : '—'}
              />
            </div>
          </div>
        </div>

        {/* Right: Bids + Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex border-b border-gray-200">
              <TabButton active={activeTab === 'bids'} onClick={() => setActiveTab('bids')}>
                Ranked Bids ({rfq.rankedBids.length})
              </TabButton>
              <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>
                Activity Log ({rfq.activityLog.length})
              </TabButton>
            </div>
            <div className="p-4">
              {activeTab === 'bids'
                ? <BidTable bids={rfq.rankedBids} />
                : <ActivityLogTable entries={rfq.activityLog} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight, danger }: {
  label: string; value: string; highlight?: boolean; danger?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${danger ? 'text-red-600' : highlight ? 'text-blue-700' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-blue-700 text-blue-700'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
