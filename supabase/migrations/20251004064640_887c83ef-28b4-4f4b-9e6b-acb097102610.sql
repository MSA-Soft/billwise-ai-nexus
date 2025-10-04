-- Fix remaining search_path mutable warning
ALTER FUNCTION public.handle_updated_at() SET search_path = public;