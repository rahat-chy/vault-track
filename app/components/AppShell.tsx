'use client'

import { useEffect, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024)
  }, [])

  return (
    <div className="min-h-screen bg-slate-100">
      <Header sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

      {/* Backdrop: mobile only, closes sidebar on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} />
        <div
          className={`flex flex-col flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <main className="flex-1 p-4 sm:p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
