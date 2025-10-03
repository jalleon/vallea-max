import type { Metadata } from 'next'
import './globals.css'
import { ValleaThemeProvider } from '../components/providers/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Vallea Max - Plateforme d\'évaluation immobilière',
  description: 'Plateforme professionnelle d\'évaluation immobilière avec gestion de propriétés, évaluations RPS/NAS, et génération de rapports.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        <ValleaThemeProvider>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AuthProvider>
        </ValleaThemeProvider>
      </body>
    </html>
  )
}