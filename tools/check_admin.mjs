import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*');
  if (adminError) {
    console.error('Error fetching admin_users:', adminError);
  } else {
    console.log('Admin users found:', adminUsers.length);
    console.log('Users:', adminUsers);
  }

  const { error: mediaError } = await supabase.from('media_assets').select('id').limit(1);
  console.log('media_assets table existence:', mediaError ? `FAILED: ${mediaError.message}` : 'OK');
}

checkAdmin();
