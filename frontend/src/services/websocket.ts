import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { AuctionUpdateMessage } from '../types';

let stompClient: Client | null = null;

export function connectWebSocket(
  rfqId: number,
  onMessage: (msg: AuctionUpdateMessage) => void
): () => void {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient?.subscribe(`/topic/auction/${rfqId}`, frame => {
        try {
          const msg: AuctionUpdateMessage = JSON.parse(frame.body);
          onMessage(msg);
        } catch {
          // ignore malformed messages
        }
      });
    },
  });

  stompClient.activate();

  return () => {
    stompClient?.deactivate();
    stompClient = null;
  };
}
