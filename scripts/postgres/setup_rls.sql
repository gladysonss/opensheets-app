-- ============================================================================
-- CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY) PARA OPENSHEETS
-- ============================================================================
--
-- IMPORTANTE:
-- Este projeto utiliza "Better Auth" com Drizzle ORM, o que significa que a 
-- autenticação é gerenciada pela aplicação (Next.js), e não pelo Supabase Auth.
--
-- Por isso, a aplicação se conecta ao banco com um usuário privilegiado 
-- (geralmente 'postgres' ou 'service_role') e o RLS padrão do Supabase 
-- (usando auth.uid()) NÃO FUNCIONARÁ da maneira tradicional.
--
-- O objetivo deste script é:
-- 1. Habilitar RLS em todas as tabelas (para segurança e remover alertas).
-- 2. Criar políticas que permitem acesso TOTAL para o usuário da aplicação.
-- 3. Bloquear acesso público (anon) por padrão.

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagadores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagador_shares" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cartoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "faturas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orcamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anotacoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_insights" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installment_anticipations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lancamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "veiculos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "abastecimentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manutencoes" ENABLE ROW LEVEL SECURITY;

-- 2. Criar política de "Acesso Total" para o Service Role / Postgres
-- Isso permite que sua aplicação (que usa a connection string do Supabase)
-- continue funcionando perfeitamente.

-- Função auxiliar para criar política se não existir (evita erros ao rodar 2x)
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'user', 'account', 'session', 'verification', 
        'contas', 'categorias', 'pagadores', 'pagador_shares', 
        'cartoes', 'faturas', 'orcamentos', 'anotacoes', 
        'saved_insights', 'installment_anticipations', 
        'lancamentos', 'veiculos', 'abastecimentos', 'manutencoes'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Política para permitir tudo para roles autenticadas (service_role, postgres)
        -- O usuário 'anon' (público) NÃO terá acesso.
        EXECUTE format('
            DROP POLICY IF EXISTS "Allow full access for app" ON %I;
            CREATE POLICY "Allow full access for app" ON %I
                FOR ALL
                TO postgres, service_role, authenticated
                USING (true)
                WITH CHECK (true);
        ', t, t);
    END LOOP;
END $$;

-- 3. (Opcional) Se você quiser ser ainda mais restrito e garantir que NINGUÉM
-- acesse via API pública do Supabase (PostgREST), você já está protegido,
-- pois a política acima não inclui o role 'anon'.

RAISE NOTICE '✅ RLS configurado com sucesso para compatibilidade com Better Auth.';
