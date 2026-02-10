
// Only initialize if not already initialized
if (typeof supabase === 'undefined') {
    var SUPABASE_URL = 'https://rdnkijeggxngvrfwuobo.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmtpamVnZ3huZ3ZyZnd1b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjExOTgsImV4cCI6MjA4NTU5NzE5OH0.7mPgjG1T95MH1xaL2HFySm2GGjSt_BDZCJcI5McWth0';

    // Initialize Supabase client
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Supabase initialized successfully');
}