'use client'

import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      {/* Left side - Menu and Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#2E4057',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            V
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#2E4057'
          }}>
            Vallea Max
          </h1>
        </div>
      </div>

      {/* Right side - User menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#374151'
        }}>
          👤 Utilisateur Demo
        </div>
      </div>
    </header>
  )
}