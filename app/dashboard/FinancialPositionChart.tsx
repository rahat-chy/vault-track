"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { Loan, OneTimeInvestment, Stock } from "@/app/lib/types";
import { LoanType } from "@/app/lib/types";
import { stockTotals } from "@/app/lib/stocks";
import { formatCurrency, formatCompact } from "@/app/lib/format";

interface Props {
  loans: Loan[];
  investments: OneTimeInvestment[];
  stocks: Stock[];
}

export default function FinancialPositionChart({ loans, investments, stocks }: Props) {
  const loansGivenOutstanding = loans
    .filter((l) => l.type === LoanType.GIVEN)
    .reduce((s, l) => s + Math.max(Number(l.principalAmount) - Number(l.totalPaid), 0), 0);

  const loansTakenOutstanding = loans
    .filter((l) => l.type === LoanType.TAKEN)
    .reduce((s, l) => s + Math.max(Number(l.principalAmount) - Number(l.totalPaid), 0), 0);

  const investmentNet = investments.reduce((s, i) => {
    const cost = Number(i.investedAmount) - Number(i.discountAmount ?? 0);
    return s + Number(i.returnAmount) - cost;
  }, 0);

  const stockNet = stocks.reduce((s, stock) => s + stockTotals(stock).net, 0);

  const data = [
    { label: "Owed to Me", value: loansGivenOutstanding },
    { label: "I Owe", value: -loansTakenOutstanding },
    { label: "Investment P&L", value: investmentNet },
    { label: "Stock P&L", value: stockNet },
  ];

  const allZero = data.every((d) => d.value === 0);

  if (allZero) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCompact} width={72} />
        <Tooltip formatter={(val) => formatCurrency(Number(val))} />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.value >= 0 ? "#4f46e5" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
