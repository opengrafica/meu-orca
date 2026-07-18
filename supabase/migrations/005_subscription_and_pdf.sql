-- Assinatura anual + personalização PDF

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_primary_color TEXT DEFAULT '#2563eb',
  ADD COLUMN IF NOT EXISTS pdf_footer_text TEXT,
  ADD COLUMN IF NOT EXISTS pdf_show_watermark BOOLEAN DEFAULT true;

-- Pagamentos registrados
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Service can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update payments"
  ON public.payments FOR UPDATE
  USING (true);

-- Ativa assinatura por 1 ano
CREATE OR REPLACE FUNCTION public.activate_subscription(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_expiry TIMESTAMPTZ;
  new_expiry TIMESTAMPTZ;
BEGIN
  SELECT subscription_expires_at INTO current_expiry
  FROM profiles WHERE user_id = p_user_id;

  IF current_expiry IS NOT NULL AND current_expiry > now() THEN
    new_expiry := current_expiry + interval '1 year';
  ELSE
    new_expiry := now() + interval '1 year';
  END IF;

  UPDATE profiles
  SET subscription_expires_at = new_expiry
  WHERE user_id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_subscription(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_subscription(UUID) TO service_role;

-- Ativar assinatura existente para usuários atuais (1 ano)
UPDATE public.profiles
SET subscription_expires_at = now() + interval '1 year'
WHERE subscription_expires_at IS NULL;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, subscription_expires_at)
  VALUES (NEW.id, NEW.email, now() + interval '7 days');
  RETURN NEW;
END;
$$;
