import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { rfqApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import type { RfqDetail, SubmitBidForm } from '../types';
import { useAuth } from '../context/AuthContext';

export function SubmitBidPage() {
  const { id } = useParams<{ id: string }>();
  const rfqId = parseInt(id!);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<SubmitBidForm>({
    carrierName: '',
    freightCharges: '',
    originCharges: '0',
    destinationCharges: '0',
    transitTimeDays: '',
    quoteValidityDate: '',
  });

  useEffect(() => {
    rfqApi.detail(rfqId).then(setRfq).catch(() => toast.error('Failed to load RFQ')).finally(() => setLoading(false));
  }, [rfqId]);

  const set = (key: keyof SubmitBidForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const totalPreview =
    (parseFloat(form.freightCharges) || 0) +
    (parseFloat(form.originCharges) || 0) +
    (parseFloat(form.destinationCharges) || 0);

  const myCurrentBest = rfq?.rankedBids.find(b => b.supplierId === user?.userId)?.totalCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (myCurrentBest !== undefined && totalPreview >= myCurrentBest) {
      return toast.error(`Your bid total must be below your current best: $${myCurrentBest.toLocaleString()}`);
    }

    setSubmitting(true);
    try {
      await rfqApi.submitBid(rfqId, form);
      toast.success('Bid submitted successfully!');
      navigate(`/rfq/${rfqId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to submit bid';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!rfq) return <div className="text-center py-20 text-gray-500">RFQ not found.</div>;

  if (rfq.status !== 'ACTIVE') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-800">Auction is not active</h2>
        <p className="text-gray-500 mt-2">Current status: <StatusBadge status={rfq.status} /></p>
        <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 hover:underline text-sm">
          ← Back to Auction
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-600 mb-2">
          ← Back to Auction
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Submit Bid</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500 text-sm">{rfq.rfqName}</p>
          <StatusBadge status={rfq.status} />
        </div>
      </div>

      {/* Auction info bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-blue-500 font-medium">Closes At</p>
          <p className="font-semibold text-blue-800">{format(parseISO(rfq.bidCloseTime), 'dd MMM, HH:mm:ss')}</p>
        </div>
        <div>
          <p className="text-xs text-red-400 font-medium">Forced Close</p>
          <p className="font-semibold text-red-700">{format(parseISO(rfq.forcedCloseTime), 'dd MMM, HH:mm:ss')}</p>
        </div>
        {rfq.rankedBids.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium">Current L1 Bid</p>
            <p className="font-bold text-gray-800">${rfq.rankedBids[0].totalCharges.toLocaleString()}</p>
          </div>
        )}
        {myCurrentBest !== undefined && (
          <div>
            <p className="text-xs text-gray-500 font-medium">Your Current Best</p>
            <p className="font-bold text-gray-800">${myCurrentBest.toLocaleString()}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 pb-2 border-b border-gray-100">Quote Details</h2>

        <Field label="Carrier Name *">
          <input
            type="text"
            value={form.carrierName}
            onChange={set('carrierName')}
            required
            placeholder="e.g. DHL Express"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Freight Charges (USD) *">
            <input type="number" min="0.01" step="0.01" value={form.freightCharges} onChange={set('freightCharges')} required placeholder="0.00" className={inputCls} />
          </Field>
          <Field label="Origin Charges (USD)">
            <input type="number" min="0" step="0.01" value={form.originCharges} onChange={set('originCharges')} placeholder="0.00" className={inputCls} />
          </Field>
          <Field label="Destination Charges (USD)">
            <input type="number" min="0" step="0.01" value={form.destinationCharges} onChange={set('destinationCharges')} placeholder="0.00" className={inputCls} />
          </Field>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Quote:</span>
            <span className="font-bold text-xl text-gray-900">
              ${totalPreview.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {myCurrentBest !== undefined && totalPreview > 0 && (
            <p className={`text-xs mt-1 ${totalPreview < myCurrentBest ? 'text-green-600' : 'text-red-500'}`}>
              {totalPreview < myCurrentBest
                ? `✓ $${(myCurrentBest - totalPreview).toLocaleString()} lower than your current best`
                : `✗ Must be below your current best ($${myCurrentBest.toLocaleString()})`
              }
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Transit Time (days) *">
            <input type="number" min="1" value={form.transitTimeDays} onChange={set('transitTimeDays')} required placeholder="e.g. 5" className={inputCls} />
          </Field>
          <Field label="Quote Validity Date *">
            <input
              type="date"
              value={form.quoteValidityDate}
              onChange={set('quoteValidityDate')}
              required
              min={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-700 text-white rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Bid'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
