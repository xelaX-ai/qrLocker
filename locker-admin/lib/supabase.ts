// Клиент Supabase для серверных запросов (ленивая инициализация)
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Возвращает singleton-клиент Supabase.
 * Инициализируется при первом вызове, а не при загрузке модуля —
 * это позволяет Next.js строить приложение без реальных env-переменных.
 */
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
      );
    }

    // Используем service-role ключ для обхода RLS на серверной стороне
    _client = createClient(url, key);
  }
  return _client;
}

// Прокси-объект — вызывает getSupabase() при первом обращении к свойству
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});
