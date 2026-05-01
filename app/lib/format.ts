const _currency = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' });
const _date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export const formatCurrency = (amount: number) => _currency.format(amount);
export const formatDate = (s: string) => _date.format(new Date(s));
export const toDateInput = (val: string | null | undefined) =>
  val ? new Date(val).toISOString().slice(0, 10) : '';
