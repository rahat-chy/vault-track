"use client";

import { STOCK_STATUS_LABELS, STOCK_STATUS_STYLES, stockTotals } from "@/app/lib/stocks";
import { formatCurrency } from "@/app/lib/format";
import type { Stock, StockStatus } from "@/app/lib/types";

function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STOCK_STATUS_STYLES[status]}`}
    >
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}

interface Props {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
  onTransactions: (stock: Stock) => void;
}

export default function StockTable({ stocks, onEdit, onDelete, onTransactions }: Props) {
  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No stocks yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Name</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Status</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Holdings</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Invested</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Sells</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Dividends</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Net</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stocks.map((stock) => {
            const { invested, sells, dividends, net, heldShares } = stockTotals(stock);
            return (
              <tr key={stock.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-slate-800">{stock.name}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={stock.status} />
                </td>
                <td className="py-3 pr-4 text-right text-slate-700 tabular-nums">
                  {heldShares > 0 ? heldShares.toLocaleString("en-BD", { maximumFractionDigits: 4 }) : "—"}
                </td>
                <td className="py-3 pr-4 text-right text-slate-700 tabular-nums">
                  {invested > 0 ? formatCurrency(invested) : "—"}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600 tabular-nums">
                  {sells > 0 ? formatCurrency(sells) : "—"}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600 tabular-nums">
                  {dividends > 0 ? formatCurrency(dividends) : "—"}
                </td>
                <td className={`py-3 pr-4 text-right tabular-nums font-medium ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {invested > 0 || sells > 0 || dividends > 0
                    ? `${net >= 0 ? "+" : ""}${formatCurrency(net)}`
                    : "—"}
                </td>
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onTransactions(stock)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Transactions"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(stock)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(stock)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
