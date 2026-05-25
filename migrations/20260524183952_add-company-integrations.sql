-- company_integrations: stores encrypted API credentials for live data sources
CREATE TABLE IF NOT EXISTS company_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('stripe', 'plaid', 'netsuite')),
  api_key_encrypted text,
  api_secret_encrypted text,
  access_token_encrypted text,
  realm_id text,
  last_connected_at timestamp,
  connection_status text DEFAULT 'disconnected'
    CHECK (connection_status IN ('connected', 'failed', 'disconnected')),
  connection_error text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(company_id, integration_type)
);