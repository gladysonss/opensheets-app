CREATE TABLE "abastecimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"veiculo_id" uuid NOT NULL,
	"data" date NOT NULL,
	"odometro" integer NOT NULL,
	"litros" numeric(10, 3) NOT NULL,
	"preco_litro" numeric(10, 3) NOT NULL,
	"valor_total" numeric(12, 2) NOT NULL,
	"tipo_combustivel" text NOT NULL,
	"tanque_cheio" boolean DEFAULT true NOT NULL,
	"lancamento_id" uuid,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "veiculos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"marca" text,
	"modelo" text,
	"ano" integer,
	"placa" text,
	"cor" text,
	"renavam" text,
	"status" text DEFAULT 'active' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "veiculo_id" uuid;--> statement-breakpoint
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "series_id";--> statement-breakpoint
ALTER TABLE "lancamentos" DROP COLUMN "transfer_id";