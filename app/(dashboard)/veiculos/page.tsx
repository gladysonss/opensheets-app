import { getVehicles, getCategories } from "./data";
import { VehicleFormDialog } from "@/components/veiculos/vehicle-form-dialog";
import { VehiclesActions } from "@/components/veiculos/vehicles-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, Plus, Edit, Eye, Trash2, Bike, Truck, Bus, MoreHorizontal } from "lucide-react";
import { type Veiculo } from "@/db/schema";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { contas, cartoes, pagadores } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VeiculosPage() {
  const user = await getUser();
  const [vehicles, userContas, userCartoes, userPagadores, categories] = await Promise.all([
    getVehicles(),
    db.query.contas.findMany({
      where: eq(contas.userId, user.id),
    }),
    db.query.cartoes.findMany({
      where: eq(cartoes.userId, user.id),
    }),
    db.query.pagadores.findMany({
      where: eq(pagadores.userId, user.id),
    }),
    getCategories(),
  ]);

  const contaOptions = userContas.map((c: any) => ({
    label: c.name,
    value: c.id,
    logo: c.logo,
  }));
  const cartaoOptions = userCartoes.map((c: any) => ({
    label: c.name,
    value: c.id,
    logo: c.logo,
  }));
  const vehicleOptions = vehicles.map((v: any) => ({
    label: v.name,
    value: v.id,
    lastOdometer: v.abastecimentos?.[0]?.odometer ?? 0,
  }));
  const pagadorOptions = userPagadores.map((p: any) => ({
    label: p.name,
    value: p.id,
    avatarUrl: p.avatarUrl,
    defaultSplitPercentage: p.defaultSplitPercentage,
  }));
  const categoryOptions = categories.map((c: any) => ({
    label: c.name,
    value: c.id,
    icon: c.icon,
    group: c.type,
  }));

  return (
    <div className="flex flex-col gap-6 w-full px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Veículos</h1>
        <p className="text-muted-foreground">
          Gerencie seus veículos e acompanhe abastecimentos e despesas.
        </p>
      </div>

      <div className="flex flex-row items-center justify-start gap-2">
        <VehicleFormDialog
          trigger={
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          }
        />
        <VehiclesActions
          vehicleOptions={vehicleOptions}
          contaOptions={contaOptions}
          cartaoOptions={cartaoOptions}
          pagadorOptions={pagadorOptions}
          categoryOptions={categoryOptions}
        />
      </div>

      {vehicles.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="flex flex-col items-center text-center max-w-sm text-sm text-muted-foreground">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Nenhum veículo cadastrado
            </h3>
            <p className="mb-4">
              Cadastre seu primeiro veículo para começar a acompanhar.
            </p>
            <VehicleFormDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {vehicles.map((vehicle: Veiculo) => {
             const Icon =
              vehicle.type === "motorcycle"
                ? Bike
                : vehicle.type === "truck"
                ? Truck
                : vehicle.type === "bus"
                ? Bus
                : vehicle.type === "other"
                ? MoreHorizontal
                : Car;

            return (
            <Card key={vehicle.id} className="overflow-hidden p-6">
              <div className="relative flex flex-col items-start">
                <div className="relative mb-3 flex size-16 items-center justify-center overflow-hidden rounded-full border-background bg-primary/10 shadow-sm">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold text-foreground">
                    {vehicle.name}
                  </h3>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge
                    variant={vehicle.status === "active" ? "default" : "outline"}
                    className={
                      vehicle.status === "active"
                        ? "bg-green-500 hover:bg-green-600 border-transparent"
                        : ""
                    }
                  >
                    {vehicle.status === "active"
                      ? "Ativo"
                      : vehicle.status === "sold"
                      ? "Vendido"
                      : "Inativo"}
                  </Badge>
                  {vehicle.plate && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {vehicle.plate}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-start justify-start gap-3 text-sm font-medium">
                <VehicleFormDialog
                  vehicle={{
                    id: vehicle.id,
                    name: vehicle.name,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    year: vehicle.year,
                    plate: vehicle.plate,
                    color: vehicle.color,
                    renavam: vehicle.renavam,
                    status: vehicle.status,
                    type: vehicle.type,
                    userId: vehicle.userId,
                    createdAt: vehicle.createdAt,
                    updatedAt: vehicle.updatedAt,
                  }}
                  trigger={
                    <button
                      type="button"
                      className="text-primary flex items-center gap-1 font-medium transition-opacity hover:opacity-80"
                    >
                      <Edit className="size-4" aria-hidden />
                      editar
                    </button>
                  }
                />

                <Link
                  href={`/veiculos/${vehicle.id}`}
                  className="text-primary flex items-center gap-1 font-medium transition-opacity hover:opacity-80"
                >
                  <Eye className="size-4" aria-hidden />
                  detalhes
                </Link>
              </div>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
