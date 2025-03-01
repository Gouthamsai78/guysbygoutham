
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://beatueowfirwldsailgo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlYXR1ZW93Zmlyd2xkc2FpbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Mjk1MjksImV4cCI6MjA1NjMwNTUyOX0.rfL1JpbeYhq-Axp3CpTu9WnwgTksyI1PLropR6-bxYI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
