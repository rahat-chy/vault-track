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
import type { Stock } from "@/app/lib/types";
import { stockTotals } from "@/app/lib/stocks";
import { formatCurrency, formatCompact, truncate } from "@/app/lib/format";

interface Props {
  stocks: Stock[];
}

export default function StockPerformanceChart({ stocks }: Props) {
  if (stocks.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
        No stocks yet
      </div>
    );
  }

  const data = stocks.map((s) => {
    const { investedWithComm, sells, dividends } = stockTotals(s);
    return {
      name: truncate(s.name),
      Invested: investedWithComm,
      Sells: sells,
      Dividends: dividends,
    };
  });

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
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={formatCompact}
          width={72}
        />
        <Tooltip formatter={(val) => formatCurrency(Number(val))} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Bar dataKey="Invested" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Sells" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Dividends" fill="#059669" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
