
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mevrcomujfroqfopdcok.supabase.co';
const supabaseKey = 'sb_publishable_l_fVzTQLk6Zpgyl5gzCr8A_STe2ZPTM'; // Note: this is a publishable key, might not have full access but let's try

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const tables = ['profiles', 'admin_users', 'subscribers', 'lesson_content', 'uploaded_files'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`Table ${table}: ${count} rows (Error: ${error?.message || 'none'})`);
  }
}

checkData();
