"use client";

import { useEffect, useState } from "react";
import { toDateInput } from "@/app/lib/format";
import { InvestmentStatus } from "@/app/lib/types";
import type { InvestmentFormData, OneTimeInvestment } from "@/app/lib/types";

interface Props {
  open: boolean;
  investment: OneTimeInvestment | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM: InvestmentFormData = {
  name: "",
  investedAmount: "",
  investmentDate: "",
  discountAmount: "",
  donated: "",
  exitDate: "",
  status: InvestmentStatus.ACTIVE,
  description: "",
};

export default function InvestmentModal({ open, investment, onClose, onSaved }: Props) {
  const [form, setForm] = useState<InvestmentFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(
      investment
        ? {
            name: investment.name,
            investedAmount: String(investment.investedAmount),
            investmentDate: toDateInput(investment.investmentDate),
            discountAmount: investment.discountAmount != null ? String(investment.discountAmount) : "",
            donated: investment.donated != null ? String(investment.donated) : "",
            exitDate: toDateInput(investment.exitDate),
            status: investment.status,
            description: investment.description ?? "",
          }
        : EMPTY_FORM,
    );
    setError("");
  }, [investment, open]);

  if (!open) return null;

  const set = (field: keyof InvestmentFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Investment name is required.");
      return;
    }
    if (!form.investedAmount || isNaN(Number(form.investedAmount)) || Number(form.investedAmount) <= 0) {
      setError("Please enter a valid invested amount greater than zero.");
      return;
    }
    if (form.discountAmount && (isNaN(Number(form.discountAmount)) || Number(form.discountAmount) < 0)) {
      setError("Please enter a valid discount amount.");
      return;
    }
    if (form.donated && (isNaN(Number(form.donated)) || Number(form.donated) < 0)) {
      setError("Please enter a valid donated amount.");
      return;
    }
    if (!form.investmentDate) {
      setError("Investment date is required.");
      return;
    }
    if (form.exitDate && form.exitDate < form.investmentDate) {
      setError("Exit date cannot be earlier than the investment date.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      investedAmount: parseFloat(form.investedAmount),
      investmentDate: form.investmentDate,
      discountAmount: form.discountAmount ? parseFloat(form.discountAmount) : null,
      donated: form.donated ? parseFloat(form.donated) : null,
      exitDate: form.exitDate || null,
      status: form.status,
      description: form.description || null,
    };

    try {
      const res = investment
        ? await fetch(`/api/one-time-investments/${investment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/one-time-investments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save investment. Please try again.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {investment ? "Edit Investment" : "New Investment"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Investment name…"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invested Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.investedAmount}
                onChange={(e) => set("investedAmount", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.discountAmount}
                onChange={(e) => set("discountAmount", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Donated <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.donated}
              onChange={(e) => set("donated", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Investment Date</label>
              <input
                type="date"
                value={form.investmentDate}
                onChange={(e) => set("investmentDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Exit Date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.exitDate}
                onChange={(e) => set("exitDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {investment && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={InvestmentStatus.ACTIVE}>Active</option>
                <option value={InvestmentStatus.CLOSED}>Closed</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Any notes…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : investment ? "Save Changes" : "Create Investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
