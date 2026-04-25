import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { rfqApi } from '../services/api';
import type { CreateRfqForm, ExtensionTrigger } from '../types';

const TRIGGER_OPTIONS: { value: ExtensionTrigger; label: string; desc: string }[] = [
  {
    value: 'BID_RECEIVED',
    label: 'Any Bid Received',
    desc: 'Extend whenever any supplier submits a bid in the trigger window',
  },
  {
    value: 'ANY_RANK_CHANGE',
    label: 'Any Rank Change',
    desc: 'Extend when any supplier\'s ranking position changes',
  },
  {
    value: 'L1_RANK_CHANGE',
    label: 'L1 Rank Change',
    desc: 'Extend only when the lowest bidder (L1) changes',
  },
];

function now(offset = 0) {
  const d = new Date(Date.now() + offset * 60000);
  return d.toISOString().slice(0, 16);
}

export function CreateRfqPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateRfqForm>({
    rfqName: '',
    referenceId: `RFQ-${Date.now()}`,
    bidStartTime: now(5),
    bidCloseTime: now(65),
    forcedCloseTime: now(90),
    pickupServiceDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    triggerWindowMinutes: 10,
    extensionDurationMinutes: 5,
    extensionTrigger: 'BID_RECEIVED',
  });

  const set = (key: keyof CreateRfqForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(form.bidCloseTime) <= new Date(form.bidStartTime)) {
      return toast.error('Bid close time must be after start time');
    }
    if (new Date(form.forcedCloseTime) <= new Date(form.bidCloseTime)) {
      return toast.error('Forced close time must be after bid close time');
    }

    setLoading(true);
    try {
      const rfq = await rfqApi.create({
        ...form,
        triggerWindowMinutes: parseInt(String(form.triggerWindowMinutes)),
        extensionDurationMinutes: parseInt(String(form.extensionDurationMinutes)),
      });
      toast.success('RFQ created successfully!');
      navigate(`/rfq/${rfq.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? Object.values(err.response?.data ?? {}).join(', ') ?? 'Failed to create RFQ';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-600 mb-2">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create RFQ</h1>
        <p className="text-gray-500 text-sm">Configure a British Auction for your freight request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="RFQ Information">
          <FormRow label="RFQ Name *">
            <input
              type="text"
              value={form.rfqName}
              onChange={set('rfqName')}
              required
              placeholder="e.g. London to Manchester Freight Q2"
              className={inputCls}
            />
          </FormRow>
          <FormRow label="Reference ID *">
            <input
              type="text"
              value={form.referenceId}
              onChange={set('referenceId')}
              required
              placeholder="e.g. RFQ-2024-001"
              className={inputCls}
            />
          </FormRow>
          <FormRow label="Pickup / Service Date *">
            <input
              type="date"
              value={form.pickupServiceDate}
              onChange={set('pickupServiceDate')}
              required
              min={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </FormRow>
        </Section>

        {/* Auction Timing */}
        <Section title="Auction Timing">
          <FormRow label="Bid Start Date & Time *">
            <input type="datetime-local" value={form.bidStartTime} onChange={set('bidStartTime')} required className={inputCls} />
          </FormRow>
          <FormRow label="Bid Close Date & Time *" help="Auction will try to close at this time (may extend)">
            <input type="datetime-local" value={form.bidCloseTime} onChange={set('bidCloseTime')} required className={inputCls} />
          </FormRow>
          <FormRow label="Forced Close Date & Time *" help="Hard deadline — auction NEVER extends beyond this">
            <input type="datetime-local" value={form.forcedCloseTime} onChange={set('forcedCloseTime')} required className={inputCls} />
          </FormRow>
        </Section>

        {/* British Auction Config */}
        <Section title="British Auction Configuration">
          <FormRow label="Trigger Window (X minutes)" help="Monitor bidding activity this many minutes before close">
            <input
              type="number"
              min={1}
              max={60}
              value={form.triggerWindowMinutes}
              onChange={set('triggerWindowMinutes')}
              required
              className={inputCls}
            />
          </FormRow>
          <FormRow label="Extension Duration (Y minutes)" help="Add this many minutes when trigger condition fires">
            <input
              type="number"
              min={1}
              max={60}
              value={form.extensionDurationMinutes}
              onChange={set('extensionDurationMinutes')}
              required
              className={inputCls}
            />
          </FormRow>
          <FormRow label="Extension Trigger">
            <div className="space-y-2">
              {TRIGGER_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.extensionTrigger === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="extensionTrigger"
                    value={opt.value}
                    checked={form.extensionTrigger === opt.value}
                    onChange={set('extensionTrigger')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </FormRow>
        </Section>

        {/* Preview */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚙ Auction Logic Preview</p>
          <p>
            The system will monitor bidding in the last <strong>{form.triggerWindowMinutes} minutes</strong> before
            close. If triggered ({TRIGGER_OPTIONS.find(t => t.value === form.extensionTrigger)?.label.toLowerCase()}),
            the auction extends by <strong>{form.extensionDurationMinutes} minutes</strong>, but never beyond the
            forced close time.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 text-white rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating...' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormRow({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {help && <p className="text-xs text-gray-400 mb-1">{help}</p>}
      {children}
    </div>
  );
}
