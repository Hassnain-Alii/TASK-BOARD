const { createClient } = require('@supabase/supabase-js');

// [NEW]: Supabase Client Initiation for Cloud Storage
// This replaces MinIO and allows for 100% free cloud hosting for students.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for backend uploads

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
