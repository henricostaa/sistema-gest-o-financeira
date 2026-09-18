import { createClient } from '@supabase/supabase-js';

const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localSettingsStr = localStorage.getItem('finance_settings_v1');
  
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

  const url = envUrl || settingsUrl;
  const key = envKey || settingsKey;

  return { url, key };
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Erro ao inicializar Supabase:', e);
    }
  }
  return null;
};
