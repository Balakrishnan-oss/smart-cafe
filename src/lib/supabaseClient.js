import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zzbshemwksvmmpdxudyd.supabase.co'

const supabaseKey =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_OQekKup7N_fdpnzTRilS2g_r9ioSlJ0'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
