CREATE TABLE "anotacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text,
	"descricao" text,
	"tipo" text DEFAULT 'nota' NOT NULL,
	"tasks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"api_token" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_api_token_unique" UNIQUE("api_token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "pagador_shares" DROP CONSTRAINT IF EXISTS "pagador_shares_share_code_unique";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "users_api_token_unique";--> statement-breakpoint
ALTER TABLE "cartoes" DROP CONSTRAINT IF EXISTS "cartoes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "categorias" DROP CONSTRAINT IF EXISTS "categorias_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contas" DROP CONSTRAINT IF EXISTS "contas_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "faturas" DROP CONSTRAINT IF EXISTS "faturas_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "faturas" DROP CONSTRAINT IF EXISTS "faturas_cartao_id_cartoes_id_fk";
--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP CONSTRAINT IF EXISTS "installment_anticipations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP CONSTRAINT IF EXISTS "installment_anticipations_conta_id_contas_id_fk";
--> statement-breakpoint
ALTER TABLE "pagador_shares" DROP CONSTRAINT IF EXISTS "pagador_shares_pagador_id_pagadores_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_pagador_id_pagadores_id_fk";
--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP CONSTRAINT IF EXISTS "installment_anticipations_pagador_id_pagadores_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_anticipation_id_installment_anticipations_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_conta_id_contas_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_categoria_id_categorias_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_pagador_id_pagadores_id_fk";
--> statement-breakpoint
ALTER TABLE "lancamentos" DROP CONSTRAINT IF EXISTS "lancamentos_cartao_id_cartoes_id_fk";
--> statement-breakpoint
ALTER TABLE "orcamentos" DROP CONSTRAINT IF EXISTS "orcamentos_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orcamentos" DROP CONSTRAINT IF EXISTS "orcamentos_categoria_id_categorias_id_fk";
--> statement-breakpoint
ALTER TABLE "pagador_shares" DROP CONSTRAINT IF EXISTS "pagador_shares_shared_with_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pagadores" DROP CONSTRAINT IF EXISTS "pagadores_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_insights" DROP CONSTRAINT IF EXISTS "saved_insights_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cartoes" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "cartoes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "categorias" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "categorias" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "contas" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "contas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "faturas" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "faturas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "faturas" ALTER COLUMN "cartao_id" SET DATA TYPE uuid USING cartao_id::uuid;--> statement-breakpoint
ALTER TABLE "faturas" ALTER COLUMN "cartao_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "conta_id" SET DATA TYPE uuid USING conta_id::uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "categoria_id" SET DATA TYPE uuid USING categoria_id::uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "pagador_id" SET DATA TYPE uuid USING pagador_id::uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ALTER COLUMN "cartao_id" SET DATA TYPE uuid USING cartao_id::uuid;--> statement-breakpoint
ALTER TABLE "orcamentos" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "orcamentos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "orcamentos" ALTER COLUMN "categoria_id" SET DATA TYPE uuid USING categoria_id::uuid;--> statement-breakpoint
ALTER TABLE "orcamentos" ALTER COLUMN "categoria_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pagador_shares" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "pagador_shares" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "pagador_shares" ALTER COLUMN "pagador_id" SET DATA TYPE uuid USING pagador_id::uuid;--> statement-breakpoint
ALTER TABLE "pagador_shares" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pagador_shares" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "is_auto_send" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "is_auto_send" SET DATA TYPE boolean USING is_auto_send::boolean;--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "is_auto_send" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "pagadores" ALTER COLUMN "is_auto_send" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insights" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "saved_insights" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "saved_insights" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saved_insights" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "nome" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "dt_fechamento" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "dt_vencimento" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "anotacao" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "limite" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "bandeira" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "conta_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "nome" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "tipo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "icone" text;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "nome" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "tipo_conta" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "anotacao" text;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "logo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "saldo_inicial" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "excluir_do_saldo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "faturas" ADD COLUMN "status_pagamento" text;--> statement-breakpoint
ALTER TABLE "faturas" ADD COLUMN "periodo" text;--> statement-breakpoint
ALTER TABLE "faturas" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "series_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "periodo_antecipacao" text NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "data_antecipacao" date NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "parcelas_antecipadas" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "valor_total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "qtde_parcelas" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "desconto" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "lancamento_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "pagador_id" uuid;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "categoria_id" uuid;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "anotacao" text;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "condicao" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "nome" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "forma_pagamento" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "anotacao" text;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "valor" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "data_compra" date NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "tipo_transacao" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "qtde_parcela" smallint;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "periodo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "parcela_atual" smallint;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "qtde_recorrencia" integer;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "data_vencimento" date;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "dt_pagamento_boleto" date;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "realizado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "dividido" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "antecipado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "antecipacao_id" uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "transfer_id" uuid;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "valor" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "periodo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD COLUMN "permission" text DEFAULT 'read' NOT NULL;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD COLUMN "created_by_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "nome" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "anotacao" text;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "share_code" text DEFAULT substr(encode(gen_random_bytes(24), 'base64'), 1, 24) NOT NULL;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "last_mail" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD COLUMN "period" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD COLUMN "model_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD COLUMN "data" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "accountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "providerId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "accessToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refreshToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "idToken" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "accessTokenExpiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refreshTokenExpiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "createdAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updatedAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "anotacoes" ADD CONSTRAINT "anotacoes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_conta_id_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contas"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas" ADD CONSTRAINT "contas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartao_id_cartoes_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_pagador_id_pagadores_id_fk" FOREIGN KEY ("pagador_id") REFERENCES "public"."pagadores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_antecipacao_id_installment_anticipations_id_fk" FOREIGN KEY ("antecipacao_id") REFERENCES "public"."installment_anticipations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_conta_id_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contas"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_pagador_id_pagadores_id_fk" FOREIGN KEY ("pagador_id") REFERENCES "public"."pagadores"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_cartao_id_cartoes_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD CONSTRAINT "pagador_shares_shared_with_user_id_user_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD CONSTRAINT "pagador_shares_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagadores" ADD CONSTRAINT "pagadores_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD CONSTRAINT "saved_insights_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "installment_anticipations_series_id_idx" ON "installment_anticipations" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "installment_anticipations_user_id_idx" ON "installment_anticipations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pagador_shares_unique" ON "pagador_shares" USING btree ("pagador_id","shared_with_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pagadores_share_code_key" ON "pagadores" USING btree ("share_code");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_insights_user_period_idx" ON "saved_insights" USING btree ("user_id","period");--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "flag";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "limit";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "closing_day";--> statement-breakpoint
ALTER TABLE "cartoes" DROP COLUMN "due_day";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "categorias" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "balance";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "faturas" DROP COLUMN "period";--> statement-breakpoint
ALTER TABLE "faturas" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "faturas" DROP COLUMN "total";--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP COLUMN "conta_id";--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP COLUMN "fee";--> statement-breakpoint
ALTER TABLE "installment_anticipations" DROP COLUMN "anticipation_date";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "condition";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "payment_method";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "purchase_date";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "transaction_type";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "installment_count";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "period";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "current_installment";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "recurrence_count";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "due_date";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "is_settled";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "anticipation_id";--> statement-breakpoint
ALTER TABLE "orcamentos" DROP COLUMN "period";--> statement-breakpoint
ALTER TABLE "orcamentos" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "pagador_shares" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "pagador_shares" DROP COLUMN "share_code";--> statement-breakpoint
ALTER TABLE "pagadores" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "pagadores" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "saved_insights" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "saved_insights" DROP COLUMN "insight";--> statement-breakpoint
ALTER TABLE "saved_insights" DROP COLUMN "prompt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "api_token";