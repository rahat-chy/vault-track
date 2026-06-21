"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/app/lib/format";
import { stockTotals } from "@/app/lib/stocks";
import type { Stock } from "@/app/lib/types";
import StockModal from "./StockModal";
import StockTable from "./StockTable";
import TransactionsModal from "./TransactionsModal";

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [deletingStock, setDeletingStock] = useState<Stock | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [transactionsStock, setTransactionsStock] = useState<Stock | null>(
    null,
  );

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stocks");
      const data: Stock[] = await res.json();
      setStocks(data);
      setTransactionsStock((prev) =>
        prev ? (data.find((s) => s.id === prev.id) ?? prev) : null,
      );
    } catch {
      // silently leave existing stocks in place on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  function openCreate() {
    setEditingStock(null);
    setModalOpen(true);
  }

  function openEdit(stock: Stock) {
    setEditingStock(stock);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingStock) return;
    setDeleteError("");
    try {
      const res = await fetch(`/api/stocks/${deletingStock.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(
          data.error || "Failed to delete stock. Please try again.",
        );
        return;
      }
      setDeletingStock(null);
      fetchStocks();
    } catch {
      setDeleteError(
        "Network error. Please check your connection and try again.",
      );
    }
  }

  const totals = stocks.reduce(
    (acc, s) => {
      const t = stockTotals(s);
      return {
        investedWithComm: acc.investedWithComm + t.investedWithComm,
        investedWithoutComm: acc.investedWithoutComm + t.investedWithoutComm,
        sells: acc.sells + t.sells,
        dividends: acc.dividends + t.dividends,
        net: acc.net + t.net,
      };
    },
    {
      investedWithComm: 0,
      investedWithoutComm: 0,
      sells: 0,
      dividends: 0,
      net: 0,
    },
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Stocks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your stock positions, sells, and dividends
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Stocks</h2>
            <p className="text-xs text-slate-500 mt-0.5">All stock positions</p>
          </div>

          <div className="flex items-center gap-6">
            {!loading && stocks.length > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(totals.investedWithComm)}
                  </span>{" "}
                  invested(With Commission)
                </span>
                <span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(totals.investedWithoutComm)}
                  </span>{" "}
                  invested(Without Commission)
                </span>
                <span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(totals.sells)}
                  </span>{" "}
                  sells
                </span>
                <span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(totals.dividends)}
                  </span>{" "}
                  dividends
                </span>
                <span>
                  <span
                    className={`font-medium ${totals.net >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {totals.net >= 0 ? "+" : ""}
                    {formatCurrency(totals.net)}
                  </span>{" "}
                  net
                </span>
              </div>
            )}
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Loading…
            </div>
          ) : (
            <StockTable
              stocks={stocks}
              onEdit={openEdit}
              onDelete={setDeletingStock}
              onTransactions={setTransactionsStock}
            />
          )}
        </div>
      </div>

      <StockModal
        open={modalOpen}
        stock={editingStock}
        onClose={() => setModalOpen(false)}
        onSaved={fetchStocks}
      />

      <TransactionsModal
        open={transactionsStock !== null}
        stock={transactionsStock}
        onClose={() => setTransactionsStock(null)}
        onSaved={fetchStocks}
      />

      {deletingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              Delete Stock?
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              This will permanently delete{" "}
              <span className="font-medium">{deletingStock.name}</span>.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              All buys, sells, and dividends will also be deleted.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeletingStock(null);
                  setDeleteError("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
