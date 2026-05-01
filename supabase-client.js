/* global window */

// ============================================
// SUPABASE CLIENT SETUP
// ============================================

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://dbauytaklqxtmifcgbzi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiYXV5dGFrbHF4dG1pZmNnYnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzUxNzAsImV4cCI6MjA5MzIxMTE3MH0._IWVphCbI5PL6qry6HAkh6rJnY3NlbKnfYOWBR9v63I';

// Initialize when script loads
window.initSupabase = async function() {
  if (window.supabaseClient) return window.supabaseClient;
  
  try {
    const { createClient } = window.supabase;
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase initialized');
    return window.supabaseClient;
  } catch (error) {
    console.warn('⚠️ Supabase not available:', error.message);
    return null;
  }
};

// Export for global access
window.getSupabaseClient = async () => {
  if (!window.supabaseClient) {
    await window.initSupabase();
  }
  return window.supabaseClient;
};
