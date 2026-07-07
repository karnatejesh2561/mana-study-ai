import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwcpuswlxwggdnhotlut.supabase.co';
const supabaseAnonKey = 'sb_publishable_NBCZ7r-EuIA-ai8buXvu1g_rjZ8qeQB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
