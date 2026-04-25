import { format, parseISO } from 'date-fns';
import type { ActivityLogEntry, EventType } from '../types';

interface Props {
  entries: ActivityLogEntry[];
}

const eventConfig: Record<EventType, { icon: string; className: string }> = {
  AUCTION_STARTED:    { icon: '🟢', className: 'text-green-700 bg-green-50' },
  BID_SUBMITTED:      { icon: '📥', className: 'text-blue-700 bg-blue-50' },
  TIME_EXTENDED:      { icon: '⏰', className: 'text-yellow-700 bg-yellow-50' },
  AUCTION_CLOSED:     { icon: '🔒', className: 'text-gray-700 bg-gray-50' },
  AUCTION_FORCE_CLOSED:{ icon: '🛑', className: 'text-red-700 bg-red-50' },
};

export function ActivityLogTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="space-y-3">
        {[...entries].reverse().map(entry => {
          const cfg = eventConfig[entry.eventType] ?? { icon: '📋', className: 'text-gray-700 bg-gray-50' };
          return (
            <li key={entry.id} className={`rounded-lg px-4 py-3 ${cfg.className}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{entry.description}</p>
                  {entry.eventType === 'TIME_EXTENDED' && entry.oldCloseTime && entry.newCloseTime && (
                    <p className="text-xs mt-1 opacity-80">
                      {format(parseISO(entry.oldCloseTime), 'HH:mm:ss')}
                      {' → '}
                      {format(parseISO(entry.newCloseTime), 'HH:mm:ss')}
                    </p>
                  )}
                </div>
                <span className="text-xs opacity-60 whitespace-nowrap flex-shrink-0">
                  {format(parseISO(entry.createdAt), 'HH:mm:ss')}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
