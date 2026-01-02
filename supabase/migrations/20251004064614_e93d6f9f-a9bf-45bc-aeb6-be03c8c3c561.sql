-- Fix search_path mutable warning by setting search_path on functions
ALTER FUNCTION public.owns_collection_account(_account_id uuid, _user_id uuid) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;