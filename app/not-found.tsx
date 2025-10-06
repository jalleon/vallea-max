export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <a href="/" style={{ marginTop: '20px', color: '#0070f3' }}>Go back home</a>
        </div>
      </body>
    </html>
  )
}