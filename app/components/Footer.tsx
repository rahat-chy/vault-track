export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-700 px-6 py-4 flex items-center justify-between">
      <p className="text-xs text-slate-400">
        &copy; {year}{' '}
        <span className="text-slate-200 font-medium">Rahat Chowdhury</span>
        {'. '}All rights reserved.
      </p>
      <p className="text-xs text-slate-500 font-medium tracking-wide">VaultTrack</p>
    </footer>
  )
}
