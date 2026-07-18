-- Admin geral: função is_admin() + políticas RLS atualizadas

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Quotes
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
CREATE POLICY "Users can view own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
CREATE POLICY "Users can update own quotes"
  ON public.quotes FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
CREATE POLICY "Users can delete own quotes"
  ON public.quotes FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Quote items
DROP POLICY IF EXISTS "Users can view own quote items" ON public.quote_items;
CREATE POLICY "Users can view own quote items"
  ON public.quote_items FOR SELECT
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own quote items" ON public.quote_items;
CREATE POLICY "Users can update own quote items"
  ON public.quote_items FOR UPDATE
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own quote items" ON public.quote_items;
CREATE POLICY "Users can delete own quote items"
  ON public.quote_items FOR DELETE
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );
