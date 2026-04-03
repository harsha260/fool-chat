import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://localhost', 'dummy');
type P = Parameters<typeof supabase.auth.signInAnonymously>[0];
const x: P = { options: { captchaToken: 'foo' } };
