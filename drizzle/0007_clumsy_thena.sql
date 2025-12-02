ALTER TABLE "lancamentos" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "transfer_id" uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD COLUMN "veiculo_id" uuid;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE cascade ON UPDATE cascade;