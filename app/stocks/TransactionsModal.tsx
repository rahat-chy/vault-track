"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/app/lib/format";
import { stockTotals } from "@/app/lib/stocks";
import type { Stock } from "@/app/lib/types";
import BuysTab from "./tabs/BuysTab";
import SellsTab from "./tabs/SellsTab";
import DividendsTab from "./tabs/DividendsTab";

type Tab = "buys" | "sells" | "dividends";

interface Props {
  open: boolean;
  stock: Stock | null;
  onClose: () => void;
  onSaved: () => void;
}

const TAB_LABELS: Record<Tab, string> = { buys: "Buys", sells: "Sells", dividends: "Dividends" };

export default function TransactionsModal({ open, stock, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("buys");

  useEffect(() => {
    if (open) setActiveTab("buys");
  }, [open]);

  if (!open || !stock) return null;

  const { invested, sells, dividends, net, heldShares } = stockTotals(stock);
  const tabCounts: Record<Tab, number> = {
    buys: stock.buys.length,
    sells: stock.sells.length,
    dividends: stock.dividends.length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">{stock.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500">
          <span><span className="font-medium text-slate-700">{formatCurrency(invested)}</span> invested</span>
          <span><span className="font-medium text-slate-700">{formatCurrency(sells)}</span> sells</span>
          <span><span className="font-medium text-emerald-600">{formatCurrency(dividends)}</span> dividends</span>
          <span>
            <span className={`font-medium ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net)}
            </span>{" "}net
          </span>
          {heldShares > 0 && (
            <span>
              <span className="font-medium text-indigo-600">
                {heldShares.toLocaleString("en-BD", { maximumFractionDigits: 4 })}
              </span>{" "}held
            </span>
          )}
        </div>

        <div className="flex border-b border-slate-200 px-6">
          {(["buys", "sells", "dividends"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {TAB_LABELS[tab]}
              {tabCounts[tab] > 0 && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "buys" && <BuysTab stock={stock} onSaved={onSaved} />}
          {activeTab === "sells" && <SellsTab stock={stock} onSaved={onSaved} />}
          {activeTab === "dividends" && <DividendsTab stock={stock} onSaved={onSaved} />}
        </div>
      </div>
    </div>
  );
}
