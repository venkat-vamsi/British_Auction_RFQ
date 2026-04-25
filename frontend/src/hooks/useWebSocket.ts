import { useEffect, useRef } from 'react';
import { connectWebSocket } from '../services/websocket';
import type { AuctionUpdateMessage } from '../types';

export function useAuctionWebSocket(
  rfqId: number,
  onMessage: (msg: AuctionUpdateMessage) => void
) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!rfqId) return;
    const disconnect = connectWebSocket(rfqId, msg => callbackRef.current(msg));
    return disconnect;
  }, [rfqId]);
}
