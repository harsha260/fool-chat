import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://localhost', 'dummy');
supabase.auth.signInAnonymously({ options: { captchaToken: 'test' } }).catch(e => console.error(e));
