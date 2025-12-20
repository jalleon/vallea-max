'use client'

import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header style={{
      height: '64px',
      backgroundImage: `
        linear-gradient(160deg, rgba(239, 246, 255, 0.92) 0%, rgba(225, 237, 255, 0.88) 70%, rgba(212, 229, 255, 0.85) 100%),
        repeating-linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0px, rgba(59, 130, 246, 0.28) 2px, transparent 2px, transparent 18px),
        repeating-linear-gradient(315deg, rgba(37, 99, 235, 0.18) 0px, rgba(37, 99, 235, 0.18) 1px, transparent 1px, transparent 16px),
        radial-gradient(125% 145% at 100% 115%, rgba(96, 165, 250, 0.18) 0%, rgba(96, 165, 250, 0) 60%)
      `,
      backgroundSize: 'cover, 200px 200px, 240px 240px, 130% 130%',
      backgroundPosition: 'center, 0 0, 10px 10px, 100% 100%',
      backgroundBlendMode: 'normal, overlay, overlay, normal',
      backdropFilter: 'blur(4px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.38)',
      boxShadow: '0 10px 26px rgba(15, 23, 42, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      color: '#0F172A'
    }}>
      {/* Left side - Menu and Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E3A8A',
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)'
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
            backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.85) 100%)',
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
            color: '#0F172A',
            textShadow: '0 4px 12px rgba(15, 23, 42, 0.18)'
          }}>
            Vallea Max
          </h1>
        </div>
      </div>

      {/* Right side - User menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.4)',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#1E293B',
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.15)'
        }}>
          👤 Utilisateur Demo
        </div>
      </div>
    </header>
  )
}
