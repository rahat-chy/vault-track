const _currency = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' });
const _date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export const formatCurrency = (amount: number) => _currency.format(amount);
export const formatDate = (s: string) => _date.format(new Date(s));
export const toDateInput = (val: string | null | undefined) =>
  val ? new Date(val).toISOString().slice(0, 10) : '';

export const truncate = (s: string, max = 14): string =>
  s.length > max ? s.slice(0, max) + "…" : s;

export const formatCompact = (val: number): string => {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 10_000_000) return `${sign}৳${(abs / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `${sign}৳${(abs / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${sign}৳${(abs / 1_000).toFixed(0)}K`;
  return `${sign}৳${abs}`;
};
