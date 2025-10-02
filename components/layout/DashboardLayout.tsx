'use client'

import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main style={{
        marginLeft: sidebarOpen ? '260px' : '0',
        marginTop: '64px',
        padding: '24px',
        transition: 'margin-left 0.3s ease-in-out',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {children}
      </main>
    </div>
  )
}