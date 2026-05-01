'use client'

interface HeaderProps {
  sidebarOpen: boolean
  onToggle: () => void
}

function VaultDialLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" stroke="currentColor" strokeLinecap="round">
      {/* Outer ring */}
      <circle cx="16" cy="16" r="13" strokeWidth="2" />
      {/* Cardinal ticks (longer) */}
      <line x1="16" y1="3" x2="16" y2="7" strokeWidth="2.5" />
      <line x1="29" y1="16" x2="25" y2="16" strokeWidth="2.5" />
      <line x1="16" y1="29" x2="16" y2="25" strokeWidth="2.5" />
      <line x1="3" y1="16" x2="7" y2="16" strokeWidth="2.5" />
      {/* Diagonal ticks (shorter) */}
      <line x1="25.2" y1="6.8" x2="23.8" y2="8.2" strokeWidth="1.5" />
      <line x1="25.2" y1="25.2" x2="23.8" y2="23.8" strokeWidth="1.5" />
      <line x1="6.8" y1="25.2" x2="8.2" y2="23.8" strokeWidth="1.5" />
      <line x1="6.8" y1="6.8" x2="8.2" y2="8.2" strokeWidth="1.5" />
      {/* Inner face */}
      <circle cx="16" cy="16" r="7" strokeWidth="1.5" />
      {/* Dial hand pointing ~1 o'clock (30° from top) */}
      <line x1="16" y1="16" x2="18.5" y2="11.7" strokeWidth="2" />
      {/* Center pivot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Header({ sidebarOpen, onToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-slate-900 flex items-center px-4 gap-4">
      <button
        onClick={onToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        className="flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <span
          className={`block h-0.5 w-5 bg-slate-400 rounded transition-all duration-300 ${
            sidebarOpen ? 'translate-y-1.5 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-slate-400 rounded transition-all duration-300 mt-1 ${
            sidebarOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-slate-400 rounded transition-all duration-300 mt-1 ${
            sidebarOpen ? '-translate-y-1.5 -rotate-45' : ''
          }`}
        />
      </button>

      <div className="flex items-center gap-2.5 select-none text-indigo-400">
        <VaultDialLogo />
        <span className="text-lg font-semibold text-white tracking-tight">VaultTrack</span>
      </div>

      <div className="ml-auto">
        <span className="hidden sm:inline-flex text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full tracking-wide">
          Personal Finance
        </span>
      </div>
    </header>
  )
}
