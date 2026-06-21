"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Loan, OneTimeInvestment, Stock } from "@/app/lib/types";
import { LoanType, LoanStatus, InvestmentStatus } from "@/app/lib/types";
import { stockTotals } from "@/app/lib/stocks";
import { formatCurrency } from "@/app/lib/format";

interface Props {
  loans: Loan[];
  investments: OneTimeInvestment[];
  stocks: Stock[];
}

const COLORS = ["#4f46e5", "#7c3aed", "#059669"];

export default function PortfolioAllocationChart({
  loans,
  investments,
  stocks,
}: Props) {
  const loansGiven = loans
    .filter((l) => l.type === LoanType.GIVEN)
    .reduce((s, l) => s + Number(l.principalAmount), 0);

  const totalInvested = investments.reduce(
    (s, i) => s + Number(i.investedAmount),
    0,
  );

  const stocksInvested = stocks.reduce(
    (s, stock) => s + stockTotals(stock).investedWithComm,
    0,
  );

  const data = [
    { name: "Loans Given", value: loansGiven },
    { name: "Investments", value: totalInvested },
    { name: "Stocks", value: stocksInvested },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => formatCurrency(Number(val))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
