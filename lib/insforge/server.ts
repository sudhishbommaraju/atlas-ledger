import { createClient } from "@insforge/sdk";

export const createServerClient = () => {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'http://localhost:7130',
    anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    isServerMode: true,
  });
};
