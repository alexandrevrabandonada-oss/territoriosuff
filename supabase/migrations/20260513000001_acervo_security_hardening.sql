-- Migration: Acervo Security Hardening
-- Description: Updates RPCs to include status='published' and publish_at check.

CREATE OR REPLACE FUNCTION public.get_acervo_year_index()
RETURNS TABLE (
    year int,
    total int
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        EXTRACT(YEAR FROM published_at)::int as year,
        COUNT(*)::int as total
    FROM public.acervo_items
    WHERE status = 'published'
      AND (publish_at IS NULL OR publish_at <= now())
      AND published_at IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM published_at)
    ORDER BY year DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_acervo_by_year(p_year int, p_limit int DEFAULT 200)
RETURNS SETOF public.acervo_items
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM public.acervo_items
    WHERE status = 'published'
      AND (publish_at IS NULL OR publish_at <= now())
      AND EXTRACT(YEAR FROM published_at) = p_year
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT p_limit;
$$;
