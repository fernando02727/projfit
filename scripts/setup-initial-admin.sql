-- Script para configurar o primeiro usuário como admin
-- Execute este script APÓS se cadastrar no app

-- Atualiza o primeiro usuário cadastrado para ser admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Ou se você souber seu email específico, use:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
