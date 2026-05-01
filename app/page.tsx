export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your financial portfolio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Loans', value: '—', color: 'text-blue-600' },
          { label: 'One Time Investments', value: '—', color: 'text-violet-600' },
          { label: 'Stock Holdings', value: '—', color: 'text-emerald-600' },
          { label: 'Net Position', value: '—', color: 'text-slate-800' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
            <p className={`text-2xl font-semibold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
