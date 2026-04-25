export type UserRole = 'BUYER' | 'SUPPLIER';
export type AuctionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'FORCE_CLOSED';
export type ExtensionTrigger = 'BID_RECEIVED' | 'ANY_RANK_CHANGE' | 'L1_RANK_CHANGE';
export type EventType =
  | 'AUCTION_STARTED'
  | 'BID_SUBMITTED'
  | 'TIME_EXTENDED'
  | 'AUCTION_CLOSED'
  | 'AUCTION_FORCE_CLOSED';

export interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
}

export interface RfqSummary {
  id: number;
  rfqName: string;
  referenceId: string;
  currentLowestBid: number | null;
  currentLowestBidSupplier: string | null;
  bidCloseTime: string;
  forcedCloseTime: string;
  status: AuctionStatus;
  createdAt: string;
}

export interface BidResponse {
  id: number;
  rfqId: number;
  supplierId: number;
  supplierCompany: string;
  carrierName: string;
  freightCharges: number;
  originCharges: number;
  destinationCharges: number;
  totalCharges: number;
  transitTimeDays: number;
  quoteValidityDate: string;
  submittedAt: string;
  rank: string;
}

export interface ActivityLogEntry {
  id: number;
  eventType: EventType;
  description: string;
  oldCloseTime: string | null;
  newCloseTime: string | null;
  bidId: number | null;
  createdAt: string;
}

export interface RfqDetail {
  id: number;
  rfqName: string;
  referenceId: string;
  createdByName: string;
  createdByCompany: string;
  bidStartTime: string;
  bidCloseTime: string;
  forcedCloseTime: string;
  pickupServiceDate: string;
  status: AuctionStatus;
  createdAt: string;
  triggerWindowMinutes: number;
  extensionDurationMinutes: number;
  extensionTrigger: ExtensionTrigger;
  rankedBids: BidResponse[];
  activityLog: ActivityLogEntry[];
}

export interface AuctionUpdateMessage {
  type: 'BID_SUBMITTED' | 'TIME_EXTENDED' | 'STATUS_CHANGED';
  rfqId: number;
  newStatus: AuctionStatus;
  newCloseTime: string;
  latestBid: BidResponse | null;
  message: string;
}

export interface CreateRfqForm {
  rfqName: string;
  referenceId: string;
  bidStartTime: string;
  bidCloseTime: string;
  forcedCloseTime: string;
  pickupServiceDate: string;
  triggerWindowMinutes: number;
  extensionDurationMinutes: number;
  extensionTrigger: ExtensionTrigger;
}

export interface SubmitBidForm {
  carrierName: string;
  freightCharges: string;
  originCharges: string;
  destinationCharges: string;
  transitTimeDays: string;
  quoteValidityDate: string;
}
