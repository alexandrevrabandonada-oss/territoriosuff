-- Private, unvalidated original Aurassure/UFF API captures.
-- DO NOT merge into INEA tables or expose these payloads through PostgREST.
CREATE TABLE IF NOT EXISTS public.aurassure_api_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fetched_at timestamptz NOT NULL DEFAULT now(),
  source_system text NOT NULL DEFAULT 'AURASSURE_UFF' CHECK (source_system = 'AURASSURE_UFF'),
  operation text NOT NULL CHECK (operation IN ('stations', 'readings')),
  request_meta jsonb NOT NULL,
  response_json jsonb NOT NULL,
  response_text text NOT NULL, -- preserve exact provider response text for SHA-256 verification
  response_sha256 text NOT NULL CHECK (response_sha256 ~ '^[0-9a-f]{64}$'),
  validation_status text NOT NULL DEFAULT 'pending_schema_and_metrology_review'
    CHECK (validation_status IN ('pending_schema_and_metrology_review', 'reviewed', 'rejected'))
);
CREATE INDEX IF NOT EXISTS idx_aurassure_snapshots_fetched_at ON public.aurassure_api_snapshots (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_aurassure_snapshots_operation ON public.aurassure_api_snapshots (operation, fetched_at DESC);
ALTER TABLE public.aurassure_api_snapshots ENABLE ROW LEVEL SECURITY;
-- Deliberately no SELECT policy for public roles.
REVOKE ALL ON TABLE public.aurassure_api_snapshots FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.aurassure_api_snapshots TO service_role;
COMMENT ON TABLE public.aurassure_api_snapshots IS
  'Original Aurassure/UFF API JSON and text hashes; private and unvalidated. Separate from official INEA datasets.';
