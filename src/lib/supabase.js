import { createClient } from '@supabase/supabase-js'

// Variables d'environnement Vite (configurées dans Vercel)
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || 'https://gujxulkztlsmlisierxr.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_o40kaIiASBeuUammGAwOfw_wQpANZp8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
})
