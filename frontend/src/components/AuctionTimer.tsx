import { useState, useEffect } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface Props {
  closeTime: string;
  forcedCloseTime: string;
  onExpired?: () => void;
}

export function AuctionTimer({ closeTime, forcedCloseTime, onExpired }: Props) {
  const [secsLeft, setSecsLeft] = useState(0);
  const [isForcedClose, setIsForcedClose] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const close = parseISO(closeTime);
      const forced = parseISO(forcedCloseTime);
      const diff = differenceInSeconds(close, now);
      setSecsLeft(Math.max(0, diff));
      setIsForcedClose(now >= forced);
      if (diff <= 0 && onExpired) onExpired();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [closeTime, forcedCloseTime, onExpired]);

  const hours = Math.floor(secsLeft / 3600);
  const mins = Math.floor((secsLeft % 3600) / 60);
  const secs = secsLeft % 60;

  const isWarning = secsLeft > 0 && secsLeft <= 300;
  const isDanger = secsLeft > 0 && secsLeft <= 60;

  return (
    <div className={`rounded-lg p-4 text-center ${
      isForcedClose ? 'bg-red-50 border border-red-200' :
      secsLeft === 0 ? 'bg-gray-100' :
      isDanger ? 'bg-red-50 border border-red-300' :
      isWarning ? 'bg-yellow-50 border border-yellow-300' :
      'bg-blue-50 border border-blue-200'
    }`}>
      <p className="text-xs font-medium text-gray-500 mb-1">
        {isForcedClose ? 'FORCE CLOSE TIME' : secsLeft === 0 ? 'CLOSED' : 'BID CLOSES IN'}
      </p>
      {secsLeft > 0 && !isForcedClose ? (
        <div className={`font-mono text-3xl font-bold tracking-widest ${
          isDanger ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-700'
        }`}>
          {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      ) : (
        <p className="font-semibold text-gray-700">
          {isForcedClose ? 'Auction Force Closed' : 'Auction Closed'}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">
        Forced close: {new Date(forcedCloseTime).toLocaleString()}
      </p>
    </div>
  );
}
