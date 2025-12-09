CREATE TABLE "manutencoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"veiculo_id" uuid NOT NULL,
	"data" date NOT NULL,
	"odometro" integer NOT NULL,
	"tipo" text NOT NULL,
	"nome_servico" text NOT NULL,
	"descricao" text,
	"pecas" text,
	"mao_obra" numeric(12, 2),
	"custo_pecas" numeric(12, 2),
	"valor_total" numeric(12, 2) NOT NULL,
	"oficina" text,
	"proxima_km" integer,
	"proxima_data" date,
	"lancamento_id" uuid,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abastecimentos" DROP CONSTRAINT IF EXISTS "abastecimentos_lancamento_id_lancamentos_id_fk";
--> statement-breakpoint
ALTER TABLE "pagadores" ADD COLUMN "default_split_percentage" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "veiculos" ADD COLUMN "type" text DEFAULT 'car' NOT NULL;--> statement-breakpoint
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE cascade ON UPDATE no action;