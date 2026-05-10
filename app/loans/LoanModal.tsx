"use client";

import { useEffect, useState } from "react";
import { toDateInput } from "@/app/lib/format";
import { LOAN_TYPE_LABELS, LOAN_TYPE_PERSON_LABELS } from "@/app/lib/loans";
import { LoanStatus, LoanType } from "@/app/lib/types";
import type { Loan, LoanFormData, Person } from "@/app/lib/types";

interface Props {
  open: boolean;
  loanType: LoanType;
  loan: Loan | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM: LoanFormData = {
  personId: "",
  principalAmount: "",
  startDate: "",
  dueDate: "",
  status: LoanStatus.ACTIVE,
  notes: "",
};

export default function LoanModal({
  open,
  loanType,
  loan,
  onClose,
  onSaved,
}: Props) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<LoanFormData>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    fetch("/api/persons")
      .then((r) => r.json())
      .then(setPersons)
      .catch(() => setError("Failed to load persons. Please close and try again."));
  }, [open]);

  useEffect(() => {
    setForm(
      loan
        ? {
            personId: loan.personId,
            principalAmount: String(loan.principalAmount),
            startDate: toDateInput(loan.startDate),
            dueDate: loan.dueDate ? toDateInput(loan.dueDate) : "",
            status: loan.status,
            notes: loan.notes ?? "",
          }
        : EMPTY_FORM,
    );
    setError("");
    setShowNewPerson(false);
    setNewPersonName("");
    setNewPersonPhone("");
  }, [loan, open]);

  if (!open) return null;

  const set = (field: keyof LoanFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleAddPerson() {
    if (!newPersonName.trim()) {
      setError("Person name is required.");
      return;
    }
    if (!newPersonPhone.trim()) {
      setError("Phone number is required.");
      return;
    }
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPersonName, phone: newPersonPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create person. Please try again.");
        return;
      }
      const person: Person = data;
      setPersons((prev) =>
        [...prev, person].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm((f) => ({ ...f, personId: person.id }));
      setShowNewPerson(false);
      setNewPersonName("");
      setNewPersonPhone("");
      setError("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.personId) {
      setError("Please select a person.");
      return;
    }
    if (!form.principalAmount || isNaN(Number(form.principalAmount)) || Number(form.principalAmount) <= 0) {
      setError("Please enter a valid principal amount greater than zero.");
      return;
    }
    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }
    if (form.dueDate && form.dueDate < form.startDate) {
      setError("Due date cannot be earlier than the start date.");
      return;
    }

    setSaving(true);
    const payload = {
      personId: form.personId,
      principalAmount: parseFloat(form.principalAmount),
      startDate: form.startDate,
      dueDate: form.dueDate,
      status: form.status,
      type: loanType,
      notes: form.notes || null,
    };

    try {
      const res = loan
        ? await fetch(`/api/loans/${loan.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/loans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save loan. Please try again.");
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

  const title = `${loan ? "Edit" : "New"} Loan ${LOAN_TYPE_LABELS[loanType]}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {LOAN_TYPE_PERSON_LABELS[loanType]}
            </label>
            <div className="flex gap-2">
              <select
                value={form.personId}
                onChange={(e) => set("personId", e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select person…</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewPerson((v) => !v)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                + New
              </button>
            </div>

            {showNewPerson && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddPerson}
                  className="w-full py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Add Person
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Principal Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.principalAmount}
              onChange={(e) => set("principalAmount", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loan && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={LoanStatus.ACTIVE}>Active</option>
                <option value={LoanStatus.CLOSED}>Closed</option>
                <option value={LoanStatus.DEFAULTED}>Defaulted</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Any notes…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
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
              {saving ? "Saving…" : loan ? "Save Changes" : "Create Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
