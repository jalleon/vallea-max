'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Box, Card, CardContent, Typography } from '@mui/material'

export default function SimpleTest() {
  const [result, setResult] = useState<string>('Testing...')

  useEffect(() => {
    async function test() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log('URL:', url)
        console.log('Key exists:', !!key)
        console.log('Key length:', key?.length)

        if (!url || !key) {
          setResult('ERROR: Missing credentials')
          return
        }

        const supabase = createClient(url, key)

        console.log('Client created, testing query...')

        // Simple query
        const { data, error } = await supabase
          .from('properties')
          .select('count')
          .limit(0)

        console.log('Query response:', { data, error })

        if (error) {
          setResult(`ERROR: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}\nHint: ${error.hint}`)
        } else {
          setResult(`SUCCESS! Connected to Supabase.\nQuery returned: ${JSON.stringify(data)}`)
        }
      } catch (err: any) {
        console.error('Caught error:', err)
        setResult(`EXCEPTION: ${err.message || err.toString()}`)
      }
    }
    test()
  }, [])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Simple Supabase Test</Typography>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {result}
          </Typography>
        </CardContent>
      </Card>
      <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
        Check browser console (F12) for detailed logs
      </Typography>
    </Box>
  )
}
