"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, toDateInput } from "@/app/lib/format";
import type { Loan, LoanPayment } from "@/app/lib/types";

interface Props {
  open: boolean;
  loan: Loan | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentsModal({ open, loan, onClose, onSaved }: Props) {
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toDateInput(new Date().toISOString()));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  async function fetchPayments() {
    if (!loan) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${loan.id}/payments`);
      const data = await res.json();
      setPayments(data);
    } catch {
      setDeleteError("Failed to load payments. Please close and reopen.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !loan) return;
    setAmount("");
    setPaidAt(toDateInput(new Date().toISOString()));
    setNotes("");
    setError("");
    setDeleteError("");
    fetchPayments();
  }, [open, loan]);

  if (!open || !loan) return null;

  const principal = Number(loan.principalAmount);
  const totalPaid = Number(loan.totalPaid);
  const remaining = Math.max(principal - totalPaid, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!paidAt) {
      setError("Payment date is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/loans/${loan!.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), paidAt, notes: notes || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add payment. Please try again.");
        return;
      }
      setAmount("");
      setNotes("");
      await fetchPayments();
      onSaved();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(paymentId: string) {
    setDeleteError("");
    try {
      const res = await fetch(`/api/loans/${loan!.id}/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete payment. Please try again.");
        return;
      }
      await fetchPayments();
      onSaved();
    } catch {
      setDeleteError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Payments</h2>
            <p className="text-xs text-slate-500 mt-0.5">{loan.person.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex gap-6 text-xs text-slate-500">
          <span><span className="font-medium text-slate-700">{formatCurrency(principal)}</span> principal</span>
          <span><span className="font-medium text-emerald-600">{formatCurrency(totalPaid)}</span> paid</span>
          <span><span className="font-medium text-amber-600">{formatCurrency(remaining)}</span> remaining</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {deleteError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{deleteError}</p>
          )}
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No payments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Date</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2">Notes</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="py-2.5 pr-4 text-slate-600">{formatDate(p.paidAt)}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-700 tabular-nums font-medium">{formatCurrency(Number(p.amount))}</td>
                    <td className="py-2.5 text-slate-500 text-xs max-w-[140px] truncate" title={p.notes ?? undefined}>
                      {p.notes ?? "—"}
                    </td>
                    <td className="py-2.5 pl-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete payment"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Add Payment</p>
          <form onSubmit={handleAdd} className="space-y-3">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="Any notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? "Adding…" : "Add Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
