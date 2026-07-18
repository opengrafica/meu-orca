-- Trial de 3 dias para novos usuários (pagamento único após o período grátis)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, subscription_expires_at)
  VALUES (NEW.id, NEW.email, now() + interval '3 days');
  RETURN NEW;
END;
$$;
