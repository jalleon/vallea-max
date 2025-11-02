import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './types'

// For Server Components
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

// For API Routes
export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies })
