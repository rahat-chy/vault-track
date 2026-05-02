"use client";

import { useState } from "react";
import { formatCurrency, formatDate, toDateInput } from "@/app/lib/format";
import type { Stock, StockBuy } from "@/app/lib/types";

interface BuyForm {
  unitPrice: string;
  numberOfStocks: string;
  date: string;
  notes: string;
}

interface Props {
  stock: Stock;
  onSaved: () => void;
}

export default function BuysTab({ stock, onSaved }: Props) {
  const [editing, setEditing] = useState<StockBuy | null>(null);
  const [form, setForm] = useState<BuyForm>({
    unitPrice: "",
    numberOfStocks: "",
    date: toDateInput(new Date().toISOString()),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function startEdit(buy: StockBuy) {
    setEditing(buy);
    setForm({
      unitPrice: String(buy.unitPrice),
      numberOfStocks: String(buy.numberOfStocks),
      date: toDateInput(buy.investmentDate),
      notes: buy.notes ?? "",
    });
    setError("");
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ unitPrice: "", numberOfStocks: "", date: toDateInput(new Date().toISOString()), notes: "" });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.unitPrice || isNaN(Number(form.unitPrice)) || Number(form.unitPrice) <= 0) {
      setError("Please enter a valid unit price greater than zero.");
      return;
    }
    const qty = parseFloat(form.numberOfStocks);
    if (!form.numberOfStocks || isNaN(qty) || qty <= 0) {
      setError("Please enter a valid number of shares greater than zero.");
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      return;
    }
    if (editing) {
      const otherBought = stock.buys
        .filter((b) => b.id !== editing.id)
        .reduce((acc, b) => acc + Number(b.numberOfStocks), 0);
      const totalSold = stock.sells.reduce((acc, s) => acc + Number(s.numberOfStocks), 0);
      if (otherBought + qty < totalSold) {
        setError(`Cannot reduce to ${qty} shares — total sold (${totalSold}) would exceed total bought.`);
        return;
      }
    }
    setSaving(true);
    try {
      const body = {
        unitPrice: parseFloat(form.unitPrice),
        numberOfStocks: qty,
        investmentDate: form.date,
        notes: form.notes || null,
      };
      const res = editing
        ? await fetch(`/api/stocks/${stock.id}/buys/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/stocks/${stock.id}/buys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save buy. Please try again.");
        return;
      }
      cancelEdit();
      onSaved();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(buy: StockBuy) {
    setDeleteError("");
    try {
      const res = await fetch(`/api/stocks/${stock.id}/buys/${buy.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete. Please try again.");
        return;
      }
      if (editing?.id === buy.id) cancelEdit();
      onSaved();
    } catch {
      setDeleteError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <>
      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {deleteError}
        </p>
      )}
      {stock.buys.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No buys yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Date</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Unit Price</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Shares</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 pr-4">Total</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2">Notes</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stock.buys.map((buy) => (
              <tr key={buy.id} className={`group ${editing?.id === buy.id ? "bg-indigo-50" : ""}`}>
                <td className="py-2.5 pr-4 text-slate-600">{formatDate(buy.investmentDate)}</td>
                <td className="py-2.5 pr-4 text-right text-slate-700 tabular-nums">{formatCurrency(Number(buy.unitPrice))}</td>
                <td className="py-2.5 pr-4 text-right text-slate-700 tabular-nums">{Number(buy.numberOfStocks)}</td>
                <td className="py-2.5 pr-4 text-right text-slate-700 tabular-nums font-medium">
                  {formatCurrency(Number(buy.unitPrice) * Number(buy.numberOfStocks))}
                </td>
                <td className="py-2.5 text-slate-500 text-xs max-w-[80px] truncate" title={buy.notes ?? undefined}>
                  {buy.notes ?? "—"}
                </td>
                <td className="py-2.5 pl-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(buy)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                      title="Edit buy"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(buy)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete buy"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="sticky bottom-0 bg-white -mx-6 px-6 border-t border-slate-200 pt-4 pb-4 mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {editing ? "Edit Buy" : "Add Buy"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price</label>
              <input
                type="number" min="0.0001" step="0.0001" placeholder="0.00"
                value={form.unitPrice}
                onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Shares</label>
              <input
                type="number" min="0.0001" step="0.0001" placeholder="0"
                value={form.numberOfStocks}
                onChange={(e) => setForm((f) => ({ ...f, numberOfStocks: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text" placeholder="Any notes…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              {editing && (
                <button
                  type="button" onClick={cancelEdit}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit" disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Buy"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
