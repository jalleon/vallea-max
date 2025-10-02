'use client'

import { ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Simplified version without react-query for now
  return <>{children}</>
}