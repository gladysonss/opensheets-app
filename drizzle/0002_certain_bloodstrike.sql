CREATE TABLE "faturas" (
	"id" text PRIMARY KEY NOT NULL,
	"period" text NOT NULL,
	"status" text NOT NULL,
	"total" text DEFAULT '0' NOT NULL,
	"user_id" text NOT NULL,
	"cartao_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_anticipations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conta_id" text NOT NULL,
	"total_amount" text NOT NULL,
	"fee" text,
	"anticipation_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orcamentos" (
	"id" text PRIMARY KEY NOT NULL,
	"period" text NOT NULL,
	"amount" text NOT NULL,
	"user_id" text NOT NULL,
	"categoria_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagador_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"pagador_id" text NOT NULL,
	"shared_with_user_id" text NOT NULL,
	"role" text NOT NULL,
	"share_code" text,
	CONSTRAINT "pagador_shares_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "pagadores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"status" text,
	"note" text,
	"is_auto_send" integer DEFAULT 0,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_insights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"insight" text NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "anticipation_id" text;--> statement-breakpoint
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartao_id_cartoes_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_anticipations" ADD CONSTRAINT "installment_anticipations_conta_id_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD CONSTRAINT "pagador_shares_pagador_id_pagadores_id_fk" FOREIGN KEY ("pagador_id") REFERENCES "public"."pagadores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagador_shares" ADD CONSTRAINT "pagador_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagadores" ADD CONSTRAINT "pagadores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insights" ADD CONSTRAINT "saved_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_pagador_id_pagadores_id_fk" FOREIGN KEY ("pagador_id") REFERENCES "public"."pagadores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_anticipation_id_installment_anticipations_id_fk" FOREIGN KEY ("anticipation_id") REFERENCES "public"."installment_anticipations"("id") ON DELETE set null ON UPDATE no action;