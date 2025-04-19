import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://gwmfqrofcmufiweltdim.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWZxcm9mY211Zml3ZWx0ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NzU4NTAsImV4cCI6MjA2MDU1MTg1MH0.EuujQA5TwfvsZS8iaum8X725bLY1YyxGOLGJv2fRAmw'

export const supabase = createClient(supabaseUrl, supabaseKey)