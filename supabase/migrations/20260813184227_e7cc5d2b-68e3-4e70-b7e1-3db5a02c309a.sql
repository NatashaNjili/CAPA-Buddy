
CREATE OR REPLACE FUNCTION public.verify_admin_pin(_access_token text, _pin text)
RETURNS TABLE (id uuid, name text, email text, role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT a.id, a.name, a.email, a.role
  FROM public.admins a
  WHERE a.access_token = _access_token
    AND a.pin_hash = crypt(lower(trim(_pin)), a.pin_hash);
$$;

REVOKE ALL ON FUNCTION public.verify_admin_pin(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text, text) TO service_role;
