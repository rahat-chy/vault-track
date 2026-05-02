"use client";

import { formatCurrency, formatDate } from "@/app/lib/format";
import { LOAN_STATUS_LABELS, LOAN_STATUS_STYLES, LOAN_TYPE_EMPTY_LABELS, LOAN_TYPE_PERSON_LABELS } from "@/app/lib/loans";
import type { Loan, LoanStatus, LoanType } from "@/app/lib/types";

interface Props {
  loans: Loan[];
  loanType: LoanType;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  onPayments: (loan: Loan) => void;
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LOAN_STATUS_STYLES[status]}`}
    >
      {LOAN_STATUS_LABELS[status]}
    </span>
  );
}

export default function LoanTable({
  loans,
  loanType,
  onEdit,
  onDelete,
  onPayments,
}: Props) {
  const label = LOAN_TYPE_PERSON_LABELS[loanType];

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No {LOAN_TYPE_EMPTY_LABELS[loanType]} yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              {label}
            </th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Principal
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Start
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Due
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Status
            </th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Paid
            </th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Remaining
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Returned
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">
              Notes
            </th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loans.map((loan) => {
            const principal = Number(loan.principalAmount);
            const paid = Number(loan.totalPaid);
            const remaining = principal - paid;
            return (
              <tr
                key={loan.id}
                className="group hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 pr-4 font-medium text-slate-800">
                  {loan.person.name}
                </td>
                <td className="py-3 pr-4 text-right text-slate-700 tabular-nums">
                  {formatCurrency(principal)}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {formatDate(loan.startDate)}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {formatDate(loan.dueDate)}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="py-3 pr-4 text-right text-slate-600 tabular-nums">
                  {formatCurrency(paid)}
                </td>
                <td
                  className={`py-3 pr-4 text-right tabular-nums font-medium ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {formatCurrency(Math.max(remaining, 0))}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {loan.returnDate ? formatDate(loan.returnDate) : "—"}
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs max-w-[140px] truncate" title={loan.notes ?? undefined}>
                  {loan.notes ?? "—"}
                </td>
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPayments(loan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Payments"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(loan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(loan)}
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
