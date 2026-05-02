"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/app/lib/format";
import type { OneTimeInvestment } from "@/app/lib/types";
import InvestmentModal from "./InvestmentModal";
import InvestmentTable from "./InvestmentTable";
import ReturnsModal from "./ReturnsModal";

export default function OneTimeInvestmentsPage() {
  const [investments, setInvestments] = useState<OneTimeInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<OneTimeInvestment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<OneTimeInvestment | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [returnsInvestment, setReturnsInvestment] = useState<OneTimeInvestment | null>(null);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/one-time-investments");
      const data: OneTimeInvestment[] = await res.json();
      setInvestments(data);
      setReturnsInvestment((prev) =>
        prev ? (data.find((i) => i.id === prev.id) ?? prev) : null,
      );
    } catch {
      // silently leave existing investments in place on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  function openCreate() {
    setEditingInvestment(null);
    setModalOpen(true);
  }

  function openEdit(inv: OneTimeInvestment) {
    setEditingInvestment(inv);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingInvestment) return;
    setDeleteError("");
    try {
      const res = await fetch(`/api/one-time-investments/${deletingInvestment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete investment. Please try again.");
        return;
      }
      setDeletingInvestment(null);
      fetchInvestments();
    } catch {
      setDeleteError("Network error. Please check your connection and try again.");
    }
  }

  const totalInvested = investments.reduce((s, i) => s + Number(i.investedAmount), 0);
  const totalDiscount = investments.reduce((s, i) => s + Number(i.discountAmount ?? 0), 0);
  const totalReturned = investments.reduce((s, i) => s + Number(i.returnAmount), 0);
  const totalNet = totalReturned - (totalInvested - totalDiscount);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">One Time Investments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your one-time investment positions and returns
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Investments</h2>
            <p className="text-xs text-slate-500 mt-0.5">All one-time investment positions</p>
          </div>

          <div className="flex items-center gap-6">
            {!loading && investments.length > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span>
                  <span className="font-medium text-slate-700">{formatCurrency(totalInvested)}</span>{" "}
                  invested
                </span>
                {totalDiscount > 0 && (
                  <span>
                    <span className="font-medium text-slate-700">{formatCurrency(totalDiscount)}</span>{" "}
                    discount
                  </span>
                )}
                <span>
                  <span className="font-medium text-emerald-600">{formatCurrency(totalReturned)}</span>{" "}
                  returned
                </span>
                <span>
                  <span className={`font-medium ${totalNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {totalNet >= 0 ? "+" : ""}{formatCurrency(totalNet)}
                  </span>{" "}
                  net
                </span>
              </div>
            )}
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Loading…</div>
          ) : (
            <InvestmentTable
              investments={investments}
              onEdit={openEdit}
              onDelete={setDeletingInvestment}
              onReturns={setReturnsInvestment}
            />
          )}
        </div>
      </div>

      <InvestmentModal
        open={modalOpen}
        investment={editingInvestment}
        onClose={() => setModalOpen(false)}
        onSaved={fetchInvestments}
      />

      <ReturnsModal
        open={returnsInvestment !== null}
        investment={returnsInvestment}
        onClose={() => setReturnsInvestment(null)}
        onSaved={fetchInvestments}
      />

      {deletingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Delete Investment?</h3>
            <p className="text-sm text-slate-600 mb-1">
              This will permanently delete{" "}
              <span className="font-medium">{deletingInvestment.name}</span>.
            </p>
            <p className="text-sm text-slate-500 mb-4">All returns will also be deleted.</p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeletingInvestment(null);
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
