import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jrzasussalnthpkxafco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyemFzdXNzYWxudGhwa3hhZmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTE4NzcsImV4cCI6MjEwMzA2Nzg3N30.f8EM1cOOKrPwwtx9v-kTZmVCk4yyf-LkS9uQv9EfQyM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)