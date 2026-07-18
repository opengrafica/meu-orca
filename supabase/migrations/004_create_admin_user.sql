-- Script para promover usuário existente a admin (executar no SQL Editor)
-- Substitua o e-mail pelo usuário desejado

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'seu-email@exemplo.com';
