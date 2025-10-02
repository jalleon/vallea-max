'use client'

import SimpleTest from './simple-test'

export default function TestSupabasePage() {
  return <SimpleTest />
}

function OriginalTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check if client is created
        if (!supabase) {
          throw new Error('Supabase client not initialized')
        }

        // Test 2: Try to query properties table
        const { data, error, count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })

        if (error) {
          throw error
        }

        // Test 3: Check auth status
        const { data: { session } } = await supabase.auth.getSession()

        setStatus('success')
        setMessage('Supabase connection successful!')
        setDetails({
          connected: true,
          propertiesTableExists: true,
          propertyCount: count || 0,
          authenticated: !!session,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
        })
      } catch (error: any) {
        console.error('Supabase connection error:', error)
        setStatus('error')
        setMessage(error.message || error.toString() || 'Connection failed')
        setDetails({
          connected: false,
          errorMessage: error.message,
          errorString: error.toString(),
          hint: error.hint,
          details: error.details,
          code: error.code,
          status: error.status,
          statusCode: error.statusCode,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        })
      }
    }

    testConnection()
  }, [])

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Supabase Connection Test
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          {status === 'loading' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Testing connection...</Typography>
            </Box>
          )}

          {status === 'success' && (
            <>
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Connection Details:</Typography>
                <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
                  {JSON.stringify(details, null, 2)}
                </Box>
              </Box>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Error Details:</Typography>
                <Box component="pre" sx={{ bgcolor: '#fff5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
                  {JSON.stringify(details, null, 2)}
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Environment Check:</Typography>
          <Typography variant="body2" component="div">
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1, color: 'text.secondary' }}>
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
