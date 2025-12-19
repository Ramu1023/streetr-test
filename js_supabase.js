// js_supabase.js

// 1. CONFIGURATION
const SUPABASE_URL = 'https://rnjvqxdrvplgilqzwnpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanZxeGRydnBsZ2lscXp3bnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDU4NjYsImV4cCI6MjA2NDUyMTg2Nn0.IOAxp8ULZgccX8hKtlDQzwdrW7xp1CcXVSdJ59UEruA';

// 2. CHECK FOR LIBRARY (Safety Check)
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Check <script> tag in index.html');
    alert('Critical Error: Supabase library failed to load. Please refresh.');
} else {
    // 3. INITIALIZATION
    // CRITICAL FIX: We use '_supabase' instead of 'supabase' here to avoid 
    // "Identifier 'supabase' has already been declared" errors on mobile browsers.
    try {
        const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 4. EXPORT
        // We overwrite the global variable globally with the initialized client
        window.supabase = _supabase;
        console.log('Supabase initialized successfully.');
    } catch (err) {
        console.error("Supabase init failed:", err);
        alert("Error initializing database: " + err.message);
    }
}
