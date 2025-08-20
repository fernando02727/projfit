-- Script para definir fernando.sousa027@gmail.com como administrador
-- Este script pode ser executado antes ou depois do cadastro

-- Primeiro, vamos garantir que existe um perfil para este email
-- Se o usuário já se cadastrou via Supabase Auth, vamos atualizar
-- Se ainda não se cadastrou, vamos criar um perfil que será linkado quando ele se cadastrar

-- Atualizar perfil existente para admin (caso já tenha se cadastrado)
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'fernando.sousa027@gmail.com';

-- Se não existir perfil ainda, criar um que será usado quando se cadastrar
INSERT INTO user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'fernando.sousa027@gmail.com',
  'Fernando Sousa',
  'admin',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE email = 'fernando.sousa027@gmail.com'
);

-- Verificar se foi criado/atualizado corretamente
SELECT email, full_name, role, created_at 
FROM user_profiles 
WHERE email = 'fernando.sousa027@gmail.com';
