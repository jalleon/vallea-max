export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
        Page not found / Page non trouvée
      </p>
      <a
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}
      >
        Go back home / Retour à l'accueil
      </a>
    </div>
  )
}
