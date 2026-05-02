"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/app/lib/format";
import { LoanType } from "@/app/lib/types";
import type { Loan } from "@/app/lib/types";
import LoanModal from "./LoanModal";
import LoanTable from "./LoanTable";
import PaymentsModal from "./PaymentsModal";

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoanType, setModalLoanType] = useState<LoanType>(LoanType.GIVEN);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [paymentsLoan, setPaymentsLoan] = useState<Loan | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/loans");
      const data: Loan[] = await res.json();
      setLoans(data);
      setPaymentsLoan((prev) =>
        prev ? (data.find((l) => l.id === prev.id) ?? prev) : null,
      );
    } catch {
      // silently leave existing loans in place on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  function openCreate(type: LoanType) {
    setEditingLoan(null);
    setModalLoanType(type);
    setModalOpen(true);
  }

  function openEdit(loan: Loan) {
    setEditingLoan(loan);
    setModalLoanType(loan.type);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingLoan) return;
    setDeleteError("");
    try {
      const res = await fetch(`/api/loans/${deletingLoan.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete loan. Please try again.");
        return;
      }
      setDeletingLoan(null);
      fetchLoans();
    } catch {
      setDeleteError("Network error. Please check your connection and try again.");
    }
  }

  const given = loans.filter((l) => l.type === LoanType.GIVEN);
  const taken = loans.filter((l) => l.type === LoanType.TAKEN);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Loans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track loans you have given and taken
        </p>
      </div>

      <Section
        title="Loan Given"
        description="Money you have lent to others"
        accentColor="indigo"
        loans={given}
        loanType={LoanType.GIVEN}
        loading={loading}
        onAdd={() => openCreate(LoanType.GIVEN)}
        onEdit={openEdit}
        onDelete={setDeletingLoan}
        onPayments={setPaymentsLoan}
      />

      <Section
        title="Loan Taken"
        description="Money you have borrowed from others"
        accentColor="amber"
        loans={taken}
        loanType={LoanType.TAKEN}
        loading={loading}
        onAdd={() => openCreate(LoanType.TAKEN)}
        onEdit={openEdit}
        onDelete={setDeletingLoan}
        onPayments={setPaymentsLoan}
      />

      <LoanModal
        open={modalOpen}
        loanType={modalLoanType}
        loan={editingLoan}
        onClose={() => setModalOpen(false)}
        onSaved={fetchLoans}
      />

      <PaymentsModal
        open={paymentsLoan !== null}
        loan={paymentsLoan}
        onClose={() => setPaymentsLoan(null)}
        onSaved={fetchLoans}
      />

      {deletingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              Delete Loan?
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              This will permanently delete the loan for{" "}
              <span className="font-medium">{deletingLoan.person.name}</span>.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Loan payments will also be deleted.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeletingLoan(null);
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

interface SectionProps {
  title: string;
  description: string;
  accentColor: "indigo" | "amber";
  loans: Loan[];
  loanType: LoanType;
  loading: boolean;
  onAdd: () => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  onPayments: (loan: Loan) => void;
}

function Section({
  title,
  description,
  accentColor,
  loans,
  loanType,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onPayments,
}: SectionProps) {
  const btnClass =
    accentColor === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-amber-600 hover:bg-amber-700";

  const totalPrincipal = loans.reduce(
    (s, l) => s + Number(l.principalAmount),
    0,
  );
  const totalPaid = loans.reduce((s, l) => s + Number(l.totalPaid), 0);
  const totalRemaining = totalPrincipal - totalPaid;

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-6">
          {!loading && loans.length > 0 && (
            <div className="flex gap-4 text-xs text-slate-500">
              <span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(totalPrincipal)}
                </span>{" "}
                principal
              </span>
              <span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(totalPaid)}
                </span>{" "}
                paid
              </span>
              <span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(Math.max(totalRemaining, 0))}
                </span>{" "}
                remaining
              </span>
            </div>
          )}
          <button
            onClick={onAdd}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-white ${btnClass} transition-colors cursor-pointer`}
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
          <LoanTable
            loans={loans}
            loanType={loanType}
            onEdit={onEdit}
            onDelete={onDelete}
            onPayments={onPayments}
          />
        )}
      </div>
    </div>
  );
}
