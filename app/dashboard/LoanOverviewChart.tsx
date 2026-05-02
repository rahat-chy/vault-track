"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Loan } from "@/app/lib/types";
import { LoanType } from "@/app/lib/types";
import { formatCurrency, formatCompact, truncate } from "@/app/lib/format";

interface Props {
  loans: Loan[];
}

export default function LoanOverviewChart({ loans }: Props) {
  if (loans.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
        No loans yet
      </div>
    );
  }

  const data = loans.map((l) => {
    const paid = Number(l.totalPaid);
    const remaining = Math.max(Number(l.principalAmount) - paid, 0);
    const label = `${truncate(l.person.name)} (${l.type === LoanType.GIVEN ? "↑" : "↓"})`;
    return { name: label, Paid: paid, Remaining: remaining };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCompact} width={72} />
        <Tooltip formatter={(val) => formatCurrency(Number(val))} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Bar dataKey="Paid" stackId="a" fill="#059669" />
        <Bar dataKey="Remaining" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
