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
import type { OneTimeInvestment } from "@/app/lib/types";
import { formatCurrency, formatCompact, truncate } from "@/app/lib/format";

interface Props {
  investments: OneTimeInvestment[];
}

export default function InvestmentReturnsChart({ investments }: Props) {
  if (investments.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
        No investments yet
      </div>
    );
  }

  const data = investments.map((i) => ({
    name: truncate(i.name),
    Invested: Number(i.investedAmount) - Number(i.discountAmount ?? 0),
    Returned: Number(i.returnAmount),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
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
        <Bar dataKey="Invested" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Returned" fill="#059669" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
