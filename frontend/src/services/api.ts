import axios from 'axios';
import type {
  AuthUser, CreateRfqForm, RfqSummary, RfqDetail, BidResponse, SubmitBidForm, ActivityLogEntry
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const stored = localStorage.getItem('authUser');
  if (stored) {
    const user: AuthUser = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthUser>('/auth/login', { email, password }).then(r => r.data),
};

export const rfqApi = {
  list: () =>
    api.get<RfqSummary[]>('/rfq').then(r => r.data),

  create: (data: CreateRfqForm) =>
    api.post<RfqDetail>('/rfq', data).then(r => r.data),

  detail: (id: number) =>
    api.get<RfqDetail>(`/rfq/${id}`).then(r => r.data),

  bids: (id: number) =>
    api.get<BidResponse[]>(`/rfq/${id}/bids`).then(r => r.data),

  activityLog: (id: number) =>
    api.get<ActivityLogEntry[]>(`/rfq/${id}/activity-log`).then(r => r.data),

  submitBid: (rfqId: number, data: SubmitBidForm) =>
    api.post<BidResponse>(`/rfq/${rfqId}/bids`, {
      ...data,
      freightCharges: parseFloat(data.freightCharges),
      originCharges: parseFloat(data.originCharges),
      destinationCharges: parseFloat(data.destinationCharges),
      transitTimeDays: parseInt(data.transitTimeDays),
    }).then(r => r.data),
};
