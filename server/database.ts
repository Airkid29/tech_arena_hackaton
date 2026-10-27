import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigurationError';
  }
}

export class DatabaseOperationError extends Error {
  constructor(operation: string, cause: unknown) {
    super(`Échec de l'opération base de données : ${operation}`);
    this.name = 'DatabaseOperationError';
    this.cause = cause;
  }
}

export function getDatabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new DatabaseConfigurationError(
      'Supabase non configuré : définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY côté serveur.'
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return client;
}

export function unwrapDatabaseResult<T>(
  operation: string,
  result: { data: T; error: { message: string } | null }
): T {
  if (result.error) {
    throw new DatabaseOperationError(operation, result.error);
  }
  return result.data;
}
