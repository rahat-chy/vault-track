import type { LoanStatus } from './types';

export const LOAN_STATUS_STYLES: Record<LoanStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  DEFAULTED: 'bg-red-100 text-red-700',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  DEFAULTED: 'Defaulted',
};
