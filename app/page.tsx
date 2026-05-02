"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Loan, OneTimeInvestment, Stock } from "@/app/lib/types";
import { LoanType, LoanStatus } from "@/app/lib/types";
import { stockTotals } from "@/app/lib/stocks";
import { formatCurrency } from "@/app/lib/format";
import PortfolioAllocationChart from "@/app/dashboard/PortfolioAllocationChart";
import FinancialPositionChart from "@/app/dashboard/FinancialPositionChart";
import InvestmentReturnsChart from "@/app/dashboard/InvestmentReturnsChart";
import StockPerformanceChart from "@/app/dashboard/StockPerformanceChart";
import LoanOverviewChart from "@/app/dashboard/LoanOverviewChart";

function ChartSkeleton({ height = "h-[220px]" }: { height?: string }) {
  return <div className={`${height} bg-slate-100 animate-pulse rounded-lg`} />;
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<OneTimeInvestment[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/loans").then((r) => r.json()),
      fetch("/api/one-time-investments").then((r) => r.json()),
      fetch("/api/stocks").then((r) => r.json()),
    ])
      .then(([loansData, investmentsData, stocksData]) => {
        setLoans(loansData);
        setInvestments(investmentsData);
        setStocks(stocksData);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeLoansGiven = loans.filter(
    (l) => l.type === LoanType.GIVEN && l.status === LoanStatus.ACTIVE,
  );
  const totalLoansGivenPrincipal = loans
    .filter((l) => l.type === LoanType.GIVEN)
    .reduce((s, l) => s + Number(l.principalAmount), 0);

  const totalInvested = investments.reduce(
    (s, i) => s + Number(i.investedAmount),
    0,
  );

  const stockInvested = stocks.reduce(
    (s, stock) => s + stockTotals(stock).invested,
    0,
  );

  const investmentNet = investments.reduce((s, i) => {
    const cost = Number(i.investedAmount) - Number(i.discountAmount ?? 0);
    return s + Number(i.returnAmount) - cost;
  }, 0);
  const stockNet = stocks.reduce((s, stock) => s + stockTotals(stock).net, 0);
  const netPL = investmentNet + stockNet;

  const totalLoansGivenRepaid = loans
    .filter((l) => l.type === LoanType.GIVEN)
    .reduce((s, l) => s + Number(l.totalPaid), 0);

  const totalInvestmentReturn = investments.reduce(
    (s, i) => s + Number(i.returnAmount),
    0,
  );

  const totalStockSold = stocks.reduce(
    (s, stock) => s + stockTotals(stock).sells,
    0,
  );

  const totalDividendIncome = stocks.reduce(
    (s, stock) => s + stockTotals(stock).dividends,
    0,
  );

  const cards = [
    {
      label: "Loans Given",
      value: formatCurrency(totalLoansGivenPrincipal),
      sub: `${activeLoansGiven.length} active`,
      color: "text-blue-600",
    },
    {
      label: "Investments",
      value: formatCurrency(totalInvested),
      sub: `${investments.length} total`,
      color: "text-violet-600",
    },
    {
      label: "Stocks Invested",
      value: formatCurrency(stockInvested),
      sub: `${stocks.length} positions`,
      color: "text-emerald-600",
    },
    {
      label: "Net P&L",
      value: (netPL >= 0 ? "+" : "") + formatCurrency(netPL),
      sub: "investments + stocks",
      color: netPL >= 0 ? "text-emerald-600" : "text-red-600",
    },
  ];

  const incomeCards = [
    {
      label: "Given Loan Repaid",
      value: formatCurrency(totalLoansGivenRepaid),
      sub: "total repayments received",
      color: "text-teal-600",
    },
    {
      label: "Investment Return",
      value: formatCurrency(totalInvestmentReturn),
      sub: "total returned",
      color: "text-violet-600",
    },
    {
      label: "Stock Sold",
      value: formatCurrency(totalStockSold),
      sub: "total sell proceeds",
      color: "text-sky-600",
    },
    {
      label: "Dividend Income",
      value: formatCurrency(totalDividendIncome),
      sub: "total dividends received",
      color: "text-green-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your financial portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {card.label}
            </p>
            {loading ? (
              <div className="h-8 w-28 bg-slate-100 animate-pulse rounded mt-2" />
            ) : (
              <>
                <p className={`text-2xl font-semibold mt-2 ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {incomeCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {card.label}
            </p>
            {loading ? (
              <div className="h-8 w-28 bg-slate-100 animate-pulse rounded mt-2" />
            ) : (
              <>
                <p className={`text-2xl font-semibold mt-2 ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Portfolio Allocation"
          subtitle="Capital deployed by category (active positions)"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <PortfolioAllocationChart
              loans={loans}
              investments={investments}
              stocks={stocks}
            />
          )}
        </ChartCard>
        <ChartCard
          title="Financial Position"
          subtitle="Loan outstanding balances and investment/stock P&L"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <FinancialPositionChart
              loans={loans}
              investments={investments}
              stocks={stocks}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Investment Returns"
          subtitle="Amount invested vs returned per investment"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <InvestmentReturnsChart investments={investments} />
          )}
        </ChartCard>
        <ChartCard
          title="Stock Performance"
          subtitle="Invested amount, sell proceeds, and dividends per stock"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <StockPerformanceChart stocks={stocks} />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Loan Overview"
        subtitle="Paid vs remaining principal per loan (↑ given, ↓ taken)"
      >
        {loading ? (
          <ChartSkeleton height="h-[200px]" />
        ) : (
          <LoanOverviewChart loans={loans} />
        )}
      </ChartCard>
    </div>
  );
}
