import type { Stock, StockStatus } from './types';

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
};

export const STOCK_STATUS_STYLES: Record<StockStatus, string> = {
  ACTIVE: 'bg-indigo-50 text-indigo-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

export function stockTotals(stock: Stock) {
  const invested = stock.buys.reduce(
    (acc, b) => acc + Number(b.unitPrice) * Number(b.numberOfStocks) + Number(b.commission),
    0,
  );
  const sells = stock.sells.reduce(
    (acc, s) => acc + Number(s.unitPrice) * Number(s.numberOfStocks),
    0,
  );
  const dividends = stock.dividends.reduce((acc, d) => acc + Number(d.dividendAmount), 0);
  const purification = stock.dividends.reduce((acc, d) => acc + Number(d.purificationAmount), 0);
  const net = sells + dividends - invested - purification;
  const totalBoughtShares = stock.buys.reduce((acc, b) => acc + Number(b.numberOfStocks), 0);
  const totalSoldShares = stock.sells.reduce((acc, s) => acc + Number(s.numberOfStocks), 0);
  const heldShares = totalBoughtShares - totalSoldShares;
  return { invested, sells, dividends, purification, net, heldShares, totalBoughtShares, totalSoldShares };
}
