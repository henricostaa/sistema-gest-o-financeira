import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localSettingsStr =
    localStorage.getItem('finance_app_v1_settings') || localStorage.getItem('finance_settings_v1');

  let settingsUrl = '';
  let settingsKey = '';
  if (localSettingsStr) {
    try {
      const parsed = JSON.parse(localSettingsStr);
      settingsUrl = parsed.supabaseUrl || '';
      settingsKey = parsed.supabaseAnonKey || '';
    } catch {
      // ignore
    }
  }

  const url = (envUrl || settingsUrl || '').trim();
  const key = (envKey || settingsKey || '').trim();

  return { url, key };
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    cachedClient = null;
    cachedUrl = null;
    cachedKey = null;
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedUrl = url;
    cachedKey = key;
    cachedClient = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return cachedClient;
  } catch (e) {
    console.warn('Erro ao inicializar Supabase:', e);
    cachedClient = null;
    cachedUrl = null;
    cachedKey = null;
    return null;
  }
};

