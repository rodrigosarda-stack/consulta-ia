import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xzknmihhtgwggpndpivb.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6a25taWhodGd3Z2dwbmRwaXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjYzNTAsImV4cCI6MjA5MDY0MjM1MH0.GakeLOo3Whh5AoM1XNTNTbNk-IZYbhDnfUAme_MdP-k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
