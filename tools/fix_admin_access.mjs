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

const USER_EMAIL = 'alexandrecampos@id.uff.br';
const USER_ID = 'd5810b17-7558-4009-b028-2b8a0eeb52d7';

async function fixAdmin() {
  console.log(`Checking if user ${USER_EMAIL} exists in admin_users...`);
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', USER_ID);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('User already exists in admin_users.');
  } else {
    console.log('User not found. Inserting...');
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: USER_ID,
        email: USER_EMAIL
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Successfully added user to admin_users!');
    }
  }
}

fixAdmin();
