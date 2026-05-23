import { createClient } from "@insforge/sdk";

export const createBrowserClient = () => {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'http://localhost:7130',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    isServerMode: false,
  });
};
