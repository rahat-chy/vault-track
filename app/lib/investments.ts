import type { InvestmentStatus } from './types';

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
};

export const INVESTMENT_STATUS_STYLES: Record<InvestmentStatus, string> = {
  ACTIVE: 'bg-indigo-50 text-indigo-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};
