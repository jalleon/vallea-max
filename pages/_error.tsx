import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h1>
      <p style={{ color: '#666' }}>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Something went wrong. Please try again later.'}
      </p>
      <a href="/" style={{ marginTop: '20px', color: '#0070f3' }}>Go back home</a>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
