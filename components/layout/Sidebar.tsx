'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

// Square edges (no border radius)

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('navigation')

  const menuItems = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: '📊',
      path: '/dashboard'
    },
    {
      id: 'library',
      label: t('library'),
      icon: '📋',
      path: '/library'
    },
    {
      id: 'import',
      label: t('import'),
      icon: '📥',
      path: '/import'
    },
    {
      id: 'evaluations',
      label: t('evaluations'),
      icon: '🏠',
      path: '/evaluations'
    },
    {
      id: 'adjustments',
      label: t('adjustments'),
      icon: '⚖️',
      path: '/adjustments'
    },
    {
      id: 'reports',
      label: t('reports'),
      icon: '📄',
      path: '/reports'
    }
  ]

  const handleItemClick = (path: string) => {
    router.push(path)
  }

  return (
    <aside style={{
      width: isOpen ? '260px' : '0',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #e5e7eb',
      position: 'fixed',
      top: '64px',
      left: 0,
      zIndex: 999,
      overflow: 'hidden',
      transition: 'width 0.3s ease-in-out'
    }}>
      <nav style={{ padding: '24px 0' }}>
        {menuItems.map((item) => {
          const isActive = pathname?.endsWith(item.path) || pathname === item.path

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              style={{
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                backgroundColor: isActive ? '#2E4057' : 'transparent',
                color: isActive ? 'white' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? '500' : 'normal',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}

      </nav>

      {/* Footer section */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        right: '24px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '0',
        border: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
          Vallea Max v2.0
        </div>
        <div>
          Plateforme d'évaluation immobilière
        </div>
      </div>
    </aside>
  )
}