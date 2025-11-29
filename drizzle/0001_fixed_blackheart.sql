CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"api_token" text,
	CONSTRAINT "users_api_token_unique" UNIQUE("api_token")
);
--> statement-breakpoint
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "anotacoes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "faturas" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "installment_anticipations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orcamentos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pagador_shares" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pagadores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_insights" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "anotacoes" CASCADE;--> statement-breakpoint
DROP TABLE "faturas" CASCADE;--> statement-breakpoint
DROP TABLE "installment_anticipations" CASCADE;--> statement-breakpoint
DROP TABLE "orcamentos" CASCADE;--> statement-breakpoint
DROP TABLE "pagador_shares" CASCADE;--> statement-breakpoint
DROP TABLE "pagadores" CASCADE;--> statement-breakpoint
DROP TABLE "saved_insights" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "cartoes" DROP CONSTRAINT "cartoes_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cartoes" DROP CONSTRAINT "cartoes_conta_id_contas_id_fk";
--> statement-breakpoint
ALTER TABLE "categorias" DROP CONSTRAINT "categorias_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "contas" DROP CONSTRAINT "contas_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_antecipacao_id_installment_anticipations_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_pagador_id_pagadores_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_cartao_id_cartoes_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_conta_id_contas_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_categoria_id_categorias_id_fk";
--> statement-breakpoint
ALTER TABLE "cartoes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cartoes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "categorias" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "categorias" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contas" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contas" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "cartao_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "conta_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "categoria_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "pagador_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "flag" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "limit" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "closing_day" integer;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "due_day" integer;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "balance" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "condition" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "amount" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "purchase_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "transaction_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "installment_count" integer;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "period" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "current_installment" integer;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "recurrence_count" integer;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "is_settled" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas" ADD CONSTRAINT "contas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_cartao_id_cartoes_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_conta_id_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "nome";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "dt_fechamento";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "dt_vencimento";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "anotacao";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "limite";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "bandeira";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "logo";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "conta_id";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "nome";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "tipo";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "icone";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "nome";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "tipo_conta";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "anotacao";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "logo";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "saldo_inicial";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "excluir_do_saldo";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "condicao";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "nome";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "forma_pagamento";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "anotacao";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "valor";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "data_compra";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "tipo_transacao";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "qtde_parcela";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "periodo";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "parcela_atual";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "qtde_recorrencia";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "data_vencimento";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "dt_pagamento_boleto";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "realizado";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "dividido";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "antecipado";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "antecipacao_id";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "series_id";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "transfer_id";